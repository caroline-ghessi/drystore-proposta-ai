
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, MessageSquare, Smartphone, Settings, Check, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'approval_pending' | 'deadline_approaching' | 'high_value_proposal' | 'system_alert';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionRequired: boolean;
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  push: boolean;
}

export const WorkflowNotifications = () => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'approval_pending',
      title: 'Aprovação Pendente',
      message: 'Desconto de 15% aguardando aprovação para PROP-2024-001',
      timestamp: '2024-01-16T11:30:00',
      isRead: false,
      priority: 'high',
      actionRequired: true
    },
    {
      id: '2',
      type: 'deadline_approaching',
      title: 'Prazo se Aproximando',
      message: 'Proposta PROP-2024-003 vence em 2 dias',
      timestamp: '2024-01-16T10:15:00',
      isRead: false,
      priority: 'medium',
      actionRequired: false
    },
    {
      id: '3',
      type: 'high_value_proposal',
      title: 'Proposta de Alto Valor',
      message: 'Nova proposta de R$ 500.000 criada - PROP-2024-008',
      timestamp: '2024-01-16T09:45:00',
      isRead: true,
      priority: 'high',
      actionRequired: true
    },
    {
      id: '4',
      type: 'system_alert',
      title: 'Atualização do Sistema',
      message: 'Sistema será atualizado hoje às 23:00',
      timestamp: '2024-01-16T08:30:00',
      isRead: true,
      priority: 'low',
      actionRequired: false
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: true,
    sms: false,
    whatsapp: true,
    push: true
  });

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'approval_pending':
        return <Bell className="w-4 h-4 text-orange-600" />;
      case 'deadline_approaching':
        return <Bell className="w-4 h-4 text-yellow-600" />;
      case 'high_value_proposal':
        return <Bell className="w-4 h-4 text-green-600" />;
      case 'system_alert':
        return <Settings className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="w-5 h-5 mr-2 text-indigo-600" />
          Notificações do Sistema
          {unreadCount > 0 && (
            <Badge className="ml-2 bg-red-100 text-red-800">
              {unreadCount} não lidas
            </Badge>
          )}
        </CardTitle>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'notifications' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('notifications')}
          >
            Notificações
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('settings')}
          >
            Configurações
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'notifications' ? (
          <div className="space-y-4">
            {unreadCount > 0 && (
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-sm text-gray-600">
                  {unreadCount} notificações não lidas
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Marcar todas como lidas
                </Button>
              </div>
            )}

            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border rounded-lg p-4 ${
                      !notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(notification.type)}
                        <h4 className={`font-medium ${!notification.isRead ? 'text-blue-900' : ''}`}>
                          {notification.title}
                        </h4>
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority.toUpperCase()}
                        </Badge>
                        {notification.actionRequired && (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            Ação Necessária
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(notification.timestamp).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">
                      {notification.message}
                    </p>
                    
                    <div className="flex space-x-2">
                      {!notification.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Marcar como lida
                        </Button>
                      )}
                      {notification.actionRequired && (
                        <Button size="sm">
                          Ver Detalhes
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma notificação</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Preferências de Notificação</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-gray-600">Receber notificações por email</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.email}
                    onCheckedChange={(checked) =>
                      setNotificationSettings(prev => ({ ...prev, email: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">SMS</p>
                      <p className="text-sm text-gray-600">Receber notificações por SMS</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.sms}
                    onCheckedChange={(checked) =>
                      setNotificationSettings(prev => ({ ...prev, sms: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">WhatsApp</p>
                      <p className="text-sm text-gray-600">Receber notificações pelo WhatsApp</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.whatsapp}
                    onCheckedChange={(checked) =>
                      setNotificationSettings(prev => ({ ...prev, whatsapp: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-600">Receber notificações push no navegador</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.push}
                    onCheckedChange={(checked) =>
                      setNotificationSettings(prev => ({ ...prev, push: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Configurações Avançadas</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar Horários de Notificação
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="w-4 h-4 mr-2" />
                  Gerenciar Tipos de Notificação
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Configurar Templates de Mensagem
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
