import { useState, useEffect } from "react";

const defaultState = {
  armed: true,
  engineRunning: false,
  engineTimer: 0,
  doorsLocked: true,
  serviceMode: false,
  engineBlocked: false,
  heater: false,
  fuel: 62,
  tempEngine: 87,
  tempOutside: -4,
  odo: 48231,
  batteryMain: 12.4,
  gsm: 4,
  gps: 3,
  daysTillService: 23,
  daysTillSub: 147,
  online: true,
};

function useCarState() {
  const [s, set] = useState(defaultState);
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2200);
  };

  const cmd = (label, fn) => {
    notify(`Отправлено: ${label}`, "send");
    setTimeout(() => { fn(); notify(`✓ ${label}`, "ok"); }, 800);
  };

  useEffect(() => {
    if (!s.engineRunning) return;
    const id = setInterval(() => set(p => ({ ...p, engineTimer: p.engineTimer + 1 })), 1000);
    return () => clearInterval(id);
  }, [s.engineRunning]);

  const fmt = (sec) =>
    `${Math.floor(sec / 60).toString().padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;

  const actions = {
    arm:         () => cmd("Охрана вкл",      () => set(p => ({ ...p, armed: true }))),
    disarm:      () => cmd("Охрана выкл",     () => set(p => ({ ...p, armed: false }))),
    startEng:    () => cmd("Запуск",          () => set(p => ({ ...p, engineRunning: true, engineTimer: 0 }))),
    stopEng:     () => cmd("Стоп",            () => set(p => ({ ...p, engineRunning: false }))),
    lockDoors:   () => cmd("Замки закрыть",   () => set(p => ({ ...p, doorsLocked: true }))),
    unlockDoors: () => cmd("Замки открыть",   () => set(p => ({ ...p, doorsLocked: false }))),
    blockEng:    () => cmd("Блок двигателя",  () => set(p => ({ ...p, engineBlocked: !p.engineBlocked }))),
    heater:      () => cmd("Обогрев",         () => set(p => ({ ...p, heater: !p.heater }))),
    service:     () => cmd("Сервисный режим", () => set(p => ({ ...p, serviceMode: !p.serviceMode }))),
    alarm:       () => notify("Аварийная сигнализация включена", "warn"),
    sos:         () => notify("SOS отправлен!", "sos"),
    voice:       () => notify("Голосовая связь...", "ok"),
    camera:      () => notify("Открытие камеры...", "ok"),
  };

  return { s, actions, toast, fmt };
}

// ── Цвета ─────────────────────────────────────────────────────────────
const C = {
  bg:         "#F2F2F2",
  surface:    "#FFFFFF",
  border:     "#EFEFEF",
  text:       "#111111",
  textSub:    "#999999",
  textMuted:  "#CCCCCC",
  accent:     "#2563EB",
  green:      "#16A34A",
  greenLight: "#F0FBF4",
  greenBdr:   "#C8EAD4",
  red:        "#DC2626",
  redLight:   "#FEF2F2",
  redBdr:     "#FECACA",
  orange:     "#D97706",
  orangeLight:"#FFFBEB",
  orangeBdr:  "#FDE68A",
  btnBg:      "#3A3A3A",
};


// ── Toggle ────────────────────────────────────────────────────────────
const Toggle = ({ on, onClick }) => (
  <div
    onClick={e => { e.stopPropagation(); onClick(); }}
    style={{
      width: 44, height: 24, borderRadius: 12,
      background: on ? C.accent : C.border,
      position: "relative", cursor: "pointer", flexShrink: 0,
      transition: "background .18s",
    }}
  >
    <div style={{
      width: 20, height: 20, borderRadius: "50%", background: "#fff",
      position: "absolute", top: 2, left: on ? 22 : 2,
      transition: "left .16s cubic-bezier(.4,0,.2,1)",
      boxShadow: "0 1px 4px rgba(0,0,0,.18)",
    }} />
  </div>
);

// ── Строка с тоглом ───────────────────────────────────────────────────
const ToggleRow = ({ label, sub, on, onClick, last, topBorder }) => (
  <div style={{
    display: "flex", alignItems: "center",
    padding: "14px 16px", gap: 12,
    borderTop: topBorder ? `1px solid ${C.border}` : "none",
    borderBottom: last ? "none" : `1px solid ${C.border}`,
  }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 15, color: C.text, fontWeight: 500, lineHeight: "20px" }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: C.textSub, marginTop: 3, lineHeight: "16px" }}>{sub}</div>}
    </div>
    <Toggle on={on} onClick={onClick} />
  </div>
);

// ── Строка-ссылка ─────────────────────────────────────────────────────
const LinkRow = ({ label, sub, right, rightColor, onClick, last, danger }) => (
  <div
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center",
      padding: "14px 16px", gap: 12,
      borderBottom: last ? "none" : `1px solid ${C.border}`,
      cursor: onClick ? "pointer" : "default",
    }}
  >
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 15, color: danger ? C.red : C.text, fontWeight: 500, lineHeight: "20px" }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: C.textSub, marginTop: 3, lineHeight: "16px" }}>{sub}</div>}
    </div>
    {right && (
      <span style={{ fontSize: 14, color: rightColor || C.textSub, fontWeight: 500, flexShrink: 0 }}>{right}</span>
    )}
    {onClick && (
      <svg width="6" height="11" viewBox="0 0 6 11" fill="none" style={{ flexShrink: 0, marginLeft: 4 }}>
        <path d="M1 1l4 4.5L1 10" stroke={C.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )}
  </div>
);

// ── Карточка-секция ───────────────────────────────────────────────────
const Card = ({ children }) => (
  <div style={{
    background: C.surface,
    borderRadius: 14,
    border: `1px solid ${C.border}`,
    overflow: "hidden",
  }}>
    {children}
  </div>
);

// ── Заголовок секции ──────────────────────────────────────────────────
const SLabel = ({ children }) => (
  <div style={{
    fontSize: 12, fontWeight: 600, color: C.textSub,
    letterSpacing: 0.5, textTransform: "uppercase",
    padding: "20px 2px 8px",
  }}>
    {children}
  </div>
);

// ── Кнопка действия ───────────────────────────────────────────────────
const ActionBtn = ({ label, onClick, topBorder, tint }) => (
  <div style={{
    padding: "12px 16px",
    borderTop: topBorder ? `1px solid ${C.border}` : "none",
  }}>
    <button
      onClick={onClick}
      style={{
        width: "100%", padding: "14px 16px",
        borderRadius: 10,
        border: `1px solid ${tint ? tint.border : C.border}`,
        background: tint ? tint.bg : C.bg,
        color: tint ? tint.text : C.text,
        fontSize: 14, fontWeight: 600,
        fontFamily: "inherit", cursor: "pointer",
        transition: "all .15s",
      }}
    >
      {label}
    </button>
  </div>
);

// ── Баннер статуса внутри карточки ────────────────────────────────────
const StatusBanner = ({ children, bg, border: bdr }) => (
  <div style={{
    margin: "12px 16px 0",
    padding: "12px 14px",
    borderRadius: 10,
    background: bg, border: `1px solid ${bdr}`,
  }}>
    {children}
  </div>
);

// ── Экран приложения ──────────────────────────────────────────────────
function Screen({ s, actions, fmt }) {
  return (
    <div style={{
      flex: 1, overflowY: "auto", background: C.bg,
      WebkitOverflowScrolling: "touch",
    }}>

      {/* Шапка */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        padding: "14px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <button style={{
          background: "none", border: "none", cursor: "pointer", padding: 0,
          display: "flex", flexDirection: "column", gap: 5,
        }}>
          {[20, 13, 20].map((w, i) => (
            <div key={i} style={{ width: w, height: 1.5, background: C.text, borderRadius: 2 }} />
          ))}
        </button>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: -0.3 }}>BMW X5</div>
          <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>ВА 123 МО</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.online ? C.green : C.textMuted }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: s.online ? C.green : C.textSub }}>
            {s.online ? "Онлайн" : "Офлайн"}
          </span>
        </div>
      </div>

      <div style={{ padding: "0 16px 32px" }}>

        {/* ── Охрана ── */}
        <SLabel>Охрана</SLabel>
        <Card>
          <StatusBanner bg={s.armed ? C.greenLight : C.orangeLight} border={s.armed ? C.greenBdr : C.orangeBdr}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: s.armed ? C.green : C.orange }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: "18px", color: s.armed ? C.green : C.orange }}>
                  {s.armed ? "Автомобиль под охраной" : "Охрана снята"}
                </div>
                <div style={{ fontSize: 12, color: C.textSub, marginTop: 3 }}>Обновлено только что</div>
              </div>
            </div>
          </StatusBanner>
          <ActionBtn
            label={s.armed ? "Снять с охраны" : "Поставить на охрану"}
            onClick={s.armed ? actions.disarm : actions.arm}
            tint={s.armed
              ? { bg: C.orangeLight, border: C.orangeBdr, text: C.orange }
              : { bg: C.greenLight,  border: C.greenBdr,  text: C.green  }}
          />
        </Card>

        {/* ── Двигатель ── */}
        <SLabel>Двигатель</SLabel>
        <Card>
          <ActionBtn
            label={s.engineRunning ? "Остановить двигатель" : "Запустить двигатель"}
            onClick={s.engineRunning ? actions.stopEng : actions.startEng}
            tint={s.engineRunning
              ? { bg: C.redLight,   border: C.redBdr,   text: C.red   }
              : { bg: C.greenLight, border: C.greenBdr, text: C.green }}
          />
          <ToggleRow
            label="Блокировка двигателя"
            sub={s.engineBlocked ? "Запуск запрещён" : "Запуск разрешён"}
            on={s.engineBlocked}
            onClick={actions.blockEng}
            topBorder
            last
          />
        </Card>

        {/* ── Центральный замок ── */}
        <SLabel>Центральный замок</SLabel>
        <Card>
          <LinkRow
            label="Центральный замок"
            sub={s.doorsLocked ? "Все двери закрыты" : "Двери открыты"}
            right={s.doorsLocked ? "Закрыто" : "Открыто"}
            rightColor={s.doorsLocked ? C.green : C.red}
          />
          <ActionBtn
            label={s.doorsLocked ? "Открыть" : "Закрыть"}
            onClick={s.doorsLocked ? actions.unlockDoors : actions.lockDoors}
            tint={s.doorsLocked
              ? { bg: C.redLight,   border: C.redBdr,   text: C.red   }
              : { bg: C.greenLight, border: C.greenBdr, text: C.green }}
          />
        </Card>

        {/* ── Обогрев и сервисный режим ── */}
        <SLabel>Обогрев и сервис</SLabel>
        <Card>
          <ToggleRow label="Предпусковой обогрев" sub={s.heater ? "Включён" : "Выключен"} on={s.heater} onClick={actions.heater} />
          <ToggleRow label="Сервисный режим" sub={s.serviceMode ? "Активен — охрана снята" : "Выключен"} on={s.serviceMode} onClick={actions.service} last />
        </Card>

        {/* ── Экстренные команды ── */}
        <SLabel>Экстренные команды</SLabel>
        <Card>
          <LinkRow label="Аварийная сигнализация" onClick={actions.alarm} />
          <LinkRow label="Голосовая связь с устройством" onClick={actions.voice} />
          <LinkRow label="Просмотр камер" onClick={actions.camera} />
          <LinkRow label="Отправить SOS" onClick={actions.sos} danger last />
        </Card>

        {/* ── Состояние авто ── */}
        <SLabel>Состояние авто</SLabel>
        <Card>
          <LinkRow label="Температура двигателя" right={`${s.tempEngine} °C`} rightColor={s.tempEngine > 105 ? C.red : s.tempEngine > 90 ? C.orange : C.green} />
          <LinkRow label="Температура снаружи"   right={`${s.tempOutside} °C`} rightColor={C.textSub} />
          <LinkRow label="Топливо"               right={`${s.fuel}%`} rightColor={s.fuel < 15 ? C.red : s.fuel < 30 ? C.orange : C.green} />
          <LinkRow label="Аккумулятор"           right={`${s.batteryMain} В`} rightColor={s.batteryMain < 11.5 ? C.red : s.batteryMain < 12.0 ? C.orange : C.green} />
          <LinkRow label="Пробег"                right={`${s.odo.toLocaleString("ru")} км`} last />
        </Card>

        {/* ── Связь ── */}
        <SLabel>Связь</SLabel>
        <Card>
          <LinkRow label="GSM" right={"▮".repeat(s.gsm) + "▯".repeat(5 - s.gsm)} rightColor={s.gsm >= 3 ? C.green : s.gsm >= 2 ? C.orange : C.red} />
          <LinkRow label="GPS" right={"▮".repeat(s.gps) + "▯".repeat(3 - s.gps)} rightColor={s.gps === 3 ? C.green : s.gps === 2 ? C.orange : C.red} last />
        </Card>

        {/* ── Сервис ── */}
        <SLabel>Сервис</SLabel>
        <Card>
          <LinkRow label="До планового ТО" right={`${s.daysTillService} дней`} rightColor={s.daysTillService < 7 ? C.red : s.daysTillService < 30 ? C.orange : C.textSub} />
          <LinkRow label="Подписка"         right={`${s.daysTillSub} дней`}     rightColor={s.daysTillSub < 14 ? C.red : s.daysTillSub < 60 ? C.orange : C.textSub} last />
        </Card>
      </div>
    </div>
  );
}

// ── Нейтральный фрейм ─────────────────────────────────────────────────
export default function App() {
  const { s, actions, toast, fmt } = useCarState();

  const W = 375, H = 780;
  const BORDER = 10;
  const R = 42;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "32px 16px",
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap" rel="stylesheet" />

      {/* Телефон — матовый пластик Pixel */}
      <div style={{
        width: W + BORDER * 2,
        height: H + BORDER * 2,
        borderRadius: 18,
        background: "#1C1C1C",
        backgroundImage: "radial-gradient(ellipse at 30% 20%, #2a2a2a 0%, #161616 100%)",
        padding: BORDER,
        boxShadow: [
          "0 40px 80px rgba(0,0,0,.65)",
          "0 0 0 1px rgba(255,255,255,.05)",
        ].join(", "),
        position: "relative",
        flexShrink: 0,
      }}>

        {/* Кнопка питания — правая, плоская матовая */}
        <div style={{
          position: "absolute", right: -3, top: 140,
          width: 3, height: 60,
          background: "#2A2A2A",
          borderRadius: "0 3px 3px 0",
        }} />

        {/* Кнопки громкости — левая */}
        {[110, 175].map((top, i) => (
          <div key={i} style={{
            position: "absolute", left: -3, top,
            width: 3, height: i === 0 ? 40 : 40,
            background: "#2A2A2A",
            borderRadius: "3px 0 0 3px",
          }} />
        ))}

        {/* Полоска-акцент снизу (как у Pixel 6+) */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: BORDER,
          borderRadius: "0 0 18px 18px",
          background: "#111",
        }} />

        {/* Экран */}
        <div style={{
          width: W, height: H,
          borderRadius: 10,
          overflow: "hidden",
          background: C.bg,
          display: "flex", flexDirection: "column",
        }}>



          {/* Контент */}
          <Screen s={s} actions={actions} fmt={fmt} />


        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 36, left: "50%", transform: "translateX(-50%)",
          background:
            toast.type === "sos"  ? C.red    :
            toast.type === "warn" ? C.orange  :
            toast.type === "send" ? C.accent  : "#111",
          color: "#fff", padding: "11px 22px", borderRadius: 24,
          fontSize: 13, fontWeight: 600,
          boxShadow: "0 6px 24px rgba(0,0,0,.3)",
          whiteSpace: "nowrap", zIndex: 300,
          animation: "pop .16s ease",
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        button { -webkit-tap-highlight-color: transparent; }
        button:active { opacity: 0.72; }
        @keyframes pop {
          from { opacity:0; transform:translateX(-50%) translateY(8px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
