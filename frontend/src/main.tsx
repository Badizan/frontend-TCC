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

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);