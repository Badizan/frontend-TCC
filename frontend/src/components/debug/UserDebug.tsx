import React, { useEffect, useState } from 'react';
import { useStore } from '../../store';

export const UserDebug: React.FC = () => {
  const { user, isAuthenticated } = useStore();
  const [userValidation, setUserValidation] = useState<{
    isValid: boolean;
    errors: string[];
  }>({ isValid: true, errors: [] });

  useEffect(() => {
    if (user) {
      console.log('🔍 Debug: Dados do usuário:', user);
      
      const errors: string[] = [];
      
      // Check if user has ID
      if (!user.id) {
        errors.push('Usuário não possui ID');
      } else {
        console.log('🔍 Debug: ID do usuário:', user.id);
        console.log('🔍 Debug: Tipo do ID:', typeof user.id);
        
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(user.id)) {
          errors.push(`ID não é um UUID válido: ${user.id}`);
        } else {
          console.log('✅ ID é um UUID válido');
        }
      }

      setUserValidation({
        isValid: errors.length === 0,
        errors
      });
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: '#ffcccc',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        border: '1px solid #ff0000',
        zIndex: 9999
      }}>
        ❌ Usuário não autenticado
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: userValidation.isValid ? '#ccffcc' : '#ffcccc',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      border: `1px solid ${userValidation.isValid ? '#00aa00' : '#ff0000'}`,
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div><strong>👤 User Debug</strong></div>
      <div>Email: {user.email}</div>
      <div>ID: {user.id}</div>
      <div>Status: {userValidation.isValid ? '✅ Válido' : '❌ Inválido'}</div>
      {userValidation.errors.length > 0 && (
        <div style={{ marginTop: '5px', color: 'red' }}>
          <strong>Erros:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '15px' }}>
            {userValidation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 