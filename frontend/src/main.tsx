import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Função para desregistrar todos os service workers
const unregisterAllServiceWorkers = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('🧹 Limpando service workers...', registrations.length);
      
      for (const registration of registrations) {
        console.log('🗑️ Desregistrando SW:', registration.scope);
        await registration.unregister();
      }
      
      // Limpar cache de service workers
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          console.log('🗑️ Removendo cache:', cacheName);
          await caches.delete(cacheName);
        }
      }
      
      console.log('✅ Todos os service workers foram removidos');
    } catch (error) {
      console.error('❌ Erro ao limpar service workers:', error);
    }
  }
};

// Executar limpeza imediatamente
unregisterAllServiceWorkers();

// Handler global para erros não capturados
window.addEventListener('error', (event) => {
  console.error('🚨 Global Error:', {
    timestamp: new Date().toISOString(),
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error?.stack
  });
  
  // Em produção, você pode enviar este erro para um serviço de monitoramento
});

// Handler para promises rejeitadas não capturadas
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', {
    timestamp: new Date().toISOString(),
    reason: event.reason?.toString() || 'Unknown reason',
    stack: event.reason?.stack || 'No stack trace'
  });
  
  // Prevenir que o erro apareça no console (opcional)
  // event.preventDefault();
});

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
          <App />
      </React.StrictMode>,
  );
} catch (error) {
  console.error('🚨 Fatal Error during React initialization:', error);
  
  // Fallback básico se o React falhar completamente
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        display: flex; 
        align-items: center; 
        justify-content: center; 
        min-height: 100vh; 
        font-family: Arial, sans-serif;
        background-color: #f5f5f5;
      ">
        <div style="
          text-align: center; 
          padding: 2rem; 
          background: white; 
          border-radius: 8px; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        ">
          <h1 style="color: #dc2626; margin-bottom: 1rem;">Erro Crítico</h1>
          <p style="color: #666; margin-bottom: 1rem;">
            Ocorreu um erro crítico ao carregar a aplicação.
          </p>
          <button 
            onclick="window.location.reload()" 
            style="
              background: #3b82f6; 
              color: white; 
              border: none; 
              padding: 0.5rem 1rem; 
              border-radius: 4px; 
              cursor: pointer;
            "
          >
            Recarregar Página
          </button>
        </div>
      </div>
    `;
  }
}