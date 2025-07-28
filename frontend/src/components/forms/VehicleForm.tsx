import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vehicle, VehicleType } from '../../types';
import { useAppStore } from '../../store';
import { useVehicleData } from '../../hooks/useVehicleData';

interface VehicleFormProps {
  initialData?: Partial<Vehicle>;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  
  const [formData, setFormData] = useState({
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    year: initialData?.year || new Date().getFullYear(),
    licensePlate: initialData?.licensePlate || '',
    type: (initialData?.type as VehicleType) || 'CAR',
    color: initialData?.color || '',
    mileage: initialData?.mileage || 0,
    ownerId: initialData?.ownerId || user?.id || '',
  });

  // Estados para os códigos da FIPE
  const [selectedBrandCode, setSelectedBrandCode] = useState<string>('');
  const [selectedModelCode, setSelectedModelCode] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  // Hook para dados de veículos
  const { brands, models, years, loading: vehicleDataLoading, error: vehicleDataError, fetchModels, fetchYears, clearData } = useVehicleData();

  // Efeito para carregar dados da FIPE quando estiver editando
  useEffect(() => {
    if (initialData?.id && initialData.brand && initialData.model && brands.length > 0) {
      console.log('🔄 VehicleForm: Carregando dados da FIPE para edição...');
      
      // Buscar o código da marca baseado no nome
      const brand = brands.find(b => b.nome.toLowerCase() === initialData.brand.toLowerCase());
      if (brand) {
        console.log(`✅ VehicleForm: Marca encontrada: ${brand.nome} (${brand.codigo})`);
        setSelectedBrandCode(brand.codigo);
        
        // Buscar modelos da marca
        fetchModels(brand.codigo).then((modelsData) => {
          // Buscar o código do modelo baseado no nome
          const model = modelsData.find(m => m.nome.toLowerCase() === initialData.model.toLowerCase());
          if (model) {
            console.log(`✅ VehicleForm: Modelo encontrado: ${model.nome} (${model.codigo})`);
            setSelectedModelCode(model.codigo);
            // Buscar anos do modelo
            fetchYears(brand.codigo, model.codigo);
          } else {
            console.warn(`⚠️ VehicleForm: Modelo não encontrado: ${initialData.model}`);
          }
        });
      } else {
        console.warn(`⚠️ VehicleForm: Marca não encontrada: ${initialData.brand}`);
      }
    }
  }, [initialData, brands, fetchModels, fetchYears]);

  // Efeito para carregar cor selecionada quando estiver editando
  useEffect(() => {
    if (initialData?.color) {
      console.log('🔄 VehicleForm: Carregando cor para edição:', initialData.color);
      
      // Buscar o código da cor baseado no nome
      const color = vehicleColors.find(c => c.label.toLowerCase() === initialData.color.toLowerCase());
      if (color) {
        console.log(`✅ VehicleForm: Cor encontrada: ${color.label} (${color.value})`);
        setSelectedColor(color.value);
      } else {
        // Se não encontrar a cor exata, definir como "OUTRO"
        console.log(`⚠️ VehicleForm: Cor não encontrada na lista, definindo como "Outro": ${initialData.color}`);
        setSelectedColor('OUTRO');
      }
    }
  }, [initialData?.color]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Efeito para carregar modelos quando a marca é selecionada
  useEffect(() => {
    if (selectedBrandCode) {
      fetchModels(selectedBrandCode);
      // Limpar seleções dependentes apenas se não estiver editando
      if (!initialData?.id) {
        setSelectedModelCode('');
        setFormData(prev => ({ ...prev, model: '' }));
      }
    } else {
      clearData();
    }
  }, [selectedBrandCode, fetchModels, clearData, initialData?.id]);

  // Efeito para carregar anos quando o modelo é selecionado
  useEffect(() => {
    if (selectedBrandCode && selectedModelCode) {
      fetchYears(selectedBrandCode, selectedModelCode);
    }
  }, [selectedBrandCode, selectedModelCode, fetchYears]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const isEditing = !!initialData?.id;

    // Validar marca
    if (!formData.brand.trim()) {
      newErrors.brand = 'Marca é obrigatória';
    } else if (formData.brand.length < 2) {
      newErrors.brand = 'Marca deve ter pelo menos 2 caracteres';
    }

    // Validar modelo
    if (!formData.model.trim()) {
      newErrors.model = 'Modelo é obrigatório';
    } else if (formData.model.length < 2) {
      newErrors.model = 'Modelo deve ter pelo menos 2 caracteres';
    }

    // Validar ano
    const currentYear = new Date().getFullYear();
    if (formData.year < 1900 || formData.year > currentYear + 1) {
      newErrors.year = `Ano deve estar entre 1900 e ${currentYear + 1}`;
    }

    // Validar placa
    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'Placa é obrigatória';
    } else {
      const plateRegex = /^[A-Z]{3}-?[0-9]{4}$|^[A-Z]{3}-?[0-9][A-Z][0-9]{2}$/;
      if (!plateRegex.test(formData.licensePlate.toUpperCase())) {
        newErrors.licensePlate = 'Formato de placa inválido (ex: ABC-1234 ou ABC-1D23)';
      }
    }

    // Validar quilometragem
    if (formData.mileage < 0) {
      newErrors.mileage = 'Quilometragem não pode ser negativa';
    }

    // Se estiver editando e os dados da FIPE não carregaram ainda, permitir envio
    if (isEditing && (!selectedBrandCode || !selectedModelCode)) {
      console.log('🔄 VehicleForm: Editando - permitindo envio sem códigos FIPE');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // Formatação especial para placa
    if (name === 'licensePlate') {
      // Remove caracteres não alfanuméricos e converte para maiúsculo
      processedValue = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      
      // Aplica formatação ABC-1234 ou ABC-1A23
      if (processedValue.length > 3) {
        processedValue = processedValue.slice(0, 3) + '-' + processedValue.slice(3, 7);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'mileage' ? Number(value) : processedValue,
    }));

    // Limpar erro quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handler específico para seleção de marca da FIPE
  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brandCode = e.target.value;
    setSelectedBrandCode(brandCode);
    
    // Encontrar o nome da marca selecionada
    const selectedBrand = brands.find(brand => brand.codigo === brandCode);
    if (selectedBrand) {
      setFormData(prev => ({ ...prev, brand: selectedBrand.nome }));
    }
    
    // Limpar erro da marca
    if (errors.brand) {
      setErrors(prev => ({ ...prev, brand: '' }));
    }
  };

