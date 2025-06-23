// Service Worker para AutoManutenção
const CACHE_NAME = 'auto-manutencao-v1';
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/static/js/bundle.js',
    '/static/css/main.css'
];

const API_CACHE_NAME = 'auto-manutencao-api-v1';

// Instalar Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker instalado');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache aberto');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .catch((error) => {
                console.error('Erro ao cachear recursos:', error);
            })
    );
    
    self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker ativado');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
                        console.log('Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Estratégia para requisições da API
    if (url.pathname.startsWith('/api')) {
        event.respondWith(
            networkFirstWithCache(request, API_CACHE_NAME)
        );
        return;
    }
    
    // Estratégia para recursos estáticos
    if (request.destination === 'document' || 
        request.destination === 'script' || 
        request.destination === 'style' ||
        request.destination === 'image') {
        event.respondWith(
            cacheFirstWithNetwork(request, CACHE_NAME)
        );
        return;
    }
});

// Estratégia: Network First com fallback para cache
async function networkFirstWithCache(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        
        // Se a resposta for válida, armazena no cache
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network falhou, tentando cache:', error);
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Retorna uma resposta offline personalizada para APIs
        if (request.url.includes('/api')) {
            return new Response(
                JSON.stringify({ 
                    error: 'Você está offline. Os dados serão sincronizados quando a conexão for restabelecida.',
                    offline: true 
                }),
                {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
        
        throw error;
    }
}

// Estratégia: Cache First com fallback para network
async function cacheFirstWithNetwork(request, cacheName) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Falha ao buscar recurso:', error);
        
        // Para documentos HTML, retorna uma página offline básica
        if (request.destination === 'document') {
            return new Response(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>AutoManutenção - Offline</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            text-align: center; 
                            padding: 50px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            margin: 0;
                            min-height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .container {
                            background: rgba(255, 255, 255, 0.1);
                            padding: 40px;
                            border-radius: 15px;
                            backdrop-filter: blur(10px);
                        }
                        h1 { margin: 0 0 20px 0; }
                        p { margin: 10px 0; }
                        .icon { font-size: 64px; margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="icon">📱</div>
                        <h1>AutoManutenção</h1>
                        <p>Você está offline</p>
                        <p>Verifique sua conexão com a internet</p>
                        <button onclick="window.location.reload()" style="
                            background: #4CAF50;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 6px;
                            cursor: pointer;
                            margin-top: 20px;
                            font-size: 16px;
                        ">Tentar Novamente</button>
                    </div>
                </body>
                </html>
            `, {
                headers: { 'Content-Type': 'text/html' }
            });
        }
        
        throw error;
    }
}

// Gerenciar notificações push
self.addEventListener('push', (event) => {
    console.log('Push notification recebida:', event);
    
    let notificationData = {
        title: 'AutoManutenção',
        body: 'Nova notificação',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'auto-manutencao',
        requireInteraction: true,
        actions: [
            {
                action: 'open',
                title: 'Abrir',
                icon: '/action-open.png'
            },
            {
                action: 'dismiss',
                title: 'Dispensar',
                icon: '/action-dismiss.png'
            }
        ]
    };
    
    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = {
                ...notificationData,
                ...data,
                data: data // Adiciona dados customizados
            };
        } catch (error) {
            console.error('Erro ao parsear dados da notificação:', error);
            notificationData.body = event.data.text() || notificationData.body;
        }
    }
    
    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    );
});

// Gerenciar cliques em notificações
self.addEventListener('notificationclick', (event) => {
    console.log('Notificação clicada:', event);
    
    event.notification.close();
    
    const action = event.action;
    const data = event.notification.data || {};
    
    if (action === 'dismiss') {
        return;
    }
    
    // URL para navegar (padrão ou específica da notificação)
    let urlToOpen = '/';
    
    if (data.url) {
        urlToOpen = data.url;
    } else if (data.type) {
        // URLs específicas por tipo de notificação
        switch (data.type) {
            case 'MAINTENANCE_DUE':
                urlToOpen = '/manutencoes';
                break;
            case 'REMINDER_ALERT':
                urlToOpen = '/lembretes';
                break;
            case 'EXPENSE_LIMIT':
                urlToOpen = '/gastos';
                break;
            case 'MILEAGE_ALERT':
                urlToOpen = '/veiculos';
                break;
            default:
                urlToOpen = '/dashboard';
        }
    }
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Verifica se já existe uma janela aberta
                for (const client of clientList) {
                    if (client.url.includes(urlToOpen) && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Se não existe, abre uma nova janela
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Sincronização em background
self.addEventListener('sync', (event) => {
    console.log('Sync event:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(syncPendingOperations());
    }
});

// Função para sincronizar operações pendentes
async function syncPendingOperations() {
    try {
        // Notifica o cliente sobre início da sincronização
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_START'
            });
        });
        
        // Aqui você pode implementar lógica específica de sincronização
        // Por exemplo, enviar dados armazenados offline para a API
        
        console.log('Sincronização em background concluída');
        
        // Notifica o cliente sobre conclusão da sincronização
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_COMPLETE'
            });
        });
        
    } catch (error) {
        console.error('Erro na sincronização em background:', error);
        
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_ERROR',
                error: error.message
            });
        });
    }
}

// Gerenciar mensagens do cliente
self.addEventListener('message', (event) => {
    console.log('Mensagem recebida no SW:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_UPDATE') {
        // Força atualização do cache
        event.waitUntil(
            caches.delete(CACHE_NAME).then(() => {
                return caches.open(CACHE_NAME);
            }).then((cache) => {
                return cache.addAll(STATIC_CACHE_URLS);
            })
        );
    }
});

// Logs para debug
console.log('Service Worker carregado - AutoManutenção v1.0'); 