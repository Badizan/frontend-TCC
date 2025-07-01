import React, { useEffect, useState } from 'react';
import { notificationService, NotificationSettings } from '../../services/notificationService';
import { Bell, Mail, Clock, Car, DollarSign, AlertTriangle } from 'lucide-react';

interface NotificationCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const notificationCategories: NotificationCategory[] = [
  {
    id: 'maintenance',
    title: 'Manutenções',
    description: 'Lembretes e alertas de manutenção programada',
    icon: <Car className="w-5 h-5" />
  },
  {
    id: 'expenses',
    title: 'Despesas',
    description: 'Alertas de limite de gastos e relatórios financeiros',
    icon: <DollarSign className="w-5 h-5" />
  },
  {
    id: 'reminders',
    title: 'Lembretes',
    description: 'Lembretes personalizados e alertas de quilometragem',
    icon: <Clock className="w-5 h-5" />
  },
  {
    id: 'system',
    title: 'Sistema',
    description: 'Atualizações do sistema e informações importantes',
    icon: <AlertTriangle className="w-5 h-5" />
  }
];

export function NotificationPreferences() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const userSettings = await notificationService.getNotificationSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelChange = (channel: string, enabled: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      channels: {
        ...settings.channels,
        [channel]: enabled
      }
    });
  };

  const handleCategoryChange = (categoryId: string, channel: string, enabled: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      categories: {
        ...settings.categories,
        [categoryId]: {
          ...settings.categories[categoryId],
          [channel]: enabled
        }
      }
    });
  };

  const handleAdvancedSettingChange = (setting: string, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      advancedSettings: {
        ...settings.advancedSettings,
        [setting]: value
      }
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await notificationService.updateNotificationSettings(settings);
      alert('Preferências salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      alert('Erro ao salvar preferências. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      await notificationService.sendTestEmail();
      setTestEmailSent(true);
      setTimeout(() => setTestEmailSent(false), 3000);
    } catch (error) {
      console.error('Erro ao enviar email de teste:', error);
      alert('Erro ao enviar email de teste. Verifique seu email cadastrado.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center p-8 text-red-600">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
        <p>Erro ao carregar preferências. Tente novamente mais tarde.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Cabeçalho */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Preferências de Notificação</h2>
        <p className="text-sm text-gray-600">Personalize como você deseja receber suas notificações</p>
      </div>

      <div className="p-6 space-y-8">
        {/* Canais de Notificação */}
        <section>
          <h3 className="text-lg font-medium mb-4">Canais de Notificação</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <label className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Notificações no App</span>
                    <p className="text-sm text-gray-600">Receba notificações enquanto usa o aplicativo</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.channels.inApp}
                    onChange={(e) => handleChannelChange('inApp', e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </label>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <label className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Notificações por Email</span>
                    <p className="text-sm text-gray-600">Receba atualizações importantes no seu email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.channels.email}
                    onChange={(e) => handleChannelChange('email', e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </label>
                {settings.channels.email && (
                  <button
                    onClick={handleTestEmail}
                    className={`mt-2 text-sm px-3 py-1 rounded ${
                      testEmailSent
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {testEmailSent ? '✓ Email de teste enviado' : 'Enviar email de teste'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Categorias de Notificação */}
        <section>
          <h3 className="text-lg font-medium mb-4">Categorias de Notificação</h3>
          <div className="grid grid-cols-1 gap-4">
            {notificationCategories.map((category) => (
              <div key={category.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  {category.icon}
                  <div>
                    <h4 className="font-medium">{category.title}</h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
                <div className="ml-8 space-y-2">
                  <label className="flex items-center justify-between text-sm">
                    <span>Notificações no App</span>
                    <input
                      type="checkbox"
                      checked={settings.categories[category.id]?.inApp}
                      onChange={(e) => handleCategoryChange(category.id, 'inApp', e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                  </label>
                  <label className="flex items-center justify-between text-sm">
                    <span>Notificações por Email</span>
                    <input
                      type="checkbox"
                      checked={settings.categories[category.id]?.email}
                      onChange={(e) => handleCategoryChange(category.id, 'email', e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Configurações Avançadas */}
        <section>
          <h3 className="text-lg font-medium mb-4">Configurações Avançadas</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Antecedência para lembretes de manutenção (dias)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.advancedSettings.maintenanceReminderDays}
                onChange={(e) => handleAdvancedSettingChange('maintenanceReminderDays', parseInt(e.target.value))}
                className="form-input w-full max-w-xs"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Alerta de quilometragem (km antes do limite)
              </label>
              <input
                type="number"
                min="100"
                max="5000"
                step="100"
                value={settings.advancedSettings.mileageAlertThreshold}
                onChange={(e) => handleAdvancedSettingChange('mileageAlertThreshold', parseInt(e.target.value))}
                className="form-input w-full max-w-xs"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Limite de gastos mensais para alertas (R$)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={settings.advancedSettings.monthlyExpenseLimit}
                onChange={(e) => handleAdvancedSettingChange('monthlyExpenseLimit', parseInt(e.target.value))}
                className="form-input w-full max-w-xs"
              />
            </div>
          </div>
        </section>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={() => loadSettings()}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Restaurar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Preferências'}
          </button>
        </div>
      </div>
    </div>
  );
}