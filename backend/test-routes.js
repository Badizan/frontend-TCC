const axios = require('axios');

const API_BASE = 'http://localhost:3000';

// Token de teste (será necessário pegar um token válido)
let authToken = '';

async function testAPI() {
  try {
    console.log('🧪 Testando API Routes...');
    
    // 1. Fazer login para obter token
    console.log('\n1. Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    authToken = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    
    // 2. Listar veículos
    console.log('\n2. Listando veículos...');
    const vehiclesResponse = await axios.get(`${API_BASE}/vehicles`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ ${vehiclesResponse.data.length} veículos encontrados`);
    
    // 3. Listar manutenções
    console.log('\n3. Listando manutenções...');
    const maintenanceResponse = await axios.get(`${API_BASE}/maintenance`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ ${maintenanceResponse.data.length} manutenções encontradas`);
    
    // 4. Listar lembretes
    console.log('\n4. Listando lembretes...');
    const remindersResponse = await axios.get(`${API_BASE}/reminders`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ ${remindersResponse.data.length} lembretes encontrados`);
    
    console.log('\n✅ Todas as rotas básicas estão funcionando!');
    
  } catch (error) {
    console.error('\n❌ Erro no teste:', error.response?.status, error.response?.data || error.message);
  }
}

async function testDeleteRoutes() {
  if (!authToken) {
    console.log('❌ Execute testAPI() primeiro para obter o token');
    return;
  }
  
  try {
    console.log('\n🗑️ Testando rotas DELETE...');
    
    // Verificar se as rotas DELETE existem (devem retornar 404 para IDs inexistentes, não 400)
    
    // Teste DELETE veículo inexistente
    try {
      await axios.delete(`${API_BASE}/vehicles/inexistent-id`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (error) {
      const status = error.response?.status;
      if (status === 404) {
        console.log('✅ DELETE /vehicles/:id - Rota configurada (404 esperado)');
      } else {
        console.log(`❌ DELETE /vehicles/:id - Status inesperado: ${status}`);
      }
    }
    
    // Teste DELETE manutenção inexistente
    try {
      await axios.delete(`${API_BASE}/maintenance/inexistent-id`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (error) {
      const status = error.response?.status;
      if (status === 404) {
        console.log('✅ DELETE /maintenance/:id - Rota configurada (404 esperado)');
      } else {
        console.log(`❌ DELETE /maintenance/:id - Status inesperado: ${status}`);
      }
    }
    
    // Teste DELETE lembrete inexistente
    try {
      await axios.delete(`${API_BASE}/reminders/inexistent-id`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch (error) {
      const status = error.response?.status;
      if (status === 404) {
        console.log('✅ DELETE /reminders/:id - Rota configurada (404 esperado)');
      } else {
        console.log(`❌ DELETE /reminders/:id - Status inesperado: ${status}`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Erro no teste de DELETE:', error.message);
  }
}

// Executar testes
testAPI().then(() => {
  if (authToken) {
    testDeleteRoutes();
  }
}); 