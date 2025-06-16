import React, { useState } from 'react';

const ConnectivityTest: React.FC = () => {
  const [status, setStatus] = useState<string>('idle');
  const [result, setResult] = useState<any>(null);

  const testConnectivity = async () => {
    setStatus('testing');
    setResult(null);

    try {
      console.log('🔍 Testando conectividade com o backend...');
      
      // Teste 1: Endpoint raiz
      const response = await fetch('http://localhost:3333/');
      const data = await response.json();
      
      console.log('✅ Resposta do backend:', data);
      setResult(data);
      setStatus('success');
    } catch (error) {
      console.error('❌ Erro de conectividade:', error);
      setResult({ error: error instanceof Error ? error.message : 'Erro desconhecido' });
      setStatus('error');
    }
  };

  const testAuth = async () => {
    setStatus('testing-auth');
    try {
      const response = await fetch('http://localhost:3333/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: '123456'
        })
      });
      
      console.log('🔐 Status da resposta:', response.status);
      const data = await response.json();
      console.log('🔐 Teste de autenticação:', data);
      setResult(data);
      setStatus('success');
    } catch (error) {
      console.error('❌ Erro na autenticação:', error);
      setResult({ error: error instanceof Error ? error.message : 'Erro de autenticação' });
      setStatus('error');
    }
  };

  const testVehicleCreation = async () => {
    setStatus('testing-vehicle');
    try {
      // Primeiro fazer login
      const loginResponse = await fetch('http://localhost:3333/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: '123456'
        })
      });
      
      const loginData = await loginResponse.json();
      const token = loginData.token;
      
      // Depois tentar criar veículo
      const vehicleData = {
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        licensePlate: 'TEST-123',
        type: 'CAR',
        ownerId: loginData.user.id
      };
      
      const vehicleResponse = await fetch('http://localhost:3333/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(vehicleData)
      });
      
      const vehicleResult = await vehicleResponse.json();
      console.log('🚗 Teste de criação de veículo:', vehicleResult);
      setResult(vehicleResult);
      setStatus('success');
    } catch (error) {
      console.error('❌ Erro ao criar veículo:', error);
      setResult({ error: error instanceof Error ? error.message : 'Erro de criação' });
      setStatus('error');
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
      <h3 className="text-sm font-semibold mb-3">🔧 Teste de Conectividade</h3>
      
      <div className="space-y-2">
        <button
          onClick={testConnectivity}
          disabled={status === 'testing'}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
        >
          {status === 'testing' ? '🔄 Testando...' : '🌐 Testar Backend'}
        </button>
        
        <button
          onClick={testAuth}
          disabled={status === 'testing-auth'}
          className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
        >
          {status === 'testing-auth' ? '🔄 Testando...' : '🔐 Testar Auth'}
        </button>
        
        <button
          onClick={testVehicleCreation}
          disabled={status === 'testing-vehicle'}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs"
        >
          {status === 'testing-vehicle' ? '🔄 Testando...' : '🚗 Testar Veículo'}
        </button>
      </div>

      {result && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
          <pre className="whitespace-pre-wrap overflow-auto max-h-32">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        Status:         <span className={`font-medium ${
          status === 'success' ? 'text-green-600' : 
          status === 'error' ? 'text-red-600' : 
          'text-blue-600'
        }`}>
          {status === 'idle' ? 'Aguardando' :
           status === 'testing' ? 'Testando...' :
           status === 'testing-auth' ? 'Autenticando...' :
           status === 'testing-vehicle' ? 'Criando veículo...' :
           status === 'success' ? 'Sucesso' :
           'Erro'}
        </span>
      </div>
    </div>
  );
};

export default ConnectivityTest; 