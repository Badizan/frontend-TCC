import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, DollarSign, Bell, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      path: '/',
      icon: <LayoutDashboard className="w-6 h-6" />,
      label: 'Dashboard'
    },
    {
      path: '/vehicles',
      icon: <Car className="w-6 h-6" />,
      label: 'Veículos'
    },
    {
      path: '/expenses',
      icon: <DollarSign className="w-6 h-6" />,
      label: 'Despesas'
    },
    {
      path: '/reminders',
      icon: <Bell className="w-6 h-6" />,
      label: 'Lembretes'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">CarManager</h1>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                isActive(item.path) ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-64 p-6">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-6 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors rounded-xl"
          >
            <LogOut className="w-6 h-6" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout; 