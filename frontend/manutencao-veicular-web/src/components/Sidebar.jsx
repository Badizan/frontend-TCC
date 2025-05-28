import { NavLink } from 'react-router-dom';
import { FaCar, FaTools, FaBell, FaChartBar, FaCog, FaTachometerAlt, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export function Sidebar() {
  const { user, signOut } = useAuth();

  return (
    <aside className="flex flex-col h-screen w-64 bg-[#101828] text-white shadow-lg">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <span className="text-2xl font-bold text-[#16B1A6]">Auto<span className="text-white">Maintenance</span></span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavLink to="/dashboard" className={({isActive}) => `flex items-center px-4 py-2 rounded-lg hover:bg-[#1D2939] transition ${isActive ? 'bg-[#1D2939]' : ''}` }>
          <FaTachometerAlt className="mr-3" /> Dashboard
        </NavLink>
        <NavLink to="/vehicles" className={({isActive}) => `flex items-center px-4 py-2 rounded-lg hover:bg-[#1D2939] transition ${isActive ? 'bg-[#1D2939]' : ''}` }>
          <FaCar className="mr-3" /> Vehicles
        </NavLink>
        <NavLink to="/maintenances" className={({isActive}) => `flex items-center px-4 py-2 rounded-lg hover:bg-[#1D2939] transition ${isActive ? 'bg-[#1D2939]' : ''}` }>
          <FaTools className="mr-3" /> Maintenance
        </NavLink>
        <NavLink to="/notifications" className={({isActive}) => `flex items-center px-4 py-2 rounded-lg hover:bg-[#1D2939] transition ${isActive ? 'bg-[#1D2939]' : ''}` }>
          <FaBell className="mr-3" /> Notifications
        </NavLink>
        <NavLink to="/reports" className={({isActive}) => `flex items-center px-4 py-2 rounded-lg hover:bg-[#1D2939] transition ${isActive ? 'bg-[#1D2939]' : ''}` }>
          <FaChartBar className="mr-3" /> Reports
        </NavLink>
        <NavLink to="/settings" className={({isActive}) => `flex items-center px-4 py-2 rounded-lg hover:bg-[#1D2939] transition ${isActive ? 'bg-[#1D2939]' : ''}` }>
          <FaCog className="mr-3" /> Settings
        </NavLink>
      </nav>
      <div className="mt-auto px-4 py-6 border-t border-gray-700 flex items-center gap-3">
        <FaUserCircle className="text-3xl" />
        <div className="flex-1">
          <div className="font-semibold">{user?.name || 'Usuário'}</div>
          <div className="text-xs text-gray-400">{user?.role || ''}</div>
        </div>
        <button onClick={signOut} title="Sair">
          <FaSignOutAlt className="text-xl hover:text-red-400 transition" />
        </button>
      </div>
    </aside>
  );
} 