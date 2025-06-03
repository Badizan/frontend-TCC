import React from 'react';
import { Vehicle } from '../../types';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: () => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onClick }) => {
  return (
    <div 
      className="card hover:cursor-pointer transition-transform hover:translate-y-[-4px]"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
          {vehicle.image ? (
            <img 
              src={vehicle.image} 
              alt={`${vehicle.brand} ${vehicle.model}`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-gray-400"
            >
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <path d="M9 17h6" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{vehicle.name}</h3>
          <p className="text-sm text-gray-500">
            {vehicle.brand} {vehicle.model} ({vehicle.year})
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {vehicle.currentMileage.toLocaleString()} km
          </p>
        </div>
        <Link to={`/vehicles/${vehicle.id}`} className="text-gray-400">
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default VehicleCard;