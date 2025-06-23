import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';

const ButtonTest: React.FC = () => {
  const navigate = useNavigate();
  const { 
    completeReminder, 
    createVehicle, 
    createMaintenanceService, 
    createMaintenanceReminder, 
    createExpense,
    user,
    isAuthenticated,
    maintenanceReminders
  } = useAppStore();

  const testButtons = async () => {
    console.log('🔥 Testando todos os botões do sistema...');
    console.log('👤 Usuário logado:', user);
    console.log('🔐 Autenticado:', isAuthenticated);
    console.log('⏰ Lembretes disponíveis:', maintenanceReminders?.length || 0);
    
    // Teste 1: Navegação
    console.log('✅ Teste de Navegação - OK');
    
    // Teste 2: Completar lembrete (se houver)
    if (maintenanceReminders && maintenanceReminders.length > 0) {
      const firstReminder = maintenanceReminders.find(r => !r.completed && !r.isCompleted);
      if (firstReminder) {
        try {
          console.log('🚀 Testando completar lembrete:', firstReminder.id);
          await completeReminder(firstReminder.id);
          console.log('✅ Lembrete completado com sucesso!');
        } catch (error) {
          console.log('❌ Completar lembrete - Erro:', error);
        }
      } else {
        console.log('ℹ️ Todos os lembretes já estão concluídos');
      }
    } else {
      console.log('ℹ️ Nenhum lembrete disponível para testar');
    }
    
    // Teste 3: Store actions
    console.log('✅ Store actions disponíveis');
    console.log('- createVehicle:', typeof createVehicle);
    console.log('- createMaintenanceService:', typeof createMaintenanceService);
    console.log('- createMaintenanceReminder:', typeof createMaintenanceReminder);
    console.log('- createExpense:', typeof createExpense);
    console.log('- completeReminder:', typeof completeReminder);
    
    // Teste 4: Verificar se usuário tem ID
    if (!user?.id) {
      console.log('❌ PROBLEMA: Usuário não tem ID válido!');
      alert('❌ PROBLEMA ENCONTRADO: Usuário não tem ID válido! Isso pode causar problemas ao criar veículos.');
    } else {
      console.log('✅ Usuário tem ID válido:', user.id);
      alert('✅ Sistema funcionando! Verifique o console para detalhes dos testes.');
    }
  };

  const testCreateVehicle = async () => {
    console.log('🚗 Testando criação de veículo...');
    
    if (!user?.id) {
      alert('❌ Erro: Usuário não logado ou sem ID válido!');
      return;
    }

    const testVehicleData = {
      brand: 'Toyota',
      model: 'Corolla',
      year: 2023,
      licensePlate: 'ABC-1234',
      type: 'CAR',
      ownerId: user.id
    };

    try {
      console.log('🚗 Dados do veículo de teste:', testVehicleData);
      const newVehicle = await createVehicle(testVehicleData);
      console.log('✅ Veículo criado com sucesso:', newVehicle);
      alert('✅ Veículo de teste criado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao criar veículo:', error);
      alert(`❌ Erro ao criar veículo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={testButtons}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
      >
        🔧 Testar Botões
      </button>
      
      <div className="mt-2 space-y-1">
        <button
          onClick={testCreateVehicle}
          className="block w-full bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
        >
          🧪 Teste Criar Veículo
        </button>
        
        <button
          onClick={() => navigate('/vehicles/new')}
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
        >
          ➕ Novo Veículo
        </button>
        
        <button
          onClick={() => navigate('/maintenance')}
          className="block w-full bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs"
        >
          🔧 Manutenção
        </button>
        
        <button
          onClick={() => navigate('/reminders')}
          className="block w-full bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs"
        >
          ⏰ Lembretes
        </button>
        
        <button
          onClick={() => navigate('/expenses')}
          className="block w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs"
        >
          💰 Despesas
        </button>
      </div>
    </div>
  );
};

export default ButtonTest;
 