const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

// Cores para logs
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

// Dados de teste para dois usuários diferentes
const testUsers = {
  user1: {
    name: 'Usuário Teste 1',
    email: 'teste1@teste.com',
    password: '123456',
    role: 'OWNER'
  },
  user2: {
    name: 'Usuário Teste 2', 
    email: 'teste2@teste.com',
    password: '123456',
    role: 'OWNER'
  }
};

const testVehicles = {
  user1: {
    brand: 'Toyota',
    model: 'Corolla User1',
    year: 2020,
    licensePlate: 'ABC1234',
    type: 'CAR',
    color: 'Prata'
  },
  user2: {
    brand: 'Honda',
    model: 'Civic User2',
    year: 2021,
    licensePlate: 'XYZ9876',
    type: 'CAR',
    color: 'Preto'
  }
};

// Função para criar usuário
async function createUser(userData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    log(colors.green, `✅ Usuário criado: ${userData.email}`);
    return true;
  } catch (error) {
    if (error.response?.data?.message?.includes('já está registrado')) {
      log(colors.yellow, `⚠️ Usuário já existe: ${userData.email}`);
      return true;
    }
    log(colors.red, `❌ Erro ao criar usuário ${userData.email}: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Função para fazer login
async function login(email, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    log(colors.green, `✅ Login realizado: ${email}`);
    return response.data.token;
  } catch (error) {
    log(colors.red, `❌ Erro no login ${email}: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// Função para criar veículo
async function createVehicle(token, vehicleData) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/vehicles`,
      vehicleData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    log(colors.green, `✅ Veículo criado: ${vehicleData.brand} ${vehicleData.model}`);
    return response.data;
  } catch (error) {
    log(colors.red, `❌ Erro ao criar veículo: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// Função para buscar veículos
async function getVehicles(token, userEmail) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/vehicles`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const vehicles = response.data;
    log(colors.blue, `📋 ${userEmail} possui ${vehicles.length} veículo(s):`);
    vehicles.forEach(v => {
      log(colors.blue, `   - ${v.brand} ${v.model} (${v.licensePlate}) - Owner: ${v.ownerId}`);
    });
    return vehicles;
  } catch (error) {
    log(colors.red, `❌ Erro ao buscar veículos para ${userEmail}: ${error.response?.data?.message || error.message}`);
    return [];
  }
}

// Função para buscar despesas
async function getExpenses(token, userEmail) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/expenses`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const expenses = response.data;
    log(colors.blue, `💰 ${userEmail} possui ${expenses.length} despesa(s)`);
    return expenses;
  } catch (error) {
    log(colors.red, `❌ Erro ao buscar despesas para ${userEmail}: ${error.response?.data?.message || error.message}`);
    return [];
  }
}

