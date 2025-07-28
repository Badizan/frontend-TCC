import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

interface Brand {
    codigo: string;
    nome: string;
}

interface Model {
    codigo: string;
    nome: string;
}

interface Year {
    codigo: string;
    nome: string;
}

export const useVehicleData = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [models, setModels] = useState<Model[]>([]);
    const [years, setYears] = useState<Year[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Buscar marcas
    const fetchBrands = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🔍 useVehicleData: Buscando marcas...');

            const brandsData = await api.getBrands();
            setBrands(brandsData);

            console.log(`✅ useVehicleData: ${brandsData.length} marcas carregadas`);
        } catch (err: any) {
            console.error('❌ useVehicleData: Erro ao buscar marcas:', err);
            setError(err.message || 'Erro ao carregar marcas');
        } finally {
            setLoading(false);
        }
    }, []);

    // Buscar modelos de uma marca
    const fetchModels = useCallback(async (brandCode: string) => {
        if (!brandCode) {
            setModels([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            console.log(`🔍 useVehicleData: Buscando modelos da marca ${brandCode}...`);

            const modelsData = await api.getModels(brandCode);
            setModels(modelsData);

            console.log(`✅ useVehicleData: ${modelsData.length} modelos carregados`);
            return modelsData; // Retornar os dados para uso em cascata
        } catch (err: any) {
            console.error('❌ useVehicleData: Erro ao buscar modelos:', err);
            setError(err.message || 'Erro ao carregar modelos');
            setModels([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Buscar anos de um modelo
    const fetchYears = useCallback(async (brandCode: string, modelCode: string) => {
        if (!brandCode || !modelCode) {
            setYears([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            console.log(`🔍 useVehicleData: Buscando anos do modelo ${modelCode}...`);

            const yearsData = await api.getYears(brandCode, modelCode);
            setYears(yearsData);

            console.log(`✅ useVehicleData: ${yearsData.length} anos carregados`);
        } catch (err: any) {
            console.error('❌ useVehicleData: Erro ao buscar anos:', err);
            setError(err.message || 'Erro ao carregar anos');
            setYears([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Limpar dados
    const clearData = useCallback(() => {
        setModels([]);
        setYears([]);
        setError(null);
    }, []);

    // Carregar marcas automaticamente quando o hook é inicializado
    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    return {
        brands,
        models,
        years,
        loading,
        error,
        fetchBrands,
        fetchModels,
        fetchYears,
        clearData,
    };
}; 