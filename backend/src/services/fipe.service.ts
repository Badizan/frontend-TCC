import axios from 'axios';

interface FipeBrand {
    codigo: string;
    nome: string;
}

interface FipeModel {
    codigo: string;
    nome: string;
}

interface FipeYear {
    codigo: string;
    nome: string;
}

export class FipeService {
    private baseUrl = 'https://parallelum.com.br/fipe/api/v1';

    /**
     * Busca todas as marcas disponíveis na tabela FIPE
     */
    async getBrands(): Promise<FipeBrand[]> {
        try {
            console.log('🔍 FipeService: Buscando marcas...');
            const response = await axios.get(`${this.baseUrl}/carros/marcas`);

            // Ordenar marcas alfabeticamente
            const sortedBrands = response.data.sort((a: FipeBrand, b: FipeBrand) =>
                a.nome.localeCompare(b.nome, 'pt-BR')
            );

            console.log(`✅ FipeService: ${sortedBrands.length} marcas encontradas`);
            return sortedBrands;
        } catch (error) {
            console.error('❌ FipeService: Erro ao buscar marcas:', error);
            throw new Error('Erro ao buscar marcas de veículos');
        }
    }

    /**
     * Busca modelos de uma marca específica
     */
    async getModels(brandCode: string): Promise<FipeModel[]> {
        try {
            console.log(`🔍 FipeService: Buscando modelos da marca ${brandCode}...`);
            const response = await axios.get(`${this.baseUrl}/carros/marcas/${brandCode}/modelos`);

            // Ordenar modelos alfabeticamente
            const sortedModels = response.data.modelos.sort((a: FipeModel, b: FipeModel) =>
                a.nome.localeCompare(b.nome, 'pt-BR')
            );

            console.log(`✅ FipeService: ${sortedModels.length} modelos encontrados para marca ${brandCode}`);
            return sortedModels;
        } catch (error) {
            console.error('❌ FipeService: Erro ao buscar modelos:', error);
            throw new Error('Erro ao buscar modelos de veículos');
        }
    }

    /**
     * Busca anos de um modelo específico
     */
    async getYears(brandCode: string, modelCode: string): Promise<FipeYear[]> {
        try {
            console.log(`🔍 FipeService: Buscando anos do modelo ${modelCode} da marca ${brandCode}...`);
            const response = await axios.get(`${this.baseUrl}/carros/marcas/${brandCode}/modelos/${modelCode}/anos`);

            // Ordenar anos em ordem decrescente (mais recente primeiro)
            const sortedYears = response.data.sort((a: FipeYear, b: FipeYear) =>
                parseInt(b.codigo) - parseInt(a.codigo)
            );

            console.log(`✅ FipeService: ${sortedYears.length} anos encontrados para modelo ${modelCode}`);
            return sortedYears;
        } catch (error) {
            console.error('❌ FipeService: Erro ao buscar anos:', error);
            throw new Error('Erro ao buscar anos do modelo');
        }
    }

    /**
     * Busca informações completas de um veículo (preço, etc.)
     */
    async getVehicleInfo(brandCode: string, modelCode: string, yearCode: string) {
        try {
            console.log(`🔍 FipeService: Buscando informações do veículo...`);
            const response = await axios.get(`${this.baseUrl}/carros/marcas/${brandCode}/modelos/${modelCode}/anos/${yearCode}`);

            console.log('✅ FipeService: Informações do veículo obtidas com sucesso');
            return response.data;
        } catch (error) {
            console.error('❌ FipeService: Erro ao buscar informações do veículo:', error);
            throw new Error('Erro ao buscar informações do veículo');
        }
    }

    /**
     * Busca marcas com cache para melhor performance
     */
    private brandsCache: { data: FipeBrand[]; timestamp: number } | null = null;
    private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

    async getBrandsWithCache(): Promise<FipeBrand[]> {
        const now = Date.now();

        // Verificar se o cache ainda é válido
        if (this.brandsCache && (now - this.brandsCache.timestamp) < this.CACHE_DURATION) {
            console.log('📦 FipeService: Retornando marcas do cache');
            return this.brandsCache.data;
        }

        // Buscar dados frescos
        const brands = await this.getBrands();

        // Atualizar cache
        this.brandsCache = {
            data: brands,
            timestamp: now
        };

        return brands;
    }

    /**
     * Cache para modelos por marca
     */
    private modelsCache: Map<string, { data: FipeModel[]; timestamp: number }> = new Map();

    async getModelsWithCache(brandCode: string): Promise<FipeModel[]> {
        const now = Date.now();
        const cacheKey = brandCode;

        // Verificar se o cache ainda é válido
        const cached = this.modelsCache.get(cacheKey);
        if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
            console.log(`📦 FipeService: Retornando modelos da marca ${brandCode} do cache`);
            return cached.data;
        }

        // Buscar dados frescos
        const models = await this.getModels(brandCode);

        // Atualizar cache
        this.modelsCache.set(cacheKey, {
            data: models,
            timestamp: now
        });

        return models;
    }
} 