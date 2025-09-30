from datetime import datetime, date, time, timedelta
import pytz

# Defina o timezone principal do sistema
DEFAULT_TZ = pytz.timezone("America/Sao_Paulo")

def parse_datetime(dt_str: str, fmt: str = "%Y-%m-%dT%H:%M") -> datetime:

    dt = datetime.strptime(dt_str, fmt)
    return DEFAULT_TZ.localize(dt)

def format_datetime(dt: datetime, fmt: str = "%Y-%m-%d %H:%M") -> str:

    return dt.strftime(fmt)

def calcular_idade(data_nascimento: date) -> int:
    hoje = date.today()
    return hoje.year - data_nascimento.year - (
        (hoje.month, hoje.day) < (data_nascimento.month, data_nascimento.day)
    )

def agora() -> datetime:

    return datetime.now(DEFAULT_TZ)

def is_future(dt: datetime) -> bool:

    return dt > agora()

def gerar_slots(data: date, inicio: time, fim: time, intervalo_minutos: int = 30):
    """
    Gera slots de horários entre um intervalo.
    Exemplo: gerar_slots(2025-09-30, 08:00, 12:00, 30)
    -> [08:00, 08:30, 09:00, ...]
    """
    slots = []
    dt_inicio = datetime.combine(data, inicio, tzinfo=DEFAULT_TZ)
    dt_fim = datetime.combine(data, fim, tzinfo=DEFAULT_TZ)
    while dt_inicio < dt_fim:
        slots.append(dt_inicio)
        dt_inicio += timedelta(minutes=intervalo_minutos)
    return slots
