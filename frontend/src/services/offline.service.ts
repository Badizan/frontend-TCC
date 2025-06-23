import Dexie, { Table } from 'dexie';

// Definir os tipos de dados que serão armazenados localmente
interface OfflineVehicle {
    id: string;
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    type: string;
    color?: string;
    mileage?: number;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    syncStatus?: 'synced' | 'pending' | 'conflict';
}

interface OfflineExpense {
    id: string;
    vehicleId: string;
    description: string;
    category: string;
    amount: number;
    date: string;
    mileage?: number;
    createdAt: string;
    syncStatus?: 'synced' | 'pending' | 'conflict';
}

interface OfflineReminder {
    id: string;
    vehicleId: string;
    description: string;
    type: 'TIME_BASED' | 'MILEAGE_BASED' | 'HYBRID';
    dueDate?: string;
    dueMileage?: number;
    intervalDays?: number;
    intervalMileage?: number;
    completed: boolean;
    recurring: boolean;
    createdAt: string;
    syncStatus?: 'synced' | 'pending' | 'conflict';
}

interface OfflineMaintenance {
    id: string;
    vehicleId: string;
    mechanicId: string;
    type: string;
    status: string;
    description: string;
    scheduledDate: string;
    completedDate?: string;
    cost?: number;
    notes?: string;
    createdAt: string;
    syncStatus?: 'synced' | 'pending' | 'conflict';
}

interface OfflineNotification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    syncStatus?: 'synced' | 'pending' | 'conflict';
}

interface SyncOperation {
    id?: number;
    table: string;
    operation: 'create' | 'update' | 'delete';
    recordId: string;
    data: any;
    timestamp: string;
    retryCount: number;
    lastError?: string;
}

// Configurar o banco de dados IndexedDB
class OfflineDatabase extends Dexie {
    vehicles!: Table<OfflineVehicle>;
    expenses!: Table<OfflineExpense>;
    reminders!: Table<OfflineReminder>;
    maintenances!: Table<OfflineMaintenance>;
    notifications!: Table<OfflineNotification>;
    syncQueue!: Table<SyncOperation>;

    constructor() {
        super('AutoManutencaoOfflineDB');

        this.version(1).stores({
            vehicles: 'id, brand, model, licensePlate, ownerId, syncStatus',
            expenses: 'id, vehicleId, category, date, syncStatus',
            reminders: 'id, vehicleId, dueDate, dueMileage, completed, syncStatus',
            maintenances: 'id, vehicleId, mechanicId, status, scheduledDate, syncStatus',
            notifications: 'id, userId, read, createdAt, syncStatus',
            syncQueue: '++id, table, operation, recordId, timestamp'
        });
    }
}

export class OfflineService {
    private db: OfflineDatabase;
    private isOnline: boolean = navigator.onLine;
    private syncInProgress: boolean = false;

    constructor() {
        this.db = new OfflineDatabase();
        this.setupOnlineListener();
    }

