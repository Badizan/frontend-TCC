import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Car, Edit, Save, Camera } from 'lucide-react';

const mockUser = {
  name: 'João Silva',
  email: 'joao.silva@email.com',
  phone: '(11) 98765-4321',
  city: 'São Paulo',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&w=200',
  vehicles: [
    {
      id: '1',
      brand: 'Toyota',
      model: 'Corolla',
      licensePlate: 'ABC1234',
      image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=200'
    },
    {
      id: '2',
      brand: 'Honda',
      model: 'Civic',
      licensePlate: 'DEF5678',
      image: 'https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&w=200'
    }
  ]
};

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: mockUser.name,
    email: mockUser.email,
    phone: mockUser.phone,
    city: mockUser.city
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsEditing(false);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Perfil</h1>
          <p className="text-gray-500">Gerencie suas informações pessoais</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn-primary px-6 py-2 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
        >
          {isEditing ? (
            <>
              <Save className="w-5 h-5" />
              Salvar
            </>
          ) : (
            <>
              <Edit className="w-5 h-5" />
              Editar
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={mockUser.avatar}
                  alt={mockUser.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <button className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-colors">
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">{mockUser.name}</h2>
              <p className="text-gray-500">{mockUser.email}</p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="w-5 h-5" />
                <span>{mockUser.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{mockUser.city}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Seu nome"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Sua cidade"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Meus Veículos</h2>
              <button className="btn-primary px-4 py-2 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                <Car className="w-5 h-5" />
                Adicionar Veículo
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockUser.vehicles.map(vehicle => (
                <div
                  key={vehicle.id}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:scale-105 transition-transform"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden">
                    <img
                      src={vehicle.image}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{vehicle.brand} {vehicle.model}</h3>
                    <p className="text-sm text-gray-500">{vehicle.licensePlate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 