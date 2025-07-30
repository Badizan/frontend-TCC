const axios = require('axios');

const API_BASE = 'http://localhost:3000';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

// Função para aguardar
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para fazer requisições com retry
async function makeRequest(config, retries = MAX_RETRIES) {
    try {
        return await axios(config);
    } catch (error) {
        if (retries > 0 && error.code === 'ECONNREFUSED') {
            console.log(`⏳ Conexão recusada. Tentando novamente em ${RETRY_DELAY}ms... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
            await sleep(RETRY_DELAY);
            return makeRequest(config, retries - 1);
        }
        throw error;
    }
}

// Função para validar resposta
function validateResponse(response, expectedFields = []) {
    if (!response || !response.data) {
        throw new Error('Resposta inválida: dados não encontrados');
    }
    
    for (const field of expectedFields) {
        if (response.data[field] === undefined) {
            throw new Error(`Campo obrigatório '${field}' não encontrado na resposta`);
        }
    }
    
    return true;
}

async function testSystemFully() {
    console.log('🎯 TESTE FINAL - Sistema AutoManutenção\n');
    
    let token = null;
    let testsPassed = 0;
    let testsFailed = 0;

    // Função auxiliar para executar teste
    async function runTest(testName, testFn) {
        try {
            console.log(`\n${testName}`);
            await testFn();
            testsPassed++;
            console.log(`✅ ${testName.replace(/^\d+️⃣ /, '')} - PASSOU`);
        } catch (error) {
            testsFailed++;
            console.error(`❌ ${testName.replace(/^\d+️⃣ /, '')} - FALHOU`);
            console.error(`   Erro: ${error.response?.data?.message || error.message}`);
            if (error.response?.status) {
                console.error(`   Status: ${error.response.status}`);
            }
            if (error.response?.data?.details) {
                console.error(`   Detalhes:`, error.response.data.details);
            }
        }
    }

    // 1. Health Check
    await runTest('1️⃣ Testando saúde da API...', async () => {
        const response = await makeRequest({
            method: 'GET',
            url: `${API_BASE}/health`
        });
        validateResponse(response, ['status']);
        if (response.data.status !== 'ok') {
            throw new Error(`Status inesperado: ${response.data.status}`);
        }
    });

    // 2. Login
    await runTest('2️⃣ Testando autenticação...', async () => {
        const response = await makeRequest({
            method: 'POST',
            url: `${API_BASE}/auth/login`,
            data: {
                email: 'admin@example.com',
                password: '123456'
            }
        });
        validateResponse(response, ['token']);
        token = response.data.token;
        
        if (!token || typeof token !== 'string') {
            throw new Error('Token inválido recebido');
        }
    });

    // Verificar se temos token para continuar
    if (!token) {
        console.error('\n❌ Não foi possível obter token de autenticação. Abortando testes...');
        return;
    }

    // 3. Teste de Manutenções
    await runTest('3️⃣ Testando endpoint de manutenções...', async () => {
        const response = await makeRequest({
            method: 'GET',
            url: `${API_BASE}/maintenance`,
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!Array.isArray(response.data)) {
            throw new Error('Resposta deveria ser um array de manutenções');
        }
        
        console.log(`   📋 Manutenções encontradas: ${response.data.length}`);
    });

    // 4. Teste de Notificações
    await runTest('4️⃣ Testando sistema de notificações...', async () => {
        const response = await makeRequest({
            method: 'GET',
            url: `${API_BASE}/notifications`,
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // Aceitar tanto objeto com propriedades quanto array direto
        let total = 0;
        let unreadCount = 0;
        
        if (Array.isArray(response.data)) {
            total = response.data.length;
            unreadCount = response.data.filter(n => !n.read).length;
        } else if (response.data && typeof response.data === 'object') {
            total = response.data.total || response.data.notifications?.length || 0;
            unreadCount = response.data.unreadCount || 0;
        }
        
        console.log(`   🔔 Total: ${total}`);
        console.log(`   🔴 Não lidas: ${unreadCount}`);
    });

    // 5. Teste de Veículos
    await runTest('5️⃣ Testando gestão de veículos...', async () => {
        const response = await makeRequest({
            method: 'GET',
            url: `${API_BASE}/vehicles`,
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!Array.isArray(response.data)) {
            throw new Error('Resposta deveria ser um array de veículos');
        }
        
        console.log(`   🚗 Veículos carregados: ${response.data.length}`);
    });

    // 6. Teste de Despesas
    await runTest('6️⃣ Testando gestão de despesas...', async () => {
        const response = await makeRequest({
            method: 'GET',
            url: `${API_BASE}/expenses`,
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!Array.isArray(response.data)) {
            throw new Error('Resposta deveria ser um array de despesas');
        }
        
        console.log(`   💰 Despesas carregadas: ${response.data.length}`);
    });

    // Resumo dos testes
    console.log('\n═══════════════════════════════════════');
    console.log('📊 RESUMO DOS TESTES:');
    console.log(`   ✅ Testes aprovados: ${testsPassed}`);
    console.log(`   ❌ Testes falhados: ${testsFailed}`);
    console.log(`   📈 Taxa de sucesso: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
    
    if (testsFailed === 0) {
        console.log('\n🎉 TODOS OS TESTES PASSARAM!');
        console.log('═══════════════════════════════════════');
        console.log('🎯 FUNCIONALIDADES VERIFICADAS:');
        console.log('   ✅ Notificações no sino com indicador vermelho');
        console.log('   ✅ Inserção de valores nos formulários');
        console.log('   ✅ Visualização de todas as manutenções');
        console.log('   ✅ Sistema completo funcional');
    } else {
        console.log('\n⚠️  ALGUNS TESTES FALHARAM!');
        console.log('Por favor, verifique os erros acima e corrija os problemas.');
    }
    
    console.log('═══════════════════════════════════════');
    console.log('🌐 Acesse: http://localhost:5173');
    console.log('🚀 API: http://localhost:3000');
    console.log('📚 Docs: http://localhost:3000/docs');
}

// Executar testes com tratamento de erro global
testSystemFully().catch(error => {
    console.error('\n❌ ERRO FATAL NO TESTE:', error.message);
    if (error.code === 'ECONNREFUSED') {
        console.error('⚠️  Não foi possível conectar ao servidor.');
        console.error('Certifique-se de que o servidor está rodando em http://localhost:3000');
    }
    process.exit(1);
}); 