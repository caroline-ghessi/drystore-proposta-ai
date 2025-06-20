
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Clock, User, FileText } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
  id: number;
  title: string;
  client: string;
  time: string;
  date: Date;
  description?: string;
  type: 'meeting' | 'call' | 'visit' | 'followup';
}

interface SmartCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  appointments: Appointment[];
  onUpdateAppointments: (appointments: Appointment[]) => void;
}

export const SmartCalendar = ({ 
  selectedDate, 
  onDateSelect, 
  appointments, 
  onUpdateAppointments 
}: SmartCalendarProps) => {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');
  const [currentWeek, setCurrentWeek] = useState(selectedDate);

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => isSameDay(apt.date, date));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'call': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'visit': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'followup': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              className="text-gray-600 dark:text-gray-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {format(weekStart, "d 'de' MMMM", { locale: ptBR })} - {format(weekEnd, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              className="text-gray-600 dark:text-gray-300"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('day')}
            >
              Dia
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Semana
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Mês
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dayAppointments = getAppointmentsForDate(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);

            return (
              <Card 
                key={day.toISOString()}
                className={`cursor-pointer transition-colors min-h-[120px] ${
                  isSelected ? 'border-drystore-orange bg-orange-50 dark:bg-orange-950' : 
                  isToday ? 'border-blue-300 bg-blue-50 dark:bg-blue-950' : 
                  'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => onDateSelect(day)}
              >
                <CardContent className="p-2">
                  <div className="text-center mb-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                      {format(day, 'EEE', { locale: ptBR })}
                    </div>
                    <div className={`text-lg font-semibold ${
                      isToday ? 'text-blue-600 dark:text-blue-400' : 
                      'text-gray-900 dark:text-gray-100'
                    }`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 2).map((apt) => (
                      <div
                        key={apt.id}
                        className="text-xs p-1 rounded truncate"
                        style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', color: 'rgb(249, 115, 22)' }}
                      >
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{apt.time}</span>
                        </div>
                        <div className="truncate">{apt.title}</div>
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        +{dayAppointments.length - 2} mais
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
          </h3>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('day')}
            >
              Dia
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Semana
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Mês
            </Button>
          </div>
        </div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateSelect(date)}
          className="w-full"
          locale={ptBR}
        />
      </div>
    );
  };

  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(selectedDate);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDateSelect(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}
              className="text-gray-600 dark:text-gray-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDateSelect(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}
              className="text-gray-600 dark:text-gray-300"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('day')}
            >
              Dia
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Semana
            </Button>
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Mês
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {dayAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhum compromisso agendado para este dia
            </div>
          ) : (
            dayAppointments.map((apt) => (
              <Card key={apt.id} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getTypeColor(apt.type)}>
                          {apt.type === 'meeting' ? 'Reunião' :
                           apt.type === 'call' ? 'Ligação' :
                           apt.type === 'visit' ? 'Visita' : 'Follow-up'}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4 mr-1" />
                          {apt.time}
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {apt.title}
                      </h4>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <User className="w-4 h-4 mr-1" />
                        {apt.client}
                      </div>
                      {apt.description && (
                        <div className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                          <FileText className="w-4 h-4 mr-1 mt-0.5" />
                          {apt.description}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}
    </div>
  );
};