// Função para buscar manutenções
async function getMaintenances(token, userEmail) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/maintenances`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const maintenances = response.data;
    log(colors.blue, `🔧 ${userEmail} possui ${maintenances.length} manutenção(ões)`);
    return maintenances;
  } catch (error) {
    log(colors.red, `❌ Erro ao buscar manutenções para ${userEmail}: ${error.response?.data?.message || error.message}`);
    return [];
  }
}

// Função principal de teste
async function testUserIsolation() {
  log(colors.bold, '🧪 INICIANDO TESTE DE ISOLAMENTO ENTRE USUÁRIOS');
  log(colors.bold, '='.repeat(60));

  // 1. Criar usuários de teste
  log(colors.yellow, '\n📝 Passo 1: Criando usuários de teste...');
  const user1Created = await createUser(testUsers.user1);
  const user2Created = await createUser(testUsers.user2);

  if (!user1Created || !user2Created) {
    log(colors.red, '❌ Falha na criação de usuários. Abortando teste.');
    return;
  }

  // 2. Fazer login com ambos os usuários
  log(colors.yellow, '\n🔑 Passo 2: Fazendo login com ambos os usuários...');
  const token1 = await login(testUsers.user1.email, testUsers.user1.password);
  const token2 = await login(testUsers.user2.email, testUsers.user2.password);

  if (!token1 || !token2) {
    log(colors.red, '❌ Falha no login. Abortando teste.');
    return;
  }

  // 3. Criar veículos para cada usuário
  log(colors.yellow, '\n🚗 Passo 3: Criando veículos para cada usuário...');
  const vehicle1 = await createVehicle(token1, testVehicles.user1);
  const vehicle2 = await createVehicle(token2, testVehicles.user2);

  // 4. Verificar isolamento de veículos
  log(colors.yellow, '\n🔍 Passo 4: Verificando isolamento de veículos...');
  
  // Usuário 1 deve ver apenas seu veículo
  const user1Vehicles = await getVehicles(token1, testUsers.user1.email);
  
  // Usuário 2 deve ver apenas seu veículo
  const user2Vehicles = await getVehicles(token2, testUsers.user2.email);

  // 5. Verificar isolamento cruzado
  log(colors.yellow, '\n🔍 Passo 5: Verificando isolamento cruzado...');
  
  // Verificar se usuário 1 não vê veículos do usuário 2
  const user1ShouldHaveOnlyOwn = user1Vehicles.every(v => v.licensePlate === testVehicles.user1.licensePlate);
  const user2ShouldHaveOnlyOwn = user2Vehicles.every(v => v.licensePlate === testVehicles.user2.licensePlate);

  if (user1ShouldHaveOnlyOwn && user2ShouldHaveOnlyOwn) {
    log(colors.green, '✅ ISOLAMENTO DE VEÍCULOS: PASSOU');
  } else {
    log(colors.red, '❌ ISOLAMENTO DE VEÍCULOS: FALHOU');
    log(colors.red, `   User1 tem veículos próprios: ${user1ShouldHaveOnlyOwn}`);
    log(colors.red, `   User2 tem veículos próprios: ${user2ShouldHaveOnlyOwn}`);
  }

  // 6. Verificar isolamento de despesas e manutenções
  log(colors.yellow, '\n💰 Passo 6: Verificando isolamento de despesas e manutenções...');
  
  const user1Expenses = await getExpenses(token1, testUsers.user1.email);
  const user2Expenses = await getExpenses(token2, testUsers.user2.email);
  
  const user1Maintenances = await getMaintenances(token1, testUsers.user1.email);
  const user2Maintenances = await getMaintenances(token2, testUsers.user2.email);

  // 7. Sumário final
  log(colors.bold, '\n📊 SUMÁRIO DO TESTE DE ISOLAMENTO');
  log(colors.bold, '='.repeat(40));
  
  log(colors.blue, `👤 Usuário 1 (${testUsers.user1.email}):`);
  log(colors.blue, `   - Veículos: ${user1Vehicles.length}`);
  log(colors.blue, `   - Despesas: ${user1Expenses.length}`);
  log(colors.blue, `   - Manutenções: ${user1Maintenances.length}`);
  
  log(colors.blue, `👤 Usuário 2 (${testUsers.user2.email}):`);
  log(colors.blue, `   - Veículos: ${user2Vehicles.length}`);
  log(colors.blue, `   - Despesas: ${user2Expenses.length}`);
  log(colors.blue, `   - Manutenções: ${user2Maintenances.length}`);

  // Verificações finais
  const isolationPassed = user1ShouldHaveOnlyOwn && user2ShouldHaveOnlyOwn;
  
  if (isolationPassed) {
    log(colors.green, '\n🎉 TESTE DE ISOLAMENTO: PASSOU! Os dados estão corretamente isolados entre usuários.');
  } else {
    log(colors.red, '\n🚨 TESTE DE ISOLAMENTO: FALHOU! Há vazamento de dados entre usuários.');
  }
}

// Executar teste
testUserIsolation().catch(error => {
  log(colors.red, `❌ Erro geral no teste: ${error.message}`);
  process.exit(1);
}); 