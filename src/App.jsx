import React, { useState, useEffect } from 'react';

const REAL_MODE = true;
const ESP_IP = "http://192.168.1.27";

const C = {
  bg:        '#040d1a',
  surface:   '#06111f',
  surfaceHi: '#081829',
  border:    '#1e3a5f',
  borderHi:  '#2563eb44',
  blue:      '#3b82f6',
  blueDim:   '#1d4ed8',
  blueGlow:  '#3b82f622',
  text:      '#eff6ff',
  textMid:   '#bfdbfe',
  textDim:   '#1e40af',
  textMuted: '#1d4ed866',
  green:     '#22c55e',
  greenGlow: '#22c55e44',
  red:       '#ef4444',
  redGlow:   '#ef444444',
  yellow:    '#fbbf24',
};

const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Barlow+Condensed:wght@300;400;600;700&display=swap';
document.head.appendChild(fontLink);

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fanSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes bulbPulse {
    0%   { opacity: 1;   filter: drop-shadow(0 0 6px #fbbf24) drop-shadow(0 0 14px #fbbf2499); }
    50%  { opacity: 0.82; filter: drop-shadow(0 0 10px #fbbf24) drop-shadow(0 0 22px #fbbf24aa); }
    100% { opacity: 1;   filter: drop-shadow(0 0 6px #fbbf24) drop-shadow(0 0 14px #fbbf2499); }
  }
  @keyframes glowRing {
    0%   { box-shadow: 0 0 8px #fbbf2444, inset 0 0 8px #fbbf2422; }
    50%  { box-shadow: 0 0 18px #fbbf2488, inset 0 0 14px #fbbf2444; }
    100% { box-shadow: 0 0 8px #fbbf2444, inset 0 0 8px #fbbf2422; }
  }
  @keyframes fanGlowRing {
    0%   { box-shadow: 0 0 8px #3b82f644, inset 0 0 8px #3b82f622; }
    50%  { box-shadow: 0 0 18px #3b82f688, inset 0 0 14px #3b82f644; }
    100% { box-shadow: 0 0 8px #3b82f644, inset 0 0 8px #3b82f622; }
  }
  @keyframes resetPulse {
    0%,100% { box-shadow: 0 0 8px #ef444444; }
    50%     { box-shadow: 0 0 20px #ef444488, 0 0 40px #ef444422; }
  }
  @keyframes loginFadeIn {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes loginShake {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-8px); }
    40%     { transform: translateX(8px); }
    60%     { transform: translateX(-5px); }
    80%     { transform: translateX(5px); }
  }
  @keyframes scanline {
    0%   { top: -10%; }
    100% { top: 110%; }
  }
  @keyframes borderGlow {
    0%,100% { border-color: #2563eb44; box-shadow: 0 0 0px #3b82f600; }
    50%     { border-color: #3b82f688; box-shadow: 0 0 10px #3b82f622; }
  }
  .login-input:focus {
    outline: none;
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 1px #3b82f644, 0 0 12px #3b82f622 !important;
  }
  .login-input::placeholder {
    color: #1e40af88;
    letter-spacing: 3px;
  }
  .login-input::-webkit-inner-spin-button,
  .login-input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .login-input[type=number] { -moz-appearance: textfield; }
`;
document.head.appendChild(styleSheet);

const FONT_DISPLAY = "'Barlow Condensed', sans-serif";
const FONT_MONO    = "'Space Mono', monospace";

// ── Usuarios predefinidos ──────────────────────────────────
const USERS = {
  admin:    { password: '1234', type: 'numeric', role: 'ADMIN',  color: C.blue  },
  invitado: { password: 'casa', type: 'alpha',   role: 'GUEST',  color: C.green },
};

// ── Audio ──────────────────────────────────────────────────
let _audioCtx = null;
const getCtx = () => {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
};
const makeNoise = (ctx, duration) => {
  const frames = Math.ceil(ctx.sampleRate * duration);
  const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) d[i] = Math.random() * 2 - 1;
  return buf;
};
const chain = (ctx, ...nodes) => {
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]);
  nodes[nodes.length - 1].connect(ctx.destination);
};

const SFX = {
  powerOn: () => {
    const ctx = getCtx(); const t = ctx.currentTime;
    const rNoise = ctx.createBufferSource(); rNoise.buffer = makeNoise(ctx, 1.4);
    const rLpf = ctx.createBiquadFilter(); rLpf.type = 'lowpass';
    rLpf.frequency.setValueAtTime(60, t); rLpf.frequency.exponentialRampToValueAtTime(280, t + 0.6);
    rLpf.frequency.exponentialRampToValueAtTime(140, t + 1.3); rLpf.Q.value = 3;
    const rGain = ctx.createGain();
    rGain.gain.setValueAtTime(0.0, t); rGain.gain.linearRampToValueAtTime(0.9, t + 0.08);
    rGain.gain.linearRampToValueAtTime(0.7, t + 0.6); rGain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
    chain(ctx, rNoise, rLpf, rGain); rNoise.start(t); rNoise.stop(t + 1.4);
    const hum = ctx.createOscillator(); hum.type = 'sawtooth';
    hum.frequency.setValueAtTime(38, t); hum.frequency.linearRampToValueAtTime(55, t + 0.7);
    const humGain = ctx.createGain();
    humGain.gain.setValueAtTime(0.0, t); humGain.gain.linearRampToValueAtTime(0.22, t + 0.15);
    humGain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    chain(ctx, hum, humGain); hum.start(t); hum.stop(t + 1.5);
    const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.setValueAtTime(28, t + 0.5);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.0, t + 0.5); subGain.gain.linearRampToValueAtTime(0.18, t + 0.9);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
    chain(ctx, sub, subGain); sub.start(t + 0.5); sub.stop(t + 1.6);
  },
  powerOff: () => {
    const ctx = getCtx(); const t = ctx.currentTime;
    const hum = ctx.createOscillator(); hum.type = 'sawtooth';
    hum.frequency.setValueAtTime(52, t); hum.frequency.exponentialRampToValueAtTime(22, t + 1.1);
    const humGain = ctx.createGain();
    humGain.gain.setValueAtTime(0.22, t); humGain.gain.linearRampToValueAtTime(0.08, t + 0.3);
    humGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    chain(ctx, hum, humGain); hum.start(t); hum.stop(t + 1.2);
    const turb = ctx.createBufferSource(); turb.buffer = makeNoise(ctx, 1.3);
    const turbLpf = ctx.createBiquadFilter(); turbLpf.type = 'lowpass';
    turbLpf.frequency.setValueAtTime(220, t); turbLpf.frequency.exponentialRampToValueAtTime(55, t + 1.2);
    const turbGain = ctx.createGain();
    turbGain.gain.setValueAtTime(0.6, t); turbGain.gain.exponentialRampToValueAtTime(0.001, t + 1.3);
    chain(ctx, turb, turbLpf, turbGain); turb.start(t); turb.stop(t + 1.3);
  },
  reset: () => {
    const ctx = getCtx(); const now = ctx.currentTime;
    [880, 660, 440].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.type = 'square'; osc.frequency.value = freq;
      const t = now + i * 0.13;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.15, t + 0.01);
      g.gain.setValueAtTime(0.15, t + 0.07); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(g); g.connect(ctx.destination); osc.start(t); osc.stop(t + 0.13);
    });
  },
  loginSuccess: () => {
    const ctx = getCtx(); const now = ctx.currentTime;
    [440, 550, 660].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = freq;
      const t = now + i * 0.1;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.18, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(g); g.connect(ctx.destination); osc.start(t); osc.stop(t + 0.2);
    });
  },
  loginError: () => {
    const ctx = getCtx(); const now = ctx.currentTime;
    [220, 180].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.type = 'square'; osc.frequency.value = freq;
      const t = now + i * 0.14;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(g); g.connect(ctx.destination); osc.start(t); osc.stop(t + 0.2);
    });
  },
  _keyThock: (pitch = 1.0) => {
    const ctx = getCtx(); const t = ctx.currentTime;
    const body = ctx.createOscillator(); body.type = 'sine';
    body.frequency.setValueAtTime(185 * pitch, t); body.frequency.exponentialRampToValueAtTime(95 * pitch, t + 0.055);
    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(0.0, t); bodyGain.gain.linearRampToValueAtTime(0.28, t + 0.003);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.10);
    chain(ctx, body, bodyGain); body.start(t); body.stop(t + 0.11);
  },
  navigate: () => SFX._keyThock(1.05),
  back:     () => SFX._keyThock(0.88),
};

// ── Shared UI ──────────────────────────────────────────────
const GridBackground = () => (
  <div style={{
    position: 'fixed', inset: 0, pointerEvents: 'none',
    backgroundImage: `linear-gradient(${C.blue}08 1px, transparent 1px), linear-gradient(90deg, ${C.blue}08 1px, transparent 1px)`,
    backgroundSize: '48px 48px'
  }} />
);

const LogoBars = () => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, marginRight: 10 }}>
    {[18, 12, 24, 16].map((h, i) => (
      <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: C.blue, opacity: [0.3, 0.5, 1, 0.7][i] }} />
    ))}
  </div>
);

function PowerIcon({ color, size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 3v6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M6.34 6.34a9 9 0 1 0 11.32 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ResetIcon({ color, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 3v5h5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LogoutIcon({ color, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="16 17 21 12 16 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function FanIcon({ active, size = 38 }) {
  const color = active ? C.blue : C.textDim;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `1px solid ${active ? C.blue + '55' : C.border}`,
      animation: active ? 'fanGlowRing 2s ease-in-out infinite' : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'border-color 0.4s',
    }}>
      <svg width={size * 0.68} height={size * 0.68} viewBox="0 0 48 48" fill="none"
        style={{ animation: `fanSpin ${active ? '0.7s' : '3s'} linear infinite`, animationPlayState: active ? 'running' : 'paused' }}>
        <path d="M24 24 C24 24 22 14 18 10 C14 6 8 8 8 8 C8 8 12 14 16 18 C20 22 24 24 24 24Z" fill={color} opacity="0.9"/>
        <path d="M24 24 C24 24 34 22 38 18 C42 14 40 8 40 8 C40 8 34 12 30 16 C26 20 24 24 24 24Z" fill={color} opacity="0.9"/>
        <path d="M24 24 C24 24 26 34 30 38 C34 42 40 40 40 40 C40 40 36 34 32 30 C28 26 24 24 24 24Z" fill={color} opacity="0.9"/>
        <path d="M24 24 C24 24 14 26 10 30 C6 34 8 40 8 40 C8 40 14 36 18 32 C22 28 24 24 24 24Z" fill={color} opacity="0.9"/>
        <circle cx="24" cy="24" r="4" fill={active ? C.blue : C.textDim}/>
        <circle cx="24" cy="24" r="2" fill={C.bg}/>
      </svg>
    </div>
  );
}

function BulbIcon({ active, size = 38 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `1px solid ${active ? '#fbbf2455' : C.border}`,
      animation: active ? 'glowRing 2.5s ease-in-out infinite' : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: active ? '#fbbf2408' : 'transparent',
    }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 32 32" fill="none"
        style={{ animation: active ? 'bulbPulse 2.5s ease-in-out infinite' : 'none', filter: active ? 'drop-shadow(0 0 5px #fbbf24)' : 'none' }}>
        <path d="M16 3 C10.477 3 6 7.477 6 13 C6 16.5 7.8 19.6 10.5 21.5 L10.5 25 C10.5 25.55 10.95 26 11.5 26 L20.5 26 C21.05 26 21.5 25.55 21.5 25 L21.5 21.5 C24.2 19.6 26 16.5 26 13 C26 7.477 21.523 3 16 3Z"
          fill={active ? '#fbbf24' : C.textDim} opacity={active ? 1 : 0.45}/>
        <rect x="11.5" y="26.5" width="9" height="1.5" rx="0.75" fill={active ? '#fbbf2499' : C.border}/>
        <rect x="12.5" y="28.5" width="7" height="1.5" rx="0.75" fill={active ? '#fbbf2466' : C.border}/>
        {active && <ellipse cx="13.5" cy="11" rx="2.5" ry="3.5" fill="white" opacity="0.35"/>}
      </svg>
    </div>
  );
}

function PowerButton({ isPowered, powering, onClick }) {
  const color = isPowered ? C.green : C.red;
  const glow  = isPowered ? C.greenGlow : C.redGlow;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <button onClick={onClick} disabled={powering}
        style={{ background: 'none', border: 'none', padding: 0, cursor: powering ? 'wait' : 'pointer' }}>
        <div style={{
          width: 110, height: 110, borderRadius: '50%',
          border: `1px solid ${color}`,
          boxShadow: `0 0 20px ${glow}, inset 0 0 20px ${glow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.5s ease', opacity: powering ? 0.5 : 1,
          background: isPowered ? `${C.green}08` : `${C.red}08`,
        }}>
          <div style={{
            width: 86, height: 86, borderRadius: '50%', border: `1px solid ${color}22`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5
          }}>
            <PowerIcon color={color} size={28}/>
            <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 8, letterSpacing: 3, color }}>
              {powering ? '···' : 'POWER'}
            </span>
          </div>
        </div>
      </button>
      <div style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 3, color, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, display: 'inline-block' }}/>
        {isPowered ? 'ONLINE' : 'OFFLINE'}
      </div>
    </div>
  );
}

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const pad = n => String(n).padStart(2, '0');
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const days   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const date   = `${days[now.getDay()]} ${pad(now.getDate())} ${months[now.getMonth()]} ${now.getFullYear()}`;
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 36, color: C.textMid, letterSpacing: 4 }}>{time}</div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.textDim, letterSpacing: 4, marginTop: 2 }}>{date}</div>
    </div>
  );
}

function Uptime({ startTime }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startTime]);
  if (!startTime) return null;
  const h = Math.floor(elapsed / 3600), m = Math.floor((elapsed % 3600) / 60), s = elapsed % 60;
  const pad = n => String(n).padStart(2, '0');
  return (
    <div style={{ fontFamily: FONT_MONO, fontSize: 10, fontWeight: 700, color: C.yellow, letterSpacing: 2, marginTop: 4 }}>
      ⏱ {h > 0 ? `${pad(h)}:` : ''}{pad(m)}:{pad(s)}
    </div>
  );
}

