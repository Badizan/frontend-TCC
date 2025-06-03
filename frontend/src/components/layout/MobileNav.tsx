import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Wrench,
  Bell,
  DollarSign,
  BarChart2
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Veículos', href: '/vehicles', icon: Car },
  { name: 'Manutenção', href: '/maintenance', icon: Wrench },
  { name: 'Lembretes', href: '/reminders', icon: Bell },
  { name: 'Despesas', href: '/expenses', icon: DollarSign },
  { name: 'Relatórios', href: '/reports', icon: BarChart2 },
];

const MobileNav: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white lg:hidden">
      <nav className="flex items-center justify-around">
        {navigation.map((item) => (
      <NavLink 
            key={item.name}
            to={item.href}
        className={({ isActive }) => 
              `flex flex-col items-center py-2 px-3 text-xs font-medium ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-900'
          }`
        }
      >
            <item.icon
              className={`h-6 w-6 ${
                location.pathname === item.href
                  ? 'text-blue-600'
                  : 'text-gray-400'
              }`}
              aria-hidden="true"
            />
            <span className="mt-1">{item.name}</span>
      </NavLink>
        ))}
    </nav>
    </div>
  );
};

export default MobileNav;