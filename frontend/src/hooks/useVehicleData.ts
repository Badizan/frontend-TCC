import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { getMockBrands, getMockModels, getMockYears, MockBrand, MockModel, MockYear } from '../services/mockData';

// Usar as interfaces dos dados mockados
type Brand = MockBrand;
type Model = MockModel;
type Year = MockYear;

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
            console.error('❌ useVehicleData: Erro ao buscar marcas da API, usando dados mockados:', err);

            try {
                console.log('🔄 useVehicleData: Carregando dados mockados...');
                const mockBrands = await getMockBrands();
                setBrands(mockBrands);
                console.log(`✅ useVehicleData: ${mockBrands.length} marcas mockadas carregadas`);
            } catch (mockErr: any) {
                console.error('❌ useVehicleData: Erro ao carregar dados mockados:', mockErr);
                setError('Erro ao carregar marcas (API e dados mockados indisponíveis)');
            }
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
            console.error('❌ useVehicleData: Erro ao buscar modelos da API, usando dados mockados:', err);

            try {
                console.log(`🔄 useVehicleData: Carregando modelos mockados da marca ${brandCode}...`);
                const mockModels = await getMockModels(brandCode);
                setModels(mockModels);
                console.log(`✅ useVehicleData: ${mockModels.length} modelos mockados carregados`);
                return mockModels;
            } catch (mockErr: any) {
                console.error('❌ useVehicleData: Erro ao carregar modelos mockados:', mockErr);
                setError('Erro ao carregar modelos (API e dados mockados indisponíveis)');
                setModels([]);
                return [];
            }
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
            console.error('❌ useVehicleData: Erro ao buscar anos da API, usando dados mockados:', err);

            try {
                console.log(`🔄 useVehicleData: Carregando anos mockados do modelo ${modelCode}...`);
                const mockYears = await getMockYears(brandCode, modelCode);
                setYears(mockYears);
                console.log(`✅ useVehicleData: ${mockYears.length} anos mockados carregados`);
            } catch (mockErr: any) {
                console.error('❌ useVehicleData: Erro ao carregar anos mockados:', mockErr);
                setError('Erro ao carregar anos (API e dados mockados indisponíveis)');
                setYears([]);
            }
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