import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Activity,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  UserX,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getHorariosRequest } from "../../services/api";
import api from "../../services/api";

const STATUS_CONFIG = {
  agendado:  { label: "Agendado",  bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-400" },
  completo:  { label: "Concluído", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400" },
  cancelado: { label: "Cancelado", bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-400" },
  faltou:    { label: "Faltou",    bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400" },
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState({});
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadHorarios = useCallback(async () => {
    setLoadingData(true);
    setFetchError(null);
    try {
      const { data } = await getHorariosRequest();
      const horarios = data.horarios;
      if (!Array.isArray(horarios)) { setFetchError("Resposta inesperada do servidor."); return; }

      const grouped = {};
      horarios.forEach((h) => {
        if (!grouped[h.data]) grouped[h.data] = [];
        grouped[h.data].push({
          id_horario:     h.id_horario,
          id_agendamento: h.id_agendamento,
          time:           h.hora,
          timeEnd:        h.hora_fim,
          disponivel:     h.disponivel,
          status:         h.status,
          patient:        h.paciente,
          phone:          h.telefone,
          idade:          h.idade,
          peso:           h.peso,
          height:         h.altura,
          conditions:     h.comorbidades,
          details:        h.motivo,
        });
      });
      setAppointments(grouped);
    } catch (err) {
      setFetchError("Não foi possível carregar os horários.");
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { loadHorarios(); }, [loadHorarios]);

  const handleStatusChange = async (idAgendamento, novoStatus) => {
    setUpdatingId(idAgendamento);
    try {
      await api.patch(`/agendamentos/${idAgendamento}/status`, { status: novoStatus });
      await loadHorarios();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => { logout(); navigate("/", { replace: true }); };

  const formatDateKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const getDayStatus = (date) => {
    const dayApts = appointments[formatDateKey(date)];
    if (!dayApts) return "none";
    const comPaciente = dayApts.filter((a) => a.patient);
    if (comPaciente.length === 0) return "empty";
    if (comPaciente.length === dayApts.length) return "full";
    return "partial";
  };

  const statusDot = { none: "bg-gray-200", empty: "bg-emerald-400", partial: "bg-amber-400", full: "bg-red-400" };
  const getDaysInMonth = (date) => ({
    daysInMonth: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
    startingDayOfWeek: new Date(date.getFullYear(), date.getMonth(), 1).getDay(),
  });
  const changeMonth = (inc) =>
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + inc, 1));
  const todayStr = new Date().toDateString();

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedDate);
    const cells = [];
    for (let i = 0; i < startingDayOfWeek; i++) cells.push(<div key={`e-${i}`} />);
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === todayStr;
      const status = getDayStatus(date);
      cells.push(
        <button key={day} onClick={() => setSelectedDate(date)}
          className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all duration-150
            ${isSelected ? "bg-brand-600 text-white shadow-md shadow-brand-500/30"
              : isToday  ? "bg-brand-50 text-brand-700 font-bold"
              : "hover:bg-gray-50 text-gray-700"}`}>
          <span>{day}</span>
          <span className={`w-1.5 h-1.5 rounded-full mt-0.5
            ${isSelected ? "bg-white/60" : statusDot[status]}
            ${status === "none" ? "opacity-0" : "opacity-100"}`} />
        </button>
      );
    }
    return cells;
  };

  const renderAppointments = () => {
    const dayApts = appointments[formatDateKey(selectedDate)] || [];

    if (loadingData) return [1,2,3].map((i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />);
    if (fetchError)  return <div className="text-center py-10 text-red-400 text-sm">{fetchError}</div>;
    if (dayApts.length === 0) return (
      <div className="text-center py-12 text-gray-400">
        <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Sem horários neste dia.</p>
      </div>
    );

    return dayApts.map((apt, i) => {
      const cfg = apt.status ? STATUS_CONFIG[apt.status] : null;
      const isUpdating = updatingId === apt.id_agendamento;
      return (
        <div key={i} className={`rounded-xl border p-4 transition-all ${
          apt.patient ? `bg-white ${cfg?.border || "border-gray-200"} shadow-sm` : "bg-gray-50 border-dashed border-gray-200"}`}>
          
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-brand-700 font-bold">
              <Clock className="w-4 h-4" />
              <span>{apt.time}</span>
              {apt.timeEnd && <span className="text-xs font-normal text-gray-400">até {apt.timeEnd}</span>}
            </div>
            {apt.patient && cfg ? (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${cfg.bg} ${cfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
              </span>
            ) : !apt.patient ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">Disponível</span>
            ) : null}
          </div>

          {/* Dados */}
          {apt.patient ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-brand-600" />
                </div>
                <span className="font-semibold text-gray-800 text-sm">{apt.patient}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <Stat label="Idade"  value={apt.idade  ? `${apt.idade} anos` : "—"} />
                <Stat label="Peso"   value={apt.peso   ? `${apt.peso} kg`    : "—"} />
                <Stat label="Altura" value={apt.height ? `${apt.height} m`   : "—"} />
              </div>
              <div className="pt-2 border-t border-gray-100 space-y-1.5">
                <InfoRow icon={<Activity className="w-3.5 h-3.5" />} label="Comorbidades"
                  value={Array.isArray(apt.conditions) ? apt.conditions.join(", ") : apt.conditions} />
                <InfoRow icon={<FileText className="w-3.5 h-3.5" />} label="Motivo"    value={apt.details} />
                {apt.phone && <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Telefone" value={apt.phone} />}
              </div>

              {/* Controles de status */}
              {apt.id_agendamento && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Marcar consulta como:</p>
                  <div className="flex gap-2 flex-wrap">
                    <StatusBtn label="Concluída" icon={<CheckCircle className="w-3.5 h-3.5" />}
                      active={apt.status === "completo"}  disabled={isUpdating}
                      colorActive="bg-emerald-500 text-white" colorIdle="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      onClick={() => handleStatusChange(apt.id_agendamento, "completo")} />
                    <StatusBtn label="Cancelada" icon={<XCircle className="w-3.5 h-3.5" />}
                      active={apt.status === "cancelado"} disabled={isUpdating}
                      colorActive="bg-red-500 text-white"     colorIdle="bg-red-50 text-red-700 hover:bg-red-100"
                      onClick={() => handleStatusChange(apt.id_agendamento, "cancelado")} />
                    <StatusBtn label="Faltou"    icon={<UserX className="w-3.5 h-3.5" />}
                      active={apt.status === "faltou"}    disabled={isUpdating}
                      colorActive="bg-amber-500 text-white"   colorIdle="bg-amber-50 text-amber-700 hover:bg-amber-100"
                      onClick={() => handleStatusChange(apt.id_agendamento, "faltou")} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-xs text-gray-400 py-1">Horário disponível</p>
          )}
        </div>
      );
    });
  };

  const todayKey = formatDateKey(new Date());
  const todayApts = appointments[todayKey] || [];
  const todayFilled     = todayApts.filter((a) => a.patient).length;
  const todayFree       = todayApts.length - todayFilled;
  const todayConcluidos = todayApts.filter((a) => a.status === "completo").length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm shadow-brand-500/30">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display text-lg font-bold text-gray-900">SanitAIs</span>
              <span className="hidden sm:inline text-xs text-gray-400 ml-2">Sistema de Triagem</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center">
                <User className="w-3 h-3 text-brand-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.nome || "Médico"}</span>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Agendados hoje"  value={todayFilled}     color="text-brand-600" />
          <StatCard label="Concluídos hoje" value={todayConcluidos} color="text-emerald-600" />
          <StatCard label="Disponíveis"     value={todayFree}       color="text-gray-600" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendário */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-gray-900">Calendário</h2>
              <div className="flex items-center gap-1">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-sm font-semibold text-gray-700 min-w-[140px] text-center capitalize">
                  {selectedDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </span>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mb-5 px-3 py-2.5 bg-gray-50 rounded-xl text-xs text-gray-600">
              {[{dot:"bg-emerald-400",label:"Disponível"},{dot:"bg-amber-400",label:"Parcial"},{dot:"bg-red-400",label:"Completo"}].map(({dot,label})=>(
                <div key={label} className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${dot}`}/>{label}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map((d)=>(
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
          </div>

          {/* Painel lateral */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <h2 className="font-display text-lg font-bold text-gray-900 mb-1">Agendamentos</h2>
            <p className="text-sm text-gray-500 mb-5 capitalize">
              {selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
            </p>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
              {renderAppointments()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
      <p className="text-gray-400 text-[10px] uppercase tracking-wider">{label}</p>
      <p className="text-gray-800 font-semibold text-xs mt-0.5">{value}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2 text-xs text-gray-600">
      <span className="text-gray-400 mt-0.5">{icon}</span>
      <span>
        <span className="text-gray-400">{label}: </span>
        <span className="font-medium text-gray-700">{value || "—"}</span>
      </span>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-4 shadow-sm">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function StatusBtn({ label, icon, active, disabled, colorActive, colorIdle, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled || active}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
        ${active ? colorActive : colorIdle}
        ${disabled && !active ? "opacity-50 cursor-not-allowed" : ""}
        ${active ? "cursor-default" : ""}`}>
      {icon}{label}
    </button>
  );
}
