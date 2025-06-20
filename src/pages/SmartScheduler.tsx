
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MessageSquare, Plus } from 'lucide-react';
import { useState } from 'react';
import { SmartCalendar } from '@/components/scheduler/SmartCalendar';
import { AIChat } from '@/components/scheduler/AIChat';
import { CreateAppointmentDialog } from '@/components/scheduler/CreateAppointmentDialog';
import { Button } from '@/components/ui/button';

const SmartScheduler = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);

  const handleAICommand = (command: string) => {
    // A IA processará o comando e atualizará os compromissos
    console.log('Comando da IA:', command);
    // Aqui integraria com a IA para processar comandos naturais
  };

  const handleCreateAppointment = (appointment: any) => {
    setAppointments([...appointments, { ...appointment, id: Date.now() }]);
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Agenda Inteligente
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gerencie seus compromissos com comandos naturais via IA
              </p>
            </div>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-drystore-orange hover:bg-drystore-orange-light text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Compromisso
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendário */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                  <Calendar className="w-5 h-5 mr-2 text-drystore-orange" />
                  Calendário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SmartCalendar 
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  appointments={appointments}
                  onUpdateAppointments={setAppointments}
                />
              </CardContent>
            </Card>
          </div>

          {/* Chat com IA */}
          <div>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-full">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                  <MessageSquare className="w-5 h-5 mr-2 text-drystore-orange" />
                  Chat com IA
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <AIChat 
                  onCommand={handleAICommand}
                  appointments={appointments}
                  onUpdateAppointments={setAppointments}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <CreateAppointmentDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onCreateAppointment={handleCreateAppointment}
        />
      </div>
    </Layout>
  );
};

export default SmartScheduler;