  // Handler específico para seleção de modelo da FIPE
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modelCode = e.target.value;
    setSelectedModelCode(modelCode);
    
    // Encontrar o nome do modelo selecionado
    const selectedModel = models.find(model => model.codigo === modelCode);
    if (selectedModel) {
      setFormData(prev => ({ ...prev, model: selectedModel.nome }));
    }
    
    // Limpar erro do modelo
    if (errors.model) {
      setErrors(prev => ({ ...prev, model: '' }));
    }
  };

  // Handler específico para seleção de ano da FIPE
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const yearCode = e.target.value;
    
    // Encontrar o ano selecionado
    const selectedYear = years.find(year => year.codigo === yearCode);
    if (selectedYear) {
      // Extrair o ano do nome (ex: "2024 Gasolina" -> 2024)
      const yearMatch = selectedYear.nome.match(/\d{4}/);
      if (yearMatch) {
        setFormData(prev => ({ ...prev, year: parseInt(yearMatch[0]) }));
      }
    }
    
    // Limpar erro do ano
    if (errors.year) {
      setErrors(prev => ({ ...prev, year: '' }));
    }
  };

  // Handler específico para seleção de cor
  const handleColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const colorValue = e.target.value;
    setSelectedColor(colorValue);
    
    // Encontrar a cor selecionada
    const selectedColorOption = vehicleColors.find(color => color.value === colorValue);
    if (selectedColorOption) {
      if (colorValue === 'OUTRO') {
        // Se selecionou "Outro", manter o valor atual ou limpar
        setFormData(prev => ({ ...prev, color: prev.color || '' }));
      } else {
        setFormData(prev => ({ ...prev, color: selectedColorOption.label }));
      }
    }
    
    // Limpar erro da cor
    if (errors.color) {
      setErrors(prev => ({ ...prev, color: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      setErrors({ submit: 'Usuário não autenticado. Faça login novamente.' });
      return;
    }

    // Para atualização, não enviar ownerId (apenas para criação)
    const submitData = { ...formData };
    
    // Se é uma atualização (tem initialData), remover ownerId
    if (initialData?.id) {
      delete submitData.ownerId;
      console.log('🔄 VehicleForm: Enviando dados de atualização (sem ownerId):', submitData);
    } else {
      // Para criação, incluir ownerId
      submitData.ownerId = user.id;
      console.log('🆕 VehicleForm: Enviando dados de criação (com ownerId):', submitData);
    }

    onSubmit(submitData);
  };

  const vehicleTypes = [
    { value: 'CAR', label: 'Carro' },
    { value: 'MOTORCYCLE', label: 'Motocicleta' },
    { value: 'TRUCK', label: 'Caminhão' },
    { value: 'VAN', label: 'Van/Utilitário' },
  ];

  const vehicleColors = [
    // Cores Neutras
    { value: 'BRANCO', label: 'Branco', hex: '#FFFFFF', category: 'neutras' },
    { value: 'PRETO', label: 'Preto', hex: '#000000', category: 'neutras' },
    { value: 'PRATA', label: 'Prata', hex: '#C0C0C0', category: 'neutras' },
    { value: 'CINZA', label: 'Cinza', hex: '#808080', category: 'neutras' },
    { value: 'CINZA_ESCURO', label: 'Cinza Escuro', hex: '#404040', category: 'neutras' },
    
    // Cores Quentes
    { value: 'VERMELHO', label: 'Vermelho', hex: '#FF0000', category: 'quentes' },
    { value: 'LARANJA', label: 'Laranja', hex: '#FFA500', category: 'quentes' },
    { value: 'AMARELO', label: 'Amarelo', hex: '#FFFF00', category: 'quentes' },
    { value: 'ROSA', label: 'Rosa', hex: '#FFC0CB', category: 'quentes' },
    { value: 'BORDO', label: 'Bordo', hex: '#800020', category: 'quentes' },
    
    // Cores Frias
    { value: 'AZUL', label: 'Azul', hex: '#0000FF', category: 'frias' },
    { value: 'AZUL_MARINHO', label: 'Azul Marinho', hex: '#000080', category: 'frias' },
    { value: 'VERDE', label: 'Verde', hex: '#008000', category: 'frias' },
    { value: 'VERDE_ESCURO', label: 'Verde Escuro', hex: '#006400', category: 'frias' },
    { value: 'ROXO', label: 'Roxo', hex: '#800080', category: 'frias' },
    
    // Cores Metálicas
    { value: 'DOURADO', label: 'Dourado', hex: '#FFD700', category: 'metalicas' },
    { value: 'CHAMPAGNE', label: 'Champagne', hex: '#F7E7CE', category: 'metalicas' },
    { value: 'BEGE', label: 'Bege', hex: '#F5F5DC', category: 'metalicas' },
    { value: 'MARROM', label: 'Marrom', hex: '#8B4513', category: 'metalicas' },
    
    // Outros
    { value: 'OUTRO', label: 'Outro', hex: '#E5E5E5', category: 'outros' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{errors.submit}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Marca */}
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
            Marca *
          </label>
          <select
            id="brand"
            name="brand"
            value={selectedBrandCode}
            onChange={handleBrandChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.brand ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading || vehicleDataLoading}
          >
            <option value="">Selecione uma marca</option>
            {brands.map((brand) => (
              <option key={brand.codigo} value={brand.codigo}>
                {brand.nome}
              </option>
            ))}
          </select>
          {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
          {vehicleDataError && <p className="mt-1 text-sm text-red-600">{vehicleDataError}</p>}
        </div>

        {/* Modelo */}
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
            Modelo *
          </label>
          <select
            id="model"
            name="model"
            value={selectedModelCode}
            onChange={handleModelChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.model ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading || vehicleDataLoading || !selectedBrandCode}
          >
            <option value="">Selecione um modelo</option>
            {models.map((model) => (
              <option key={model.codigo} value={model.codigo}>
                {model.nome}
              </option>
            ))}
          </select>
          {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
        </div>

        {/* Ano */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
            Ano *
          </label>
          <select
            id="year"
            name="year"
            onChange={handleYearChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.year ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading || vehicleDataLoading || !selectedModelCode}
          >
            <option value="">Selecione um ano</option>
            {years.map((year) => (
              <option key={year.codigo} value={year.codigo}>
                {year.nome}
              </option>
            ))}
          </select>
          {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
          {formData.year && (
            <p className="mt-1 text-xs text-gray-500">
              Ano selecionado: {formData.year}
            </p>
          )}
        </div>

        {/* Placa */}
        <div>
          <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-2">
            Placa *
          </label>
          <input
            type="text"
            id="licensePlate"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleChange}
            placeholder="ABC-1234 ou ABC-1D23"
            maxLength={8}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.licensePlate ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.licensePlate && <p className="mt-1 text-sm text-red-600">{errors.licensePlate}</p>}
          <p className="mt-1 text-xs text-gray-500">
            Formato: ABC-1234 (antigo) ou ABC-1D23 (Mercosul)
          </p>
        </div>

        {/* Tipo */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Veículo *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            {vehicleTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Cor */}
        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
            Cor
          </label>
          
          {/* Seletor de Cores Visual */}
          <div className="space-y-3">
            {/* Cores Neutras */}
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-2">Cores Neutras</h4>
              <div className="grid grid-cols-5 gap-2">
                {vehicleColors.filter(c => c.category === 'neutras').map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleColorChange({ target: { value: color.value } } as any)}
                    className={`relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      selectedColor === color.value
                        ? 'border-blue-500 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={isLoading}
                  >
                    <div
                      className="w-full h-8 rounded-md mb-1"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs font-medium text-gray-700 block truncate">
                      {color.label}
                    </span>
                    {selectedColor === color.value && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Cores Quentes */}
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-2">Cores Quentes</h4>
              <div className="grid grid-cols-5 gap-2">
                {vehicleColors.filter(c => c.category === 'quentes').map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleColorChange({ target: { value: color.value } } as any)}
                    className={`relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      selectedColor === color.value
                        ? 'border-blue-500 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={isLoading}
                  >
                    <div
                      className="w-full h-8 rounded-md mb-1"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs font-medium text-gray-700 block truncate">
                      {color.label}
                    </span>
                    {selectedColor === color.value && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Cores Frias */}
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-2">Cores Frias</h4>
              <div className="grid grid-cols-5 gap-2">
                {vehicleColors.filter(c => c.category === 'frias').map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleColorChange({ target: { value: color.value } } as any)}
                    className={`relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      selectedColor === color.value
                        ? 'border-blue-500 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={isLoading}
                  >
                    <div
                      className="w-full h-8 rounded-md mb-1"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs font-medium text-gray-700 block truncate">
                      {color.label}
                    </span>
                    {selectedColor === color.value && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Cores Metálicas */}
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-2">Cores Metálicas</h4>
              <div className="grid grid-cols-5 gap-2">
                {vehicleColors.filter(c => c.category === 'metalicas').map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleColorChange({ target: { value: color.value } } as any)}
                    className={`relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      selectedColor === color.value
                        ? 'border-blue-500 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={isLoading}
                  >
                    <div
                      className="w-full h-8 rounded-md mb-1"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs font-medium text-gray-700 block truncate">
                      {color.label}
                    </span>
                    {selectedColor === color.value && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Outro */}
            <div>
              <div className="grid grid-cols-5 gap-2">
                {vehicleColors.filter(c => c.category === 'outros').map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleColorChange({ target: { value: color.value } } as any)}
                    className={`relative p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      selectedColor === color.value
                        ? 'border-blue-500 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={isLoading}
                  >
                    <div className="w-full h-8 rounded-md mb-1 bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-700 block truncate">
                      {color.label}
                    </span>
                    {selectedColor === color.value && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Campo de cor personalizada */}
          {selectedColor === 'OUTRO' && (
            <div className="mt-3">
              <input
                type="text"
                name="customColor"
                placeholder="Digite a cor personalizada"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
          )}

          {/* Cor selecionada */}
          {selectedColor && selectedColor !== 'OUTRO' && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center space-x-3">
                <div
                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: vehicleColors.find(c => c.value === selectedColor)?.hex }}
                />
                <span className="text-sm font-medium text-blue-900">
                  Cor selecionada: {vehicleColors.find(c => c.value === selectedColor)?.label}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quilometragem */}
        <div className="md:col-span-2">
          <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-2">
            Quilometragem Atual (km)
          </label>
          <input
            type="number"
            id="mileage"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            min="0"
            placeholder="0"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.mileage ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.mileage && <p className="mt-1 text-sm text-red-600">{errors.mileage}</p>}
          {initialData?.mileage && (
            <p className="mt-1 text-xs text-gray-500">
              Quilometragem atual: {initialData.mileage.toLocaleString('pt-BR')} km
            </p>
          )}
        </div>
      </div>

      {/* Indicador de carregamento */}
      {vehicleDataLoading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
            <p className="text-yellow-700 text-sm">
              {initialData?.id ? 'Carregando dados para edição...' : 'Carregando dados de veículos...'}
            </p>
          </div>
        </div>
      )}

      {/* Mensagem informativa para edição */}
      {initialData?.id && !vehicleDataLoading && (!selectedBrandCode || !selectedModelCode) && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-700 text-sm">
            <span className="font-medium">Dica:</span> Os dados da marca e modelo estão sendo carregados automaticamente. 
            Você pode editar outros campos enquanto aguarda ou clicar em "Atualizar Veículo" para salvar as alterações.
          </p>
        </div>
      )}

      {/* Informação sobre campos obrigatórios */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-blue-700 text-sm">
          <span className="font-medium">Dica:</span> Os campos marcados com * são obrigatórios. 
          As marcas e modelos são carregados automaticamente da tabela FIPE. 
          Certifique-se de que a placa não esteja já cadastrada no sistema.
        </p>
      </div>

      {/* Botões */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading || !user?.id}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Salvando...' : vehicleDataLoading ? 'Carregando dados...' : initialData ? 'Atualizar Veículo' : 'Cadastrar Veículo'}
        </button>
      </div>
    </form>
  );
};