    private setupOnlineListener() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Conexão restaurada - iniciando sincronização...');
            this.syncPendingOperations();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📱 Modo offline ativado');
        });
    }

    // Métodos para VEHICLES
    async saveVehicleOffline(vehicle: any) {
        const offlineVehicle: OfflineVehicle = {
            ...vehicle,
            syncStatus: this.isOnline ? 'synced' : 'pending'
        };

        await this.db.vehicles.put(offlineVehicle);

        if (!this.isOnline) {
            await this.addToSyncQueue('vehicles', 'create', vehicle.id, vehicle);
        }

        return offlineVehicle;
    }

    async getVehiclesOffline(ownerId: string): Promise<OfflineVehicle[]> {
        return await this.db.vehicles.where('ownerId').equals(ownerId).toArray();
    }

    async updateVehicleOffline(id: string, updates: Partial<OfflineVehicle>) {
        const existing = await this.db.vehicles.get(id);
        if (!existing) throw new Error('Veículo não encontrado');

        const updated = {
            ...existing,
            ...updates,
            syncStatus: this.isOnline ? 'synced' : 'pending' as const
        };

        await this.db.vehicles.put(updated);

        if (!this.isOnline) {
            await this.addToSyncQueue('vehicles', 'update', id, updates);
        }

        return updated;
    }

    async deleteVehicleOffline(id: string) {
        await this.db.vehicles.delete(id);

        if (!this.isOnline) {
            await this.addToSyncQueue('vehicles', 'delete', id, null);
        }
    }

    // Métodos para EXPENSES
    async saveExpenseOffline(expense: any) {
        const offlineExpense: OfflineExpense = {
            ...expense,
            syncStatus: this.isOnline ? 'synced' : 'pending'
        };

        await this.db.expenses.put(offlineExpense);

        if (!this.isOnline) {
            await this.addToSyncQueue('expenses', 'create', expense.id, expense);
        }

        return offlineExpense;
    }

    async getExpensesOffline(vehicleId?: string): Promise<OfflineExpense[]> {
        if (vehicleId) {
            return await this.db.expenses.where('vehicleId').equals(vehicleId).toArray();
        }
        return await this.db.expenses.toArray();
    }

    // Métodos para REMINDERS
    async saveReminderOffline(reminder: any) {
        const offlineReminder: OfflineReminder = {
            ...reminder,
            syncStatus: this.isOnline ? 'synced' : 'pending'
        };

        await this.db.reminders.put(offlineReminder);

        if (!this.isOnline) {
            await this.addToSyncQueue('reminders', 'create', reminder.id, reminder);
        }

        return offlineReminder;
    }

    async getRemindersOffline(vehicleId?: string): Promise<OfflineReminder[]> {
        if (vehicleId) {
            return await this.db.reminders.where('vehicleId').equals(vehicleId).toArray();
        }
        return await this.db.reminders.toArray();
    }

    // Métodos para NOTIFICATIONS
    async saveNotificationOffline(notification: any) {
        const offlineNotification: OfflineNotification = {
            ...notification,
            syncStatus: this.isOnline ? 'synced' : 'pending'
        };

        await this.db.notifications.put(offlineNotification);
        return offlineNotification;
    }

    async getNotificationsOffline(userId: string): Promise<OfflineNotification[]> {
        return await this.db.notifications
            .where('userId')
            .equals(userId)
            .reverse()
            .sortBy('createdAt');
    }

    async markNotificationAsReadOffline(id: string) {
        const notification = await this.db.notifications.get(id);
        if (notification) {
            notification.read = true;
            notification.syncStatus = this.isOnline ? 'synced' : 'pending';
            await this.db.notifications.put(notification);

            if (!this.isOnline) {
                await this.addToSyncQueue('notifications', 'update', id, { read: true });
            }
        }
    }

    // Gerenciamento da fila de sincronização
    private async addToSyncQueue(
        table: string,
        operation: 'create' | 'update' | 'delete',
        recordId: string,
        data: any
    ) {
        const syncOperation: SyncOperation = {
            table,
            operation,
            recordId,
            data,
            timestamp: new Date().toISOString(),
            retryCount: 0
        };

        await this.db.syncQueue.add(syncOperation);
    }

    // Sincronizar operações pendentes
    async syncPendingOperations() {
        if (this.syncInProgress || !this.isOnline) {
            return;
        }

        this.syncInProgress = true;
        console.log('🔄 Iniciando sincronização...');

        try {
            const pendingOperations = await this.db.syncQueue.orderBy('timestamp').toArray();

            for (const operation of pendingOperations) {
                try {
                    await this.executeSync(operation);
                    await this.db.syncQueue.delete(operation.id!);
                    console.log(`✅ Sincronização concluída: ${operation.table}/${operation.operation}`);
                } catch (error) {
                    console.error(`❌ Erro na sincronização: ${operation.table}/${operation.operation}`, error);

                    // Incrementar contador de tentativas
                    operation.retryCount += 1;
                    operation.lastError = error instanceof Error ? error.message : 'Erro desconhecido';

                    // Se excedeu o limite de tentativas, remover da fila
                    if (operation.retryCount >= 3) {
                        await this.db.syncQueue.delete(operation.id!);
                        console.warn(`🗑️ Operação removida após 3 tentativas: ${operation.table}/${operation.operation}`);
                    } else {
                        await this.db.syncQueue.put(operation);
                    }
                }
            }

            // Sincronizar dados do servidor
            await this.downloadLatestData();

        } catch (error) {
            console.error('❌ Erro geral na sincronização:', error);
        } finally {
            this.syncInProgress = false;
            console.log('✅ Sincronização finalizada');
        }
    }

    private async executeSync(operation: SyncOperation) {
        const baseUrl = 'http://localhost:3333';
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('Token de autenticação não encontrado');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        switch (operation.operation) {
            case 'create':
                await fetch(`${baseUrl}/${operation.table}`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(operation.data)
                });
                break;

            case 'update':
                await fetch(`${baseUrl}/${operation.table}/${operation.recordId}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(operation.data)
                });
                break;

            case 'delete':
                await fetch(`${baseUrl}/${operation.table}/${operation.recordId}`, {
                    method: 'DELETE',
                    headers
                });
                break;
        }
    }

    private async downloadLatestData() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const headers = {
                'Authorization': `Bearer ${token}`
            };

            // Baixar dados mais recentes do servidor
            const [vehicles, expenses, reminders, notifications] = await Promise.all([
                fetch('http://localhost:3333/vehicles', { headers }).then(r => r.json()),
                fetch('http://localhost:3333/expenses', { headers }).then(r => r.json()),
                fetch('http://localhost:3333/reminders', { headers }).then(r => r.json()),
                fetch('http://localhost:3333/notifications', { headers }).then(r => r.json())
            ]);

            // Atualizar dados locais apenas se não há conflitos
            await this.updateLocalDataIfNewer(vehicles.data || vehicles, 'vehicles');
            await this.updateLocalDataIfNewer(expenses.data || expenses, 'expenses');
            await this.updateLocalDataIfNewer(reminders.data || reminders, 'reminders');
            await this.updateLocalDataIfNewer(notifications.data || notifications, 'notifications');

        } catch (error) {
            console.error('❌ Erro ao baixar dados do servidor:', error);
        }
    }

    private async updateLocalDataIfNewer(serverData: any[], tableName: string) {
        const table = this.db[tableName as keyof OfflineDatabase] as Table;

        for (const serverRecord of serverData) {
            const localRecord = await table.get(serverRecord.id);

            // Se não existe localmente ou o servidor tem versão mais nova
            if (!localRecord || new Date(serverRecord.updatedAt) > new Date(localRecord.updatedAt || localRecord.createdAt)) {
                await table.put({
                    ...serverRecord,
                    syncStatus: 'synced'
                });
            }
        }
    }

    // Métodos utilitários
    async clearOfflineData() {
        await this.db.delete();
        await this.db.open();
    }

    async getOfflineStatus() {
        const pendingOperations = await this.db.syncQueue.count();

        return {
            isOnline: this.isOnline,
            pendingOperations,
            syncInProgress: this.syncInProgress,
            lastSync: localStorage.getItem('lastSyncTime')
        };
    }

    // Inicialização
    async initialize() {
        try {
            await this.db.open();
            console.log('💾 Banco de dados offline inicializado');

            if (this.isOnline) {
                await this.syncPendingOperations();
            }
        } catch (error) {
            console.error('❌ Erro ao inicializar banco offline:', error);
        }
    }
} 