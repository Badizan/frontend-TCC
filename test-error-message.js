// Teste para simular o erro de placa duplicada
const mockError = {
  response: {
    data: {
      message: "Você já possui um veículo cadastrado com a placa ASM-1234"
    }
  }
};

console.log('🔍 Teste - Tipo do erro:', typeof mockError);
console.log('🔍 Teste - error.message:', mockError?.message);
console.log('🔍 Teste - error.response:', mockError?.response);
console.log('🔍 Teste - error.response?.data:', mockError?.response?.data);
console.log('🔍 Teste - error.response?.data?.message:', mockError?.response?.data?.message);

// Simular a lógica de extração de erro
let errorMessage = 'Ocorreu um erro inesperado ao criar o veículo';

if (mockError?.response?.data?.message) {
  console.log('✅ Usando error.response.data.message:', mockError.response.data.message);
  errorMessage = mockError.response.data.message;
} else if (mockError?.message) {
  console.log('✅ Usando error.message:', mockError.message);
  errorMessage = mockError.message;
} else if (typeof mockError === 'string') {
  console.log('✅ Usando error como string:', mockError);
  errorMessage = mockError;
} else if (mockError?.response?.data) {
  console.log('✅ Usando error.response.data como string');
  const dataString = JSON.stringify(mockError.response.data);
  errorMessage = dataString;
}

console.log('🎯 Mensagem final:', errorMessage);

// Teste da função translateError
const translateError = (error) => {
  const lowerError = error.toLowerCase();
  
  if (lowerError.includes('já possui') && lowerError.includes('veículo')) {
    return 'Você já possui um veículo com esta placa. Use uma placa diferente.';
  }
  
  return error; // Retorna a mensagem original se não encontrar correspondência
};

const translatedMessage = translateError(errorMessage);
console.log('🔤 Mensagem traduzida:', translatedMessage); 