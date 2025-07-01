import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Car, 
  Wrench, 
  Clock, 
  DollarSign, 
  BarChart3,
  Car as CarIcon
} from 'lucide-react';
import { useAppStore } from '../../store';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { vehicles, maintenanceReminders } = useAppStore();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Veículos', href: '/vehicles', icon: Car },
    { name: 'Manutenção', href: '/maintenance', icon: Wrench },
    { name: 'Lembretes', href: '/reminders', icon: Clock },
    { name: 'Despesas', href: '/expenses', icon: DollarSign },
    { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  ];

  // Encontrar próximo lembrete de manutenção
  const nextReminder = maintenanceReminders
    .filter(reminder => !reminder.completed && reminder.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    [0];

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Veículo';
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <CarIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">AutoManutenção</span>
          </div>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  isActive
                    ? 'sidebar-item-active'
                    : 'sidebar-item-inactive'
                }
                onClick={() => toggleSidebar()}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Dynamic maintenance reminder */}
        {nextReminder && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-orange-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-orange-800">
                    Manutenção pendente
                  </h3>
                  <div className="mt-1 text-sm text-orange-700">
                    <p>
                      {nextReminder.description} para {getVehicleName(nextReminder.vehicleId)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
