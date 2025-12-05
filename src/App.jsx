import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Activity, FileText, LogOut, Menu, X } from 'lucide-react';

const MedicalTriagePlatform = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dados de exemplo para agendamentos
  const appointments = {
    '2025-12-05': [
      { time: '08:00', patient: 'Maria Silva', age: 45, weight: 68, height: 165, conditions: 'Hipertensão', details: 'Consulta de rotina', phone: '(85) 98765-4321' },
      { time: '09:00', patient: 'João Santos', age: 32, weight: 82, height: 178, conditions: 'Nenhuma', details: 'Dor nas costas há 3 dias', phone: '(85) 91234-5678' },
      { time: '10:00', patient: null },
      { time: '11:00', patient: 'Ana Costa', age: 28, weight: 55, height: 160, conditions: 'Asma', details: 'Renovação de receita', phone: '(85) 99876-5432' },
      { time: '14:00', patient: null },
      { time: '15:00', patient: 'Pedro Oliveira', age: 58, weight: 90, height: 175, conditions: 'Diabetes tipo 2', details: 'Acompanhamento mensal', phone: '(85) 98321-7654' },
      { time: '16:00', patient: null },
      { time: '17:00', patient: null },
    ],
    '2025-12-06': [
      { time: '08:00', patient: 'Carlos Lima', age: 41, weight: 75, height: 170, conditions: 'Nenhuma', details: 'Check-up anual', phone: '(85) 97654-3210' },
      { time: '09:00', patient: null },
      { time: '10:00', patient: null },
      { time: '11:00', patient: null },
      { time: '14:00', patient: null },
      { time: '15:00', patient: null },
      { time: '16:00', patient: null },
      { time: '17:00', patient: null },
    ],
    '2025-12-07': [
      { time: '08:00', patient: 'Lucia Ferreira', age: 35, weight: 62, height: 158, conditions: 'Nenhuma', details: 'Consulta pré-natal', phone: '(85) 96543-2109' },
      { time: '09:00', patient: 'Roberto Alves', age: 52, weight: 88, height: 182, conditions: 'Hipertensão, Colesterol alto', details: 'Revisão de medicamentos', phone: '(85) 95432-1098' },
      { time: '10:00', patient: 'Fernanda Rocha', age: 29, weight: 58, height: 163, conditions: 'Nenhuma', details: 'Dor de cabeça recorrente', phone: '(85) 94321-0987' },
      { time: '11:00', patient: 'Marcos Souza', age: 44, weight: 79, height: 176, conditions: 'Nenhuma', details: 'Exames de rotina', phone: '(85) 93210-9876' },
      { time: '14:00', patient: 'Juliana Melo', age: 38, weight: 64, height: 161, conditions: 'Tireoide', details: 'Acompanhamento endócrino', phone: '(85) 92109-8765' },
      { time: '15:00', patient: 'Ricardo Barbosa', age: 50, weight: 95, height: 180, conditions: 'Diabetes, Obesidade', details: 'Consulta nutricional', phone: '(85) 91098-7654' },
      { time: '16:00', patient: 'Patricia Dias', age: 33, weight: 60, height: 165, conditions: 'Nenhuma', details: 'Resultado de exames', phone: '(85) 90987-6543' },
      { time: '17:00', patient: 'Gabriel Martins', age: 26, weight: 73, height: 174, conditions: 'Nenhuma', details: 'Atestado médico', phone: '(85) 89876-5432' },
    ],
  };

  const getDayStatus = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayAppointments = appointments[dateStr];
    
    if (!dayAppointments) return 'empty';
    
    const totalSlots = dayAppointments.length;
    const filledSlots = dayAppointments.filter(apt => apt.patient).length;
    
    if (filledSlots === 0) return 'empty';
    if (filledSlots === totalSlots) return 'full';
    return 'partial';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'empty': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      case 'full': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const changeMonth = (increment) => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + increment, 1));
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedDate);
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const status = getDayStatus(date);
      const isSelected = date.toDateString() === selectedDate.toDateString();
      
      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`aspect-square p-2 rounded-lg border-2 transition-all hover:scale-105 ${
            isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <span className="text-sm font-semibold mb-1">{day}</span>
            <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
          </div>
        </button>
      );
    }
    
    return days;
  };

  const renderAppointments = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const dayAppointments = appointments[dateStr] || [];
    
    return dayAppointments.map((apt, index) => (
      <div key={index} className={`p-4 rounded-lg border-2 ${apt.patient ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-lg">{apt.time}</span>
          </div>
          {apt.patient ? (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Agendado</span>
          ) : (
            <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-sm font-semibold">Disponível</span>
          )}
        </div>
        
        {apt.patient ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-600" />
              <span className="font-semibold">{apt.patient}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-600">Idade:</span> <span className="font-medium">{apt.age} anos</span></div>
              <div><span className="text-gray-600">Peso:</span> <span className="font-medium">{apt.weight} kg</span></div>
              <div><span className="text-gray-600">Altura:</span> <span className="font-medium">{apt.height} cm</span></div>
              <div className="flex items-center space-x-1">
                <Phone className="w-3 h-3 text-gray-600" />
                <span className="font-medium text-xs">{apt.phone}</span>
              </div>
            </div>
            <div className="flex items-start space-x-2 pt-2 border-t">
              <Activity className="w-4 h-4 text-gray-600 mt-1" />
              <div>
                <div className="text-sm"><span className="text-gray-600">Comorbidades:</span> <span className="font-medium">{apt.conditions}</span></div>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <FileText className="w-4 h-4 text-gray-600 mt-1" />
              <div>
                <div className="text-sm"><span className="text-gray-600">Detalhes:</span> <span className="font-medium">{apt.details}</span></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-2">
            Horário disponível para agendamento
          </div>
        )}
      </div>
    ));
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">SanitAIs</h1>
            <p className="text-gray-600">Triagem Médica Inteligente</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                placeholder="seu@email.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Senha</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition"
              />
            </div>
            
            <button 
              onClick={() => setIsLoggedIn(true)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition transform hover:scale-105"
            >
              Entrar
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-blue-600 hover:underline">Esqueceu a senha?</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">SanitAIs</h1>
                <p className="text-xs text-gray-500">Sistema de Triagem</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Dr. João Silva</span>
              </div>
              <button 
                onClick={() => setIsLoggedIn(false)}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Calendário</h2>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => changeMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  ←
                </button>
                <span className="font-semibold px-4">
                  {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </span>
                <button 
                  onClick={() => changeMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  →
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Disponível</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Parcial</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Completo</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                  {day}
                </div>
              ))}
              {renderCalendar()}
            </div>
          </div>

          {/* Appointments Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Agendamentos - {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            </h2>
            <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
              {renderAppointments()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MedicalTriagePlatform;