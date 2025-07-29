import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Car, PenTool as Tool, Clock, BarChart } from 'lucide-react';

const MobileNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 px-4 z-10 lg:hidden">
      <NavLink 
        to="/" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center p-2 rounded-md ${
            isActive ? 'text-primary-600' : 'text-gray-500'
          }`
        }
        end
      >
        <Home className="w-5 h-5" />
        <span className="text-xs mt-1">Início</span>
      </NavLink>
      
      <NavLink 
        to="/vehicles" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center p-2 rounded-md ${
            isActive ? 'text-primary-600' : 'text-gray-500'
          }`
        }
      >
        <Car className="w-5 h-5" />
        <span className="text-xs mt-1">Veículos</span>
      </NavLink>
      
      <NavLink 
        to="/maintenance" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center p-2 rounded-md ${
            isActive ? 'text-primary-600' : 'text-gray-500'
          }`
        }
      >
        <Tool className="w-5 h-5" />
        <span className="text-xs mt-1">Manutenções</span>
      </NavLink>
      
      <NavLink 
        to="/reminders" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center p-2 rounded-md ${
            isActive ? 'text-primary-600' : 'text-gray-500'
          }`
        }
      >
        <Clock className="w-5 h-5" />
        <span className="text-xs mt-1">Lembretes</span>
      </NavLink>
      
      <NavLink 
        to="/reports" 
        className={({ isActive }) => 
          `flex flex-col items-center justify-center p-2 rounded-md ${
            isActive ? 'text-primary-600' : 'text-gray-500'
          }`
        }
      >
        <BarChart className="w-5 h-5" />
        <span className="text-xs mt-1">Relatórios</span>
      </NavLink>
    </nav>
  );
};

export default MobileNav;