const Divider = ({ style }) => (
  <div style={{ borderTop: `1px solid ${C.border}`, margin: '10px 0', ...style }} />
);

const SectionLabel = ({ children }) => (
  <div style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 5, color: C.textDim, textAlign: 'center', marginBottom: 8 }}>
    {children}
  </div>
);

// ══════════════════════════════════════════════════════════
// LOGIN SCREEN
// ══════════════════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword]         = useState('');
  const [error, setError]               = useState('');
  const [shaking, setShaking]           = useState(false);
  const [loading, setLoading]           = useState(false);

  const userConfig = selectedUser ? USERS[selectedUser] : null;

  const handleSelectUser = (username) => {
    SFX.navigate();
    setSelectedUser(username);
    setPassword('');
    setError('');
  };

  const handleBack = () => {
    SFX.back();
    setSelectedUser(null);
    setPassword('');
    setError('');
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    if (!userConfig) return;
    // Admin: solo números; Invitado: solo letras
    if (userConfig.type === 'numeric') {
      if (/^\d*$/.test(val)) setPassword(val);
    } else {
      if (/^[a-zA-Z]*$/.test(val)) setPassword(val);
    }
    setError('');
  };

  const handleLogin = async () => {
    if (!selectedUser || !password) return;
    setLoading(true);
    // Pequeño delay para efecto visual
    await new Promise(r => setTimeout(r, 600));
    if (USERS[selectedUser].password === password) {
      SFX.loginSuccess();
      onLogin(selectedUser);
    } else {
      SFX.loginError();
      setError('ACCESO DENEGADO');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setPassword('');
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div style={{
      minHeight: '100dvh', background: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <GridBackground />

      {/* Scanline effect */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1,
      }}>
        <div style={{
          position: 'absolute', left: 0, right: 0, height: '2px',
          background: `linear-gradient(transparent, ${C.blue}18, transparent)`,
          animation: 'scanline 6s linear infinite',
        }} />
      </div>

      <div style={{
        width: '100%', maxWidth: 360, position: 'relative', zIndex: 10,
        animation: 'loginFadeIn 0.5s ease forwards',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
          <LogoBars />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, color: C.text, letterSpacing: 2, lineHeight: 1 }}>
              SMART<span style={{ color: C.blue }}>OFFICE</span>
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 300, fontSize: 10, letterSpacing: 7, color: C.blue, marginTop: 1 }}>
              CONTROL SYSTEM
            </div>
          </div>
        </div>

        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${C.blue}, transparent)`, marginBottom: 20 }} />

        {/* Auth box */}
        <div style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: '22px 20px',
          animation: shaking ? 'loginShake 0.4s ease' : 'none',
        }}>
          <SectionLabel>— AUTENTICACIÓN —</SectionLabel>

          {/* Selector de usuario */}
          {!selectedUser ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 4, color: C.textDim, textAlign: 'center', marginBottom: 4 }}>
                SELECCIONAR USUARIO
              </div>
              {Object.entries(USERS).map(([username, cfg]) => (
                <button key={username} onClick={() => handleSelectUser(username)}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${cfg.color}44`,
                    borderRadius: 9,
                    padding: '14px 16px',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${cfg.color}0a`;
                    e.currentTarget.style.borderColor = `${cfg.color}88`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = `${cfg.color}44`;
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Avatar icon */}
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      border: `1px solid ${cfg.color}55`,
                      background: `${cfg.color}0d`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="4" stroke={cfg.color} strokeWidth="1.5"/>
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={cfg.color} strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, letterSpacing: 3, color: C.textMid }}>
                        {username.toUpperCase()}
                      </div>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 2, color: C.textDim, marginTop: 1 }}>
                        {cfg.role} · {cfg.type === 'numeric' ? 'PIN NUMÉRICO' : 'CLAVE ALFABÉTICA'}
                      </div>
                    </div>
                  </div>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ animation: 'loginFadeIn 0.3s ease forwards' }}>
              {/* Usuario seleccionado */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: `${userConfig.color}08`,
                border: `1px solid ${userConfig.color}33`,
                borderRadius: 8, padding: '10px 12px', marginBottom: 16,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: `1px solid ${userConfig.color}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke={userConfig.color} strokeWidth="1.5"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={userConfig.color} strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 13, letterSpacing: 3, color: C.textMid }}>
                    {selectedUser.toUpperCase()}
                  </div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 2, color: C.textDim }}>
                    {userConfig.role}
                  </div>
                </div>
                <button onClick={handleBack}
                  style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: C.textDim, fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 2 }}>
                  ← CAMBIAR
                </button>
              </div>

              {/* Campo de contraseña */}
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 4, color: C.textDim, marginBottom: 8 }}>
                  {userConfig.type === 'numeric' ? '— INGRESE PIN NUMÉRICO —' : '— INGRESE CLAVE ALFABÉTICA —'}
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    className="login-input"
                    type={userConfig.type === 'numeric' ? 'password' : 'password'}
                    inputMode={userConfig.type === 'numeric' ? 'numeric' : 'text'}
                    inputMode={userConfig.type === 'numeric' ? 'numeric' : 'text'}
                    value={password}
                    onChange={handlePasswordChange}
                    onKeyDown={handleKeyDown}
                    placeholder={userConfig.type === 'numeric' ? '· · · ·' : '· · · ·'}
                    autoFocus
                    maxLength={userConfig.type === 'numeric' ? 8 : 16}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: C.bg,
                      border: `1px solid ${error ? C.red + '88' : C.border}`,
                      borderRadius: 8,
                      padding: '12px 44px 12px 14px',
                      fontFamily: FONT_MONO,
                      fontSize: password ? 18 : 14,
                      letterSpacing: password ? 6 : 3,
                      color: error ? C.red : C.textMid,
                      transition: 'all 0.2s',
                    }}
                  />
                  {/* Lock icon */}
                  <div style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke={error ? C.red : C.textDim} strokeWidth="1.5"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={error ? C.red : C.textDim} strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>

                {/* Indicador visual de caracteres */}
                {password.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 8, justifyContent: 'center' }}>
                    {Array.from({ length: Math.min(password.length, 12) }).map((_, i) => (
                      <div key={i} style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: error ? C.red : userConfig.color,
                        boxShadow: `0 0 5px ${error ? C.red : userConfig.color}`,
                        animation: `loginFadeIn 0.15s ease ${i * 0.03}s both`,
                      }} />
                    ))}
                  </div>
                )}

                {/* Mensaje de error */}
                {error && (
                  <div style={{
                    fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 3,
                    color: C.red, textAlign: 'center', marginTop: 10,
                    animation: 'loginFadeIn 0.2s ease',
                  }}>
                    ⚠ {error}
                  </div>
                )}
              </div>

              {/* Botón de acceso */}
              <button
                onClick={handleLogin}
                disabled={!password || loading}
                style={{
                  width: '100%', marginTop: 14,
                  background: !password ? 'transparent' : loading ? `${userConfig.color}15` : `${userConfig.color}15`,
                  border: `1px solid ${!password ? C.border : userConfig.color + '66'}`,
                  borderRadius: 8, padding: '12px',
                  cursor: !password ? 'not-allowed' : loading ? 'wait' : 'pointer',
                  opacity: !password ? 0.4 : 1,
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
                onMouseEnter={e => {
                  if (password && !loading) {
                    e.currentTarget.style.background = `${userConfig.color}22`;
                    e.currentTarget.style.boxShadow = `0 0 14px ${userConfig.color}22`;
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = `${userConfig.color}15`;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {loading ? (
                  <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 4, color: userConfig.color }}>
                    VERIFICANDO···
                  </span>
                ) : (
                  <>
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke={password ? userConfig.color : C.textDim} strokeWidth="1.5" strokeLinecap="round"/>
                      <polyline points="10 17 15 12 10 7" stroke={password ? userConfig.color : C.textDim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="15" y1="12" x2="3" y2="12" stroke={password ? userConfig.color : C.textDim} strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 4, color: password ? userConfig.color : C.textDim }}>
                      ACCEDER
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 3, color: C.textMuted }}>
            SECURE ACCESS · v1.0
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// API helpers
// ══════════════════════════════════════════════════════════
const apiControl = (oficina, dispositivo, estado) => {
  if (!REAL_MODE) return Promise.resolve();
  return fetch(`${ESP_IP}/control`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oficina, dispositivo, estado }),
  });
};
const apiReset = () => {
  if (!REAL_MODE) return Promise.resolve();
  return fetch(`${ESP_IP}/reset`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
};
const apiPower = (estado) => {
  if (!REAL_MODE) return Promise.resolve();
  return fetch(`${ESP_IP}/power`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado }),
  });
};

