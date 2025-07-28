import React from 'react';
import { Car, AlertTriangle, Clock, CheckCircle, X } from 'lucide-react';

interface MileageNotificationProps {
  type: 'warning' | 'alert' | 'info' | 'success';
  title: string;
  message: string;
  vehicleInfo?: {
    brand: string;
    model: string;
    currentMileage: number;
    targetMileage: number;
  };
  onClose?: () => void;
  onAction?: () => void;
}

export const MileageNotification: React.FC<MileageNotificationProps> = ({
  type,
  title,
  message,
  vehicleInfo,
  onClose,
  onAction
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'alert':
        return 'bg-red-50 border-red-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'warning':
        return 'text-yellow-800';
      case 'alert':
        return 'text-red-800';
      case 'success':
        return 'text-green-800';
      default:
        return 'text-blue-800';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'warning':
        return 'text-yellow-900';
      case 'alert':
        return 'text-red-900';
      case 'success':
        return 'text-green-900';
      default:
        return 'text-blue-900';
    }
  };

  const calculateProgress = () => {
    if (!vehicleInfo) return 0;
    const { currentMileage, targetMileage } = vehicleInfo;
    const progress = (currentMileage / targetMileage) * 100;
    return Math.min(progress, 100);
  };

  const getProgressColor = () => {
    const progress = calculateProgress();
    if (progress >= 100) return 'bg-red-500';
    if (progress >= 90) return 'bg-yellow-500';
    if (progress >= 75) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  return (
    <div className={`relative max-w-sm w-full ${getBgColor()} border rounded-lg shadow-lg p-4 animate-slide-in`}>
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${getTitleColor()}`}>
            {title}
          </h4>
          <p className={`text-sm mt-1 ${getTextColor()}`}>
            {message}
          </p>
        </div>
      </div>

      {/* Vehicle info */}
      {vehicleInfo && (
        <div className="mt-3 p-3 bg-white rounded-md border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <Car className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              {vehicleInfo.brand} {vehicleInfo.model}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Atual: {vehicleInfo.currentMileage.toLocaleString('pt-BR')} km</span>
              <span>Meta: {vehicleInfo.targetMileage.toLocaleString('pt-BR')} km</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>

          {/* Remaining distance */}
          {vehicleInfo.currentMileage < vehicleInfo.targetMileage && (
            <div className="text-xs text-gray-600">
              Faltam {(vehicleInfo.targetMileage - vehicleInfo.currentMileage).toLocaleString('pt-BR')} km
            </div>
          )}
        </div>
      )}

      {/* Action button */}
      {onAction && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={onAction}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              type === 'alert' 
                ? 'bg-red-600 text-white hover:bg-red-700'
                : type === 'warning'
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : type === 'success'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Ver Detalhes
          </button>
        </div>
      )}
    </div>
  );
};

// CSS animations
const styles = `
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
} 