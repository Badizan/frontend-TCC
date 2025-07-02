import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Grid, List, SortAsc, SortDesc, Trash2, Edit, Eye } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const VehicleList: React.FC = () => {
  const { vehicles, fetchVehicles, deleteVehicle } = useAppStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const { showToast } = useNotifications();

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const formatVehicleType = (type: string) => {
    switch (type) {
      case 'CAR': return 'Carro';
      case 'MOTORCYCLE': return 'Motocicleta';
      case 'TRUCK': return 'Caminhão';
      case 'VAN': return 'Van/Utilitário';
      default: return type;
    }
  };

  const getStatusBadge = () => {
    return {
      text: 'Ativo',
      className: 'bg-green-100 text-green-800'
    };
  };

  const sortVehicles = (vehicles: typeof vehicles) => {
    return vehicles.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortBy) {
        case 'name':
          valueA = `${a.brand} ${a.model}`.toLowerCase();
          valueB = `${b.brand} ${b.model}`.toLowerCase();
          break;
        case 'year':
          valueA = a.year;
          valueB = b.year;
          break;
        case 'brand':
          valueA = a.brand.toLowerCase();
          valueB = b.brand.toLowerCase();
          break;
        case 'licensePlate':
          valueA = a.licensePlate.toLowerCase();
          valueB = b.licensePlate.toLowerCase();
          break;
        default:
          valueA = a.createdAt;
          valueB = b.createdAt;
      }

      if (sortOrder === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });
  };

  const filteredVehicles = sortVehicles(
    vehicles.filter(vehicle => {
      const matchesSearch = 
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || vehicle.type === filterType;

      return matchesSearch && matchesType;
    })
  );

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? 
      <SortAsc className="w-4 h-4 ml-1" /> : 
      <SortDesc className="w-4 h-4 ml-1" />;
  };

  const handleDeleteVehicle = async (e: React.MouseEvent, vehicle: any) => {
    e.stopPropagation(); // Evitar navegação ao clicar no card
    
    if (!confirm(`Tem certeza que deseja excluir o veículo ${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})?`)) {
      return;
    }
    
    try {
      await deleteVehicle(vehicle.id);
      
      showToast(
        'Veículo Excluído',
        `${vehicle.brand} ${vehicle.model} foi excluído com sucesso`,
        'vehicles',
        'success'
      );
      
    } catch (error) {
      console.error('Erro ao excluir veículo:', error);
      showToast(
        'Erro',
        'Não foi possível excluir o veículo. Tente novamente.',
        'system',
        'error'
      );
    }
  };

  const handleEditVehicle = (e: React.MouseEvent, vehicleId: string) => {
    e.stopPropagation(); // Evitar navegação ao clicar no card
    navigate(`/vehicles/${vehicleId}/edit`);
  };

  const handleViewVehicle = (e: React.MouseEvent, vehicleId: string) => {
    e.stopPropagation(); // Evitar navegação ao clicar no card
    navigate(`/vehicles/${vehicleId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Meus Veículos</h1>
          <p className="text-sm text-gray-600">
            Gerencie todos os seus veículos cadastrados ({filteredVehicles.length} de {vehicles.length})
          </p>
        </div>
        <button
          onClick={() => navigate('/vehicles/new')}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Veículo
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="form-input pl-10"
              placeholder="Buscar por marca, modelo ou placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center ${showFilters ? 'bg-blue-50 text-blue-700' : ''}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </button>
            
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 border-l border-gray-300 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4 animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Veículo
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="form-input"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="CAR">Carro</option>
                  <option value="MOTORCYCLE">Motocicleta</option>
                  <option value="TRUCK">Caminhão</option>
                  <option value="VAN">Van/Utilitário</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-input"
                >
                  <option value="name">Nome (Marca + Modelo)</option>
                  <option value="brand">Marca</option>
                  <option value="year">Ano</option>
                  <option value="licensePlate">Placa</option>
                  <option value="createdAt">Data de Cadastro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordem
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="form-input"
                >
                  <option value="asc">Crescente</option>
                  <option value="desc">Decrescente</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vehicle Cards */}
      {filteredVehicles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <path d="M9 17h6" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Tente ajustar sua busca ou adicione um novo veículo.'
              : 'Comece cadastrando seu primeiro veículo.'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate('/vehicles/new')}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Primeiro Veículo
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => {
            const status = getStatusBadge();
            return (
              <div
                key={vehicle.id}
                className="card hover:shadow-lg transition-all duration-200"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`badge ${status.className}`}>
                      {status.text}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => handleViewVehicle(e, vehicle.id)}
                        className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleEditVehicle(e, vehicle.id)}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
                        title="Editar veículo"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteVehicle(e, vehicle)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Excluir veículo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-sm text-gray-500">
                      {formatVehicleType(vehicle.type)}
                    </span>
                  </div>
                  
                  <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden relative">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2" />
                          <circle cx="7" cy="17" r="2" />
                          <path d="M9 17h6" />
                          <circle cx="17" cy="17" r="2" />
                        </svg>
                        <p className="text-xs text-blue-600 font-medium">
                          {vehicle.brand} {vehicle.model}
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-white/80 rounded-full px-2 py-1">
                      <span className="text-xs font-medium text-gray-700">
                        {vehicle.year}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">{vehicle.brand} {vehicle.model}</h3>
                    <p className="text-sm text-gray-500">{vehicle.year} • {vehicle.licensePlate}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-4 h-4 mr-2">📋</span>
                      Placa: {vehicle.licensePlate}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-4 h-4 mr-2">🚗</span>
                      {formatVehicleType(vehicle.type)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-4 h-4 mr-2">📅</span>
                      Ano: {vehicle.year}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // List View
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredVehicles.map((vehicle) => {
              const status = getStatusBadge();
              return (
                <li key={vehicle.id}>
                  <div 
                    className="px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2" />
                              <circle cx="7" cy="17" r="2" />
                              <path d="M9 17h6" />
                              <circle cx="17" cy="17" r="2" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {vehicle.brand} {vehicle.model}
                            </h3>
                            <span className={`badge ${status.className}`}>
                              {status.text}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span>📅 {vehicle.year}</span>
                            <span>📋 {vehicle.licensePlate}</span>
                            <span>🚗 {formatVehicleType(vehicle.type)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">
                          Ver detalhes →
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export { VehicleList };