// ══════════════════════════════════════════════════════════
// APP
// ══════════════════════════════════════════════════════════
export default function App() {
  const [currentUser, setCurrentUser]   = useState(null); // null = no autenticado
  const [selectedOffice, setSelectedOffice] = useState(null);

  const defaultOffices = {
    1: { lights: false, ventilation: false },
    2: { lights: false, ventilation: false },
    3: { lights: false, ventilation: false },
    4: { lights: false, ventilation: false },
  };

  const LS_OFFICES = 'smartoffice_offices';
  const LS_UPTIMES = 'smartoffice_uptimes';

  const loadOffices = () => {
    try {
      const saved = localStorage.getItem(LS_OFFICES);
      return saved ? JSON.parse(saved) : defaultOffices;
    } catch { return defaultOffices; }
  };
  const loadUptimes = () => {
    try {
      const saved = localStorage.getItem(LS_UPTIMES);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  };
  const saveToLS = (offs, ups) => {
    try {
      localStorage.setItem(LS_OFFICES, JSON.stringify(offs));
      localStorage.setItem(LS_UPTIMES, JSON.stringify(ups));
    } catch {}
  };
  const clearLS = () => {
    try {
      localStorage.removeItem(LS_OFFICES);
      localStorage.removeItem(LS_UPTIMES);
    } catch {}
  };

  const [offices, setOffices]           = useState(loadOffices);
  const [uptimes, setUptimes]           = useState(loadUptimes);
  const [isPowered, setIsPowered]       = useState(true);
  const [powering, setPowering]         = useState(false);
  const [resetting, setResetting]       = useState(false);
  const [savedOffices, setSavedOffices] = useState(null);
  const [savedUptimes, setSavedUptimes] = useState(null);

  // Si no hay usuario → mostrar login
  if (!currentUser) {
    return <LoginScreen onLogin={(u) => { setCurrentUser(u); SFX.powerOn(); }} />;
  }

  const userCfg    = USERS[currentUser];
  const titleColor = isPowered ? C.blue : C.red;

  // ── Logout ────────────────────────────────────────────────
  const handleLogout = () => {
    SFX.powerOff();
    setCurrentUser(null);
    setSelectedOffice(null);
    // No resetear offices: el estado físico persiste, se mantiene en localStorage
    setSavedOffices(null);
    setSavedUptimes(null);
    setIsPowered(true);
  };

  const toggleControl = (office, control) => {
    if (!isPowered) return;
    SFX.navigate();
    const newState = !offices[office][control];
    const key = `${office}_${control}`;
    const newUptimes = { ...uptimes, [key]: newState ? Date.now() : null };
    const newOffices = { ...offices, [office]: { ...offices[office], [control]: newState } };
    setUptimes(newUptimes);
    setOffices(newOffices);
    saveToLS(newOffices, newUptimes);
    apiControl(office, control, newState).catch(console.error);
  };

  const togglePower = async () => {
    const newPowered = !isPowered;
    setPowering(true);
    try {
      if (newPowered) {
        // Actualizar UI inmediatamente
        SFX.powerOn();
        setIsPowered(true);
        const snapshot = savedOffices;
        const snapshotUptimes = savedUptimes;
        if (snapshot) {
          setOffices(snapshot);
          setUptimes(snapshotUptimes || {});
          setSavedOffices(null);
          setSavedUptimes(null);
        }
        // Sincronizar ESP32 en background
        apiPower(true).catch(console.error);
        if (snapshot) {
          for (const officeId of [1, 2, 3, 4]) {
            for (const device of ['lights', 'ventilation']) {
              if (snapshot[officeId][device]) {
                await apiControl(officeId, device, true).catch(console.error);
                await new Promise(r => setTimeout(r, 60));
              }
            }
          }
        }
      } else {
        // Actualizar UI inmediatamente
        setSavedOffices(offices);
        setSavedUptimes(uptimes);
        SFX.powerOff();
        setIsPowered(false);
        setSelectedOffice(null);
        setOffices(defaultOffices);
        setUptimes({});
        // Sincronizar ESP32 en background
        apiPower(false).catch(console.error);
      }
    } catch (err) {
      console.error('togglePower error:', err);
    } finally {
      setPowering(false);
    }
  };

  const resetAll = async () => {
    SFX.reset();
    setResetting(true);
    setSelectedOffice(null);
    setOffices(defaultOffices);
    setUptimes({});
    setSavedOffices(null);
    setSavedUptimes(null);
    clearLS();
    await apiReset().catch(console.error);
    setResetting(false);
  };

  // ══════════════════════════════════════════════════════════
  // VISTA PRINCIPAL
  // ══════════════════════════════════════════════════════════
  if (selectedOffice === null) {
    return (
      <div style={{ minHeight: '100dvh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <GridBackground />
        <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 10 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <LogoBars />
              <div>
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 26, color: C.text, letterSpacing: 2, lineHeight: 1 }}>
                  SMART<span style={{ color: titleColor }}>OFFICE</span>
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 300, fontSize: 11, letterSpacing: 7, color: titleColor, marginTop: 1 }}>
                  CONTROL SYSTEM
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, marginTop: 4 }}>
              {/* Badge de usuario + logout */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: `${userCfg.color}0d`,
                  border: `1px solid ${userCfg.color}33`,
                  borderRadius: 6, padding: '3px 8px',
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: userCfg.color, boxShadow: `0 0 5px ${userCfg.color}`, display: 'inline-block' }} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 2, color: userCfg.color }}>{currentUser.toUpperCase()}</span>
                </div>
                <button onClick={handleLogout}
                  title="Cerrar sesión"
                  style={{
                    background: 'transparent', border: `1px solid ${C.red}33`,
                    borderRadius: 6, padding: '4px 6px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${C.red}0d`; e.currentTarget.style.borderColor = `${C.red}66`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = `${C.red}33`; }}
                >
                  <LogoutIcon color={C.red} size={12} />
                </button>
              </div>
              {[
                { label: isPowered ? 'ONLINE' : 'OFFLINE', active: isPowered,  color: C.green },
                { label: !isPowered ? 'FAULT' : 'CLEAR',   active: !isPowered, color: C.red   },
              ].map(({ label, active, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 2, color: active ? color : C.textDim }}>{label}</span>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: active ? color : C.surface,
                    border: `1px solid ${active ? color : C.border}`,
                    boxShadow: active ? `0 0 6px ${color}` : 'none',
                    display: 'inline-block', transition: 'all 0.5s'
                  }} />
                </div>
              ))}
              {savedOffices && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 2, color: C.yellow }}>SAVED</span>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.yellow, boxShadow: `0 0 6px ${C.yellow}`, display: 'inline-block' }} />
                </div>
              )}
            </div>
          </div>

          <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${titleColor}, transparent)`, marginBottom: 12 }} />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock />
            {currentUser !== 'invitado' && (
              <button
                onClick={resetAll}
                disabled={resetting || powering}
                title="RESET ALL"
                style={{
                  position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                  background: resetting ? `${C.red}12` : 'transparent',
                  border: `1px solid ${C.red}55`, borderRadius: 8, padding: '7px 9px',
                  cursor: resetting ? 'wait' : 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  opacity: (resetting || powering) ? 0.45 : 1,
                  transition: 'all 0.3s',
                  animation: resetting ? 'resetPulse 1s ease-in-out infinite' : 'none',
                }}
              >
                <ResetIcon color={C.red} size={15} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 2, color: C.red, lineHeight: 1 }}>
                  {resetting ? '···' : 'RST'}
                </span>
              </button>
            )}
          </div>

          <Divider style={{ margin: '12px 0 10px' }} />
          <SectionLabel>— SELECT OFFICE —</SectionLabel>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            {[1, 2, 3, 4].map(office => {
              const anyOn  = offices[office].lights || offices[office].ventilation;
              const active = isPowered && anyOn;
              return (
                <button key={office}
                  onClick={() => { if (isPowered) { SFX.navigate(); setSelectedOffice(office); } }}
                  style={{
                    background: active ? `${C.blue}0a` : C.surface,
                    border: `1px solid ${!isPowered ? C.border : active ? `${C.blue}55` : C.border}`,
                    boxShadow: active ? `0 0 14px ${C.blueGlow}` : 'none',
                    borderRadius: 10, padding: '14px 0',
                    cursor: isPowered ? 'pointer' : 'not-allowed',
                    opacity: !isPowered ? 0.35 : 1,
                    transition: 'all 0.3s', position: 'relative', overflow: 'hidden'
                  }}>
                  {active && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: C.blue }} />}
                  <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 32, color: active ? C.textMid : C.textDim, letterSpacing: 1 }}>
                    {String(office).padStart(2, '0')}
                  </div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 4, color: C.textDim, marginTop: 2 }}>OFFICE</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 6 }}>
                    {[
                      { key: 'lights',      onColor: C.yellow,  glow: '#fbbf2488' },
                      { key: 'ventilation', onColor: '#e8f0fe', glow: '#e8f0fe99' },
                    ].map(({ key, onColor, glow }) => (
                      <span key={key} style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: offices[office][key] ? onColor : C.border,
                        boxShadow: offices[office][key] ? `0 0 6px ${glow}` : 'none',
                        display: 'inline-block', transition: 'all 0.3s'
                      }} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ height: 1, background: `${C.border}66` }} />

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, marginBottom: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <PowerButton isPowered={isPowered} powering={powering} onClick={togglePower} />
              {savedOffices && !isPowered && (
                <span style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 2, color: C.yellow, textAlign: 'center' }}>
                  ↑ RESTORE ON POWER ON
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // VISTA DE OFICINA
  // ══════════════════════════════════════════════════════════
  const currentOffice = offices[selectedOffice];

  return (
    <div style={{ minHeight: '100dvh', background: C.bg, padding: 16 }}>
      <GridBackground />
      <div style={{ maxWidth: 400, margin: '0 auto', position: 'relative', zIndex: 10 }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={() => { SFX.back(); setSelectedOffice(null); }}
            style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.textMid, fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 2, padding: '7px 12px', borderRadius: 8, cursor: 'pointer' }}>
            ← BACK
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 18, color: isPowered ? C.textMid : C.red, letterSpacing: 4 }}>
              OFFICE <span style={{ color: isPowered ? C.blue : C.red }}>{String(selectedOffice).padStart(2,'0')}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {currentUser !== 'invitado' && (
              <button onClick={resetAll} disabled={resetting || powering}
                style={{ background: 'transparent', border: `1px solid ${C.red}44`, padding: '7px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <ResetIcon color={C.red} size={14} />
              </button>
            )}
            <button onClick={togglePower} disabled={powering}
              style={{ background: 'transparent', border: `1px solid ${isPowered ? C.red : C.green}44`, padding: '7px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <PowerIcon color={isPowered ? C.red : C.green} size={16} />
            </button>
            <button onClick={handleLogout}
              title="Cerrar sesión"
              style={{ background: 'transparent', border: `1px solid ${C.red}33`, padding: '7px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.background = `${C.red}0d`; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <LogoutIcon color={C.red} size={14} />
            </button>
          </div>
        </div>

        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${isPowered ? C.blue : C.red}, transparent)`, marginBottom: 14 }} />

        <Clock />
        <Divider style={{ margin: '14px 0 10px' }} />

        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px', marginBottom: 12 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 5, color: C.textDim, marginBottom: 10 }}>— SYSTEM STATUS —</div>
          {[
            { label: 'LIGHTS',      active: currentOffice.lights },
            { label: 'VENTILATION', active: currentOffice.ventilation },
            { label: 'SYSTEM',      active: isPowered },
          ].map(({ label, active }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${C.border}44` }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 3, color: C.textDim }}>{label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 2, color: active ? C.blue : C.textDim }}>{active ? 'ACTIVE' : 'INACTIVE'}</span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? C.blue : C.border, boxShadow: active ? `0 0 6px ${C.blue}` : 'none', display: 'inline-block', transition: 'all 0.3s' }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { control: 'lights',      label: 'LIGHTS',      isFan: false },
            { control: 'ventilation', label: 'VENTILATION', isFan: true  },
          ].map(({ control, label, isFan }) => {
            const active    = currentOffice[control];
            const disabled  = !isPowered;
            const uptimeKey = `${selectedOffice}_${control}`;
            return (
              <button key={control} onClick={() => toggleControl(selectedOffice, control)} disabled={disabled}
                style={{
                  width: '100%',
                  background: disabled ? C.bg : active ? isFan ? `${C.blue}0d` : `#fbbf2408` : C.surface,
                  border: `1px solid ${disabled ? C.border : active ? isFan ? `${C.blue}55` : `#fbbf2455` : C.border}`,
                  boxShadow: !disabled && active ? isFan ? `0 0 14px ${C.blueGlow}` : `0 0 14px #fbbf2422` : 'none',
                  borderRadius: 10, padding: '14px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.35 : 1,
                  transition: 'all 0.3s', position: 'relative', overflow: 'hidden'
                }}>
                {active && !disabled && (
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 2, background: isFan ? C.blue : C.yellow }} />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {isFan ? <FanIcon active={active && !disabled} size={38} /> : <BulbIcon active={active && !disabled} size={38} />}
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 15, letterSpacing: 3, color: disabled ? C.textDim : active ? C.textMid : C.textDim }}>{label}</div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 2, color: C.textDim, marginTop: 2 }}>
                      {disabled ? 'NO POWER' : active ? 'RUNNING' : 'STANDBY'}
                    </div>
                    {active && !disabled && <Uptime startTime={uptimes[uptimeKey]} />}
                  </div>
                </div>
                <div style={{
                  fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 17, letterSpacing: 3,
                  color: disabled ? C.border : active ? isFan ? C.blue : C.yellow : C.textDim,
                  textShadow: !disabled && active ? isFan ? `0 0 8px ${C.blue}` : `0 0 8px #fbbf24` : 'none'
                }}>
                  {disabled ? '—' : active ? 'ON' : 'OFF'}
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}