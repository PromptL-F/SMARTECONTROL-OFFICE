import React, { useState, useEffect } from 'react';

// ??????????????????????????????????????????????????????????
// CONFIGURACI�N
// ??????????????????????????????????????????????????????????
const ESP_IP = "http://192.168.1.29";

const BT_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const BT_CHAR_TX_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // Write
const BT_CHAR_RX_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // Notify

const USERS = {
  admin:    { password: '1234', type: 'numeric', role: 'ADMIN' },
  invitado: { password: 'casa', type: 'alpha',   role: 'GUEST' },
};

// ??????????????????????????????????????????????????????????
// PALETAS DE COLOR
// ??????????????????????????????????????????????????????????

// Modo WiFi � cyberpunk oscuro
const CW = {
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

// Modo BLE � claro angular
const CG = {
  bg:        '#f8fafb',
  bgDeep:    '#f0f4f7',
  surface:   '#ffffff',
  surfaceHi: '#f4f9f4',
  border:    '#c8dfc8',
  borderHi:  '#4CAF5044',
  green:     '#2E7D32',
  greenMid:  '#43A047',
  greenLight:'#66BB6A',
  greenGlow: '#43A04722',
  greenPale: '#E8F5E9',
  text:      '#1a2e1a',
  textMid:   '#2d4a2d',
  textDim:   '#6a8f6a',
  textMuted: '#a8c4a8',
  yellow:    '#F9A825',
  yellowGlow:'#F9A82544',
  red:       '#C62828',
  redGlow:   '#C6282822',
  btBlue:    '#1565C0',
  btBluePale:'#E3F2FD',
  white:     '#ffffff',
};

// ??????????????????????????????????????????????????????????
// FUENTES
// ??????????????????????????????????????????????????????????
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Barlow+Condensed:wght@300;400;600;700&family=Rajdhani:wght@300;400;600;700&display=swap';
document.head.appendChild(fontLink);

const FW_DISPLAY = "'Barlow Condensed', sans-serif"; // WiFi
const FG_DISPLAY = "'Rajdhani', sans-serif";          // BLE
const FONT_MONO  = "'Space Mono', monospace";          // Ambos

// ??????????????????????????????????????????????????????????
// ESTILOS GLOBALES
// ??????????????????????????????????????????????????????????
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fanSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes bulbPulseW {
    0%,100% { opacity:1; filter: drop-shadow(0 0 6px #fbbf24) drop-shadow(0 0 14px #fbbf2499); }
    50%     { opacity:.82; filter: drop-shadow(0 0 10px #fbbf24) drop-shadow(0 0 22px #fbbf24aa); }
  }
  @keyframes bulbPulseG {
    0%,100% { filter: drop-shadow(0 0 5px #F9A825) drop-shadow(0 0 12px #F9A82599); }
    50%     { filter: drop-shadow(0 0 9px #F9A825) drop-shadow(0 0 20px #F9A825aa); }
  }
  @keyframes glowRingW {
    0%,100% { box-shadow: 0 0 8px #fbbf2444, inset 0 0 8px #fbbf2422; }
    50%     { box-shadow: 0 0 18px #fbbf2488, inset 0 0 14px #fbbf2444; }
  }
  @keyframes glowRingG {
    0%,100% { box-shadow: 0 0 6px #43A04733, inset 0 0 6px #43A04711; }
    50%     { box-shadow: 0 0 16px #43A04766, inset 0 0 12px #43A04733; }
  }
  @keyframes fanGlowW {
    0%,100% { box-shadow: 0 0 8px #3b82f644, inset 0 0 8px #3b82f622; }
    50%     { box-shadow: 0 0 18px #3b82f688, inset 0 0 14px #3b82f644; }
  }
  @keyframes fanGlowG {
    0%,100% { box-shadow: 0 0 6px #43A04733, inset 0 0 6px #43A04711; }
    50%     { box-shadow: 0 0 16px #43A04766, inset 0 0 12px #43A04733; }
  }
  @keyframes resetPulse {
    0%,100% { box-shadow: 0 0 8px #ef444444; }
    50%     { box-shadow: 0 0 20px #ef444488, 0 0 40px #ef444422; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shake {
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
  @keyframes btPulse {
    0%,100% { box-shadow: 0 0 0 0 #43A04733; }
    50%     { box-shadow: 0 0 0 10px #43A04700; }
  }
  @keyframes btScan {
    0%   { transform: translateY(-4px); opacity: .4; }
    50%  { transform: translateY(4px);  opacity: 1; }
    100% { transform: translateY(-4px); opacity: .4; }
  }
  @keyframes connectedPop {
    0%   { transform: scale(.85); opacity: 0; }
    70%  { transform: scale(1.06); }
    100% { transform: scale(1);   opacity: 1; }
  }
  @keyframes modeIn {
    from { opacity: 0; transform: scale(.94) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes modePulse {
    0%,100% { opacity: .5; }
    50%     { opacity: 1; }
  }
  .login-input-w:focus {
    outline: none;
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 1px #3b82f644, 0 0 12px #3b82f622 !important;
  }
  .login-input-g:focus {
    outline: none;
    border-color: #2E7D32 !important;
    box-shadow: 0 0 0 1px #43A04722, 0 0 10px #43A04722 !important;
  }
  .login-input-w::placeholder { color: #1e40af88; letter-spacing: 3px; }
  .login-input-g::placeholder { color: #a8c4a8;   letter-spacing: 3px; }
  .login-input-w::-webkit-inner-spin-button,
  .login-input-w::-webkit-outer-spin-button,
  .login-input-g::-webkit-inner-spin-button,
  .login-input-g::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  .login-input-w[type=number],
  .login-input-g[type=number] { -moz-appearance: textfield; }
  .bt-btn:hover { background: #E8F5E9 !important; border-color: #2E7D32 !important; }
  .office-btn-g:hover { box-shadow: 0 2px 12px #43A04722; }
`;
document.head.appendChild(styleSheet);

// ??????????????????????????????????????????????????????????
// AUDIO
// ??????????????????????????????????????????????????????????
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
  navigate: () => {
    const ctx = getCtx(); const t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(185, t); o.frequency.exponentialRampToValueAtTime(95, t + 0.055);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.28, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.10);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.11);
  },
  back: () => {
    const ctx = getCtx(); const t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(83, t + 0.055);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.24, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.10);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.11);
  },
  btConnect: () => {
    const ctx = getCtx(); const t = ctx.currentTime;
    [520, 780, 1040].forEach((f, i) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t + i * 0.09);
      g.gain.linearRampToValueAtTime(0.14, t + i * 0.09 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.09 + 0.16);
      o.connect(g); g.connect(ctx.destination); o.start(t + i * 0.09); o.stop(t + i * 0.09 + 0.17);
    });
  },
  btDisconnect: () => {
    const ctx = getCtx(); const t = ctx.currentTime;
    [400, 280].forEach((f, i) => {
      const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t + i * 0.12);
      g.gain.linearRampToValueAtTime(0.10, t + i * 0.12 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.18);
      o.connect(g); g.connect(ctx.destination); o.start(t + i * 0.12); o.stop(t + i * 0.12 + 0.2);
    });
  },
  modeSelect: () => {
    const ctx = getCtx(); const t = ctx.currentTime;
    [330, 440, 550, 660].forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0, t + i * 0.07);
      g.gain.linearRampToValueAtTime(0.12, t + i * 0.07 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.15);
      o.connect(g); g.connect(ctx.destination); o.start(t + i * 0.07); o.stop(t + i * 0.07 + 0.16);
    });
  },
};

// ??????????????????????????????????????????????????????????
// ICONOS SVG
// ??????????????????????????????????????????????????????????
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
      <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 3v5h5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LogoutIcon({ color, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="16 17 21 12 16 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="21" y1="12" x2="3" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WifiIcon({ color, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="20" r="1" fill={color} />
    </svg>
  );
}

function BluetoothIcon({ size = 20, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SwitchModeIcon({ color, size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 9l4-4 4 4M7 5v14M21 15l-4 4-4-4M17 19V5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ??????????????????????????????????????????????????????????
// COMPONENTES COMPARTIDOS
// ??????????????????????????????????????????????????????????

// Fan � modo aware
function FanIcon({ active, size = 38, mode }) {
  const color = active
    ? (mode === 'wifi' ? CW.blue : CG.green)
    : (mode === 'wifi' ? CW.textDim : CG.textMuted);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `1px solid ${active ? (mode === 'wifi' ? CW.blue + '55' : CG.green + '55') : (mode === 'wifi' ? CW.border : CG.border)}`,
      animation: active ? `${mode === 'wifi' ? 'fanGlowW' : 'fanGlowG'} 2s ease-in-out infinite` : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'border-color 0.4s',
      background: active && mode === 'ble' ? CG.greenPale : 'transparent',
    }}>
      <svg width={size * 0.68} height={size * 0.68} viewBox="0 0 48 48" fill="none"
        style={{ animation: `fanSpin ${active ? '0.7s' : '3s'} linear infinite`, animationPlayState: active ? 'running' : 'paused' }}>
        <path d="M24 24 C24 24 22 14 18 10 C14 6 8 8 8 8 C8 8 12 14 16 18 C20 22 24 24 24 24Z" fill={color} opacity="0.9" />
        <path d="M24 24 C24 24 34 22 38 18 C42 14 40 8 40 8 C40 8 34 12 30 16 C26 20 24 24 24 24Z" fill={color} opacity="0.9" />
        <path d="M24 24 C24 24 26 34 30 38 C34 42 40 40 40 40 C40 40 36 34 32 30 C28 26 24 24 24 24Z" fill={color} opacity="0.9" />
        <path d="M24 24 C24 24 14 26 10 30 C6 34 8 40 8 40 C8 40 14 36 18 32 C22 28 24 24 24 24Z" fill={color} opacity="0.9" />
        <circle cx="24" cy="24" r="4" fill={color} />
        <circle cx="24" cy="24" r="2" fill={mode === 'wifi' ? CW.bg : CG.white} />
      </svg>
    </div>
  );
}

// Bulb � modo aware
function BulbIcon({ active, size = 38, mode }) {
  const C = mode === 'wifi' ? CW : CG;
  const fillCol = active ? C.yellow : (mode === 'wifi' ? CW.textDim : CG.textMuted);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `1px solid ${active ? C.yellow + '55' : C.border}`,
      animation: active ? `${mode === 'wifi' ? 'glowRingW' : 'glowRingG'} 2.5s ease-in-out infinite` : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: active ? (mode === 'wifi' ? '#fbbf2408' : '#FFF9C4') : 'transparent',
    }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 32 32" fill="none"
        style={{
          animation: active ? `${mode === 'wifi' ? 'bulbPulseW' : 'bulbPulseG'} 2.5s ease-in-out infinite` : 'none',
          filter: active ? `drop-shadow(0 0 5px ${C.yellow})` : 'none',
        }}>
        <path d="M16 3 C10.477 3 6 7.477 6 13 C6 16.5 7.8 19.6 10.5 21.5 L10.5 25 C10.5 25.55 10.95 26 11.5 26 L20.5 26 C21.05 26 21.5 25.55 21.5 25 L21.5 21.5 C24.2 19.6 26 16.5 26 13 C26 7.477 21.523 3 16 3Z"
          fill={fillCol} opacity={active ? 1 : 0.45} />
        <rect x="11.5" y="26.5" width="9" height="1.5" rx="0.75" fill={active ? C.yellow + '99' : C.border} />
        <rect x="12.5" y="28.5" width="7" height="1.5" rx="0.75" fill={active ? C.yellow + '66' : C.border} />
        {active && <ellipse cx="13.5" cy="11" rx="2.5" ry="3.5" fill="white" opacity="0.35" />}
      </svg>
    </div>
  );
}

function Clock({ mode }) {
  const C = mode === 'wifi' ? CW : CG;
  const FD = mode === 'wifi' ? FW_DISPLAY : FG_DISPLAY;
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const pad = n => String(n).padStart(2, '0');
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const days   = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const date = `${days[now.getDay()]} ${pad(now.getDate())} ${months[now.getMonth()]} ${now.getFullYear()}`;
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 36, color: C.textMid, letterSpacing: 4 }}>{time}</div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.textDim, letterSpacing: 4, marginTop: 2 }}>{date}</div>
    </div>
  );
}

function Uptime({ startTime, mode }) {
  const C = mode === 'wifi' ? CW : CG;
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
      ? {h > 0 ? `${pad(h)}:` : ''}{pad(m)}:{pad(s)}
    </div>
  );
}

const Divider = ({ C, style }) => (
  <div style={{ borderTop: `1px solid ${C.border}`, margin: '10px 0', ...style }} />
);

// ??????????????????????????????????????????????????????????
// LOGIN SCREEN (compartido)
// ??????????????????????????????????????????????????????????
function LoginScreen({ onLogin }) {
  const C = CW;
  const [sel, setSel]         = useState(null);
  const [pw, setPw]           = useState('');
  const [err, setErr]         = useState('');
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const cfg = sel ? USERS[sel] : null;
  const userCol = sel ? (sel === 'admin' ? C.blue : C.green) : C.blue;

  const selUser = u => { SFX.navigate(); setSel(u); setPw(''); setErr(''); };
  const back    = () => { SFX.back(); setSel(null); setPw(''); setErr(''); };

  const onChange = e => {
    const v = e.target.value;
    if (cfg?.type === 'numeric' && !/^\d*$/.test(v)) return;
    if (cfg?.type === 'alpha'   && !/^[a-zA-Z]*$/.test(v)) return;
    setPw(v); setErr('');
  };

  const doLogin = async () => {
    if (!sel || !pw) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (USERS[sel].password === pw) {
      SFX.loginSuccess();
      onLogin(sel);
    } else {
      SFX.loginError();
      setErr('ACCESO DENEGADO');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setPw('');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100dvh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {/* Grid */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(${C.blue}08 1px,transparent 1px),linear-gradient(90deg,${C.blue}08 1px,transparent 1px)`, backgroundSize: '48px 48px' }} />
      {/* Scanline */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: `linear-gradient(transparent,${C.blue}18,transparent)`, animation: 'scanline 6s linear infinite' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 360, position: 'relative', zIndex: 10, animation: 'fadeIn .5s ease forwards' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, marginRight: 10 }}>
            {[18, 12, 24, 16].map((h, i) => (
              <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: C.blue, opacity: [.3, .5, 1, .7][i] }} />
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: FW_DISPLAY, fontWeight: 700, fontSize: 28, color: C.text, letterSpacing: 2, lineHeight: 1 }}>
              SMART<span style={{ color: C.blue }}>OFFICE</span>
            </div>
            <div style={{ fontFamily: FW_DISPLAY, fontWeight: 300, fontSize: 10, letterSpacing: 7, color: C.blue, marginTop: 1 }}>
              CONTROL SYSTEM
            </div>
          </div>
        </div>
        <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${C.blue},transparent)`, marginBottom: 20 }} />

        {/* Auth box */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '22px 20px', animation: shaking ? 'shake .4s ease' : 'none' }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 5, color: C.textDim, textAlign: 'center', marginBottom: 8 }}>� AUTENTICACI�N �</div>

          {!sel ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 4, color: C.textDim, textAlign: 'center', marginBottom: 4 }}>SELECCIONAR USUARIO</div>
              {Object.entries(USERS).map(([u, c]) => {
                const uc = u === 'admin' ? CW.blue : CW.green;
                return (
                  <button key={u} onClick={() => selUser(u)}
                    style={{ background: 'transparent', border: `1px solid ${uc}44`, borderRadius: 9, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${uc}0a`; e.currentTarget.style.borderColor = `${uc}88`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = `${uc}44`; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', border: `1px solid ${uc}55`, background: `${uc}0d`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="8" r="4" stroke={uc} strokeWidth="1.5" />
                          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={uc} strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontFamily: FW_DISPLAY, fontWeight: 600, fontSize: 15, letterSpacing: 3, color: C.textMid }}>{u.toUpperCase()}</div>
                        <div style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 2, color: C.textDim, marginTop: 1 }}>
                          {c.role} � {c.type === 'numeric' ? 'PIN NUM�RICO' : 'CLAVE ALFA'}
                        </div>
                      </div>
                    </div>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke={uc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ animation: 'fadeIn .3s ease forwards' }}>
              {/* Usuario seleccionado */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: `${userCol}08`, border: `1px solid ${userCol}33`, borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${userCol}55`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke={userCol} strokeWidth="1.5" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={userCol} strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: FW_DISPLAY, fontWeight: 600, fontSize: 13, letterSpacing: 3, color: C.textMid }}>{sel.toUpperCase()}</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 2, color: C.textDim }}>{USERS[sel].role}</div>
                </div>
                <button onClick={back} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: C.textDim, fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 2 }}>? CAMBIAR</button>
              </div>

              {/* Password */}
              <div style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 4, color: C.textDim, marginBottom: 8 }}>
                {USERS[sel].type === 'numeric' ? '� PIN NUM�RICO �' : '� CLAVE ALFAB�TICA �'}
              </div>
              <div style={{ position: 'relative' }}>
                <input className="login-input-w"
                  type="password"
                  inputMode={USERS[sel].type === 'numeric' ? 'numeric' : 'text'}
                  value={pw} onChange={onChange} onKeyDown={e => e.key === 'Enter' && doLogin()}
                  placeholder="� � � �" autoFocus maxLength={USERS[sel].type === 'numeric' ? 8 : 16}
                  style={{ width: '100%', background: C.bg, border: `1px solid ${err ? C.red + '88' : C.border}`, borderRadius: 8, padding: '12px 44px 12px 14px', fontFamily: FONT_MONO, fontSize: pw ? 18 : 14, letterSpacing: pw ? 6 : 3, color: err ? C.red : C.textMid, transition: 'all .2s' }}
                />
                <div style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke={err ? C.red : C.textDim} strokeWidth="1.5" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={err ? C.red : C.textDim} strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Dots */}
              {pw.length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginTop: 8, justifyContent: 'center' }}>
                  {Array.from({ length: Math.min(pw.length, 12) }).map((_, i) => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: err ? C.red : userCol, boxShadow: `0 0 5px ${err ? C.red : userCol}`, animation: `fadeIn .15s ease ${i * .03}s both` }} />
                  ))}
                </div>
              )}

              {err && <div style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 3, color: C.red, textAlign: 'center', marginTop: 10, animation: 'fadeIn .2s ease' }}>? {err}</div>}

              {/* Submit */}
              <button onClick={doLogin} disabled={!pw || loading}
                style={{ width: '100%', marginTop: 14, background: !pw ? 'transparent' : `${userCol}15`, border: `1px solid ${!pw ? C.border : userCol + '66'}`, borderRadius: 8, padding: 12, cursor: !pw ? 'not-allowed' : loading ? 'wait' : 'pointer', opacity: !pw ? .4 : 1, transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onMouseEnter={e => { if (pw && !loading) { e.currentTarget.style.background = `${userCol}22`; e.currentTarget.style.boxShadow = `0 0 14px ${userCol}22`; } }}
                onMouseLeave={e => { e.currentTarget.style.background = `${userCol}15`; e.currentTarget.style.boxShadow = 'none'; }}>
                {loading
                  ? <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 4, color: userCol }}>VERIFICANDO���</span>
                  : <>
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke={pw ? userCol : C.textDim} strokeWidth="1.5" strokeLinecap="round" />
                      <polyline points="10 17 15 12 10 7" stroke={pw ? userCol : C.textDim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="15" y1="12" x2="3" y2="12" stroke={pw ? userCol : C.textDim} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 4, color: pw ? userCol : C.textDim }}>ACCEDER</span>
                  </>
                }
              </button>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 3, color: C.textMuted }}>SMARTOFFICE UNIFIED � v3.0</div>
        </div>
      </div>
    </div>
  );
}

// ??????????????????????????????????????????????????????????
// MODE SELECTOR
// ??????????????????????????????????????????????????????????
function ModeSelector({ currentUser, onSelect }) {
  const [hover, setHover] = useState(null);

  return (
    <div style={{ minHeight: '100dvh', background: CW.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(${CW.blue}08 1px,transparent 1px),linear-gradient(90deg,${CW.blue}08 1px,transparent 1px)`, backgroundSize: '48px 48px' }} />
      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 10, animation: 'modeIn .5s ease forwards' }}>
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <div style={{ fontFamily: FW_DISPLAY, fontWeight: 700, fontSize: 26, color: CW.text, letterSpacing: 2 }}>
            SMART<span style={{ color: CW.blue }}>OFFICE</span>
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 5, color: CW.textDim, marginTop: 2 }}>SELECCIONAR M�DULO</div>
        </div>
        <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${CW.blue},transparent)`, marginBottom: 6 }} />
        <div style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 3, color: CW.textDim, textAlign: 'center', marginBottom: 20 }}>
          <span style={{ color: CW.blue, marginRight: 6 }}>?</span>
          {currentUser.toUpperCase()} � {USERS[currentUser].role}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* WiFi Card */}
          <button onClick={() => { SFX.modeSelect(); onSelect('wifi'); }}
            style={{ background: hover === 'wifi' ? `${CW.blue}0d` : CW.surface, border: `1px solid ${hover === 'wifi' ? CW.blue + '66' : CW.border}`, borderRadius: 14, padding: '20px 22px', cursor: 'pointer', transition: 'all .25s', boxShadow: hover === 'wifi' ? `0 0 22px ${CW.blueGlow}` : 'none', animation: 'fadeIn .4s ease .1s both', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={() => setHover('wifi')} onMouseLeave={() => setHover(null)}>
            {hover === 'wifi' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${CW.blue},transparent)` }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', border: `1px solid ${CW.blue}44`, background: `${CW.blue}0d`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: hover === 'wifi' ? `0 0 16px ${CW.blueGlow}` : 'none', transition: 'all .25s', flexShrink: 0 }}>
                <WifiIcon color={CW.blue} size={24} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: FW_DISPLAY, fontWeight: 700, fontSize: 20, color: hover === 'wifi' ? CW.textMid : CW.textDim, letterSpacing: 3 }}>MODO WIFI</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 2, color: CW.textDim, marginTop: 3, lineHeight: 1.6 }}>
                  Control v�a HTTP � ESP32 WiFi<br />Interfaz cyberpunk oscura
                </div>
              </div>
              <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width={16} height={16} viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke={hover === 'wifi' ? CW.blue : CW.border} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              {['HTTP REST', 'ESP32', '4 OFICINAS', 'LIGHTS', 'VENTILATION'].map(t => (
                <span key={t} style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 2, color: CW.textDim, background: `${CW.blue}0a`, border: `1px solid ${CW.blue}22`, borderRadius: 4, padding: '2px 7px' }}>{t}</span>
              ))}
            </div>
          </button>

          {/* BLE Card */}
          <button onClick={() => { SFX.modeSelect(); onSelect('ble'); }}
            style={{ background: hover === 'ble' ? `${CG.green}0d` : CW.surface, border: `1px solid ${hover === 'ble' ? CG.green + '55' : CW.border}`, borderRadius: 14, padding: '20px 22px', cursor: 'pointer', transition: 'all .25s', boxShadow: hover === 'ble' ? `0 0 22px ${CG.greenGlow}` : 'none', animation: 'fadeIn .4s ease .22s both', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={() => setHover('ble')} onMouseLeave={() => setHover(null)}>
            {hover === 'ble' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${CG.green},transparent)` }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', border: `1px solid ${CG.green}44`, background: `${CG.green}0d`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: hover === 'ble' ? `0 0 16px ${CG.greenGlow}` : 'none', transition: 'all .25s', flexShrink: 0 }}>
                <BluetoothIcon color={CG.btBlue} size={24} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: FG_DISPLAY, fontWeight: 700, fontSize: 20, color: hover === 'ble' ? CG.greenMid : CG.textDim, letterSpacing: 3 }}>MODO BLUETOOTH</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 2, color: CW.textDim, marginTop: 3, lineHeight: 1.6 }}>
                  Control v�a BLE Nordic UART<br />Interfaz clara angular
                </div>
              </div>
              <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width={16} height={16} viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke={hover === 'ble' ? CG.green : CW.border} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              {['BLE UART', 'NORDIC', 'ESP32', '4 OFICINAS', 'LIGHTS', 'VENTILATION'].map(t => (
                <span key={t} style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 2, color: CG.greenMid, background: `${CG.green}0a`, border: `1px solid ${CG.green}22`, borderRadius: 4, padding: '2px 7px' }}>{t}</span>
              ))}
            </div>
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 3, color: CW.textMuted, animation: 'modePulse 3s ease-in-out infinite' }}>
            SELECCIONA UN MODO PARA CONTINUAR
          </div>
        </div>
      </div>
    </div>
  );
}

// ??????????????????????????????????????????????????????????
// WiFi APP
// ??????????????????????????????????????????????????????????
function WifiApp({ currentUser, onLogout, onSwitchMode }) {
  const C  = CW;
  const FD = FW_DISPLAY;
  const [selectedOffice, setSelectedOffice] = useState(null);

  const DEF = { 1: { lights: false, ventilation: false }, 2: { lights: false, ventilation: false }, 3: { lights: false, ventilation: false }, 4: { lights: false, ventilation: false } };
  const LS1 = 'smartoffice_wifi_offices';
  const LS2 = 'smartoffice_wifi_uptimes';

  const load1 = () => { try { const s = localStorage.getItem(LS1); return s ? JSON.parse(s) : DEF; } catch { return DEF; } };
  const load2 = () => { try { const s = localStorage.getItem(LS2); return s ? JSON.parse(s) : {}; }  catch { return {}; } };

  const [offices, setOffices]         = useState(load1);
  const [uptimes, setUptimes]         = useState(load2);
  const [isPowered, setIsPowered]     = useState(true);
  const [powering, setPowering]       = useState(false);
  const [resetting, setResetting]     = useState(false);
  const [savedOffices, setSavedOffices] = useState(null);
  const [savedUptimes, setSavedUptimes] = useState(null);

  useEffect(() => {
    try { localStorage.setItem(LS1, JSON.stringify(offices)); localStorage.setItem(LS2, JSON.stringify(uptimes)); } catch {}
  }, [offices, uptimes]);

  const api = (path, body) =>
    fetch(`${ESP_IP}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => {});

  const handleLogout = () => { SFX.powerOff(); setSelectedOffice(null); onLogout(); };

  const toggleControl = async (office, control) => {
    if (!isPowered) return;
    const ns = !offices[office][control];
    const no = { ...offices, [office]: { ...offices[office], [control]: ns } };
    const nu = { ...uptimes, [`${office}_${control}`]: ns ? Date.now() : null };
    setOffices(no); setUptimes(nu);
    SFX.navigate();
    await api('/control', { oficina: office, dispositivo: control, estado: ns });
  };

  const togglePower = async () => {
    const np = !isPowered; setPowering(true);
    if (np) {
      const snap = savedOffices;
      SFX.powerOn(); setIsPowered(true);
      if (snap) { setOffices(snap); setUptimes(savedUptimes || {}); setSavedOffices(null); setSavedUptimes(null); }
      await api('/power', { estado: true });
    } else {
      setSavedOffices(offices); setSavedUptimes(uptimes);
      SFX.powerOff(); setIsPowered(false); setSelectedOffice(null); setOffices(DEF); setUptimes({});
      await api('/power', { estado: false });
    }
    setPowering(false);
  };

  const resetAll = async () => {
    SFX.reset(); setResetting(true); setSelectedOffice(null);
    setOffices(DEF); setUptimes({}); setSavedOffices(null); setSavedUptimes(null);
    try { localStorage.removeItem(LS1); localStorage.removeItem(LS2); } catch {}
    await api('/reset', {}); setResetting(false);
  };

  const GridBg = () => (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(${C.blue}08 1px,transparent 1px),linear-gradient(90deg,${C.blue}08 1px,transparent 1px)`, backgroundSize: '48px 48px' }} />
  );

  // ?? VISTA PRINCIPAL ???????????????????????????????????????
  if (!selectedOffice) {
    return (
      <div style={{ minHeight: '100dvh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <GridBg />
        <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 10 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 26, color: C.text, letterSpacing: 2, lineHeight: 1 }}>SMART<span style={{ color: C.blue }}>OFFICE</span></div>
              <div style={{ fontFamily: FD, fontWeight: 300, fontSize: 10, letterSpacing: 7, color: C.blue, marginTop: 1 }}>WIFI CONTROL</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {/* User badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${C.blue}0d`, border: `1px solid ${C.blue}33`, borderRadius: 6, padding: '3px 8px' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.blue, boxShadow: `0 0 4px ${C.blue}`, display: 'inline-block' }} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 2, color: C.blue }}>{currentUser.toUpperCase()}</span>
                </div>
                {/* Switch mode */}
                <button onClick={() => { SFX.back(); onSwitchMode(); }} title="Cambiar modo"
                  style={{ background: 'transparent', border: `1px solid ${C.blue}33`, borderRadius: 6, padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.background = `${C.blue}0d`}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <SwitchModeIcon color={C.blue} size={12} />
                </button>
                {/* Logout */}
                <button onClick={handleLogout}
                  style={{ background: 'transparent', border: `1px solid ${C.red}33`, borderRadius: 6, padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.background = `${C.red}0d`}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <LogoutIcon color={C.red} size={12} />
                </button>
              </div>
              {/* Status indicators */}
              {[{ label: isPowered ? 'ONLINE' : 'OFFLINE', active: isPowered, color: C.green }, { label: !isPowered ? 'FAULT' : 'CLEAR', active: !isPowered, color: C.red }].map(({ label, active, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 2, color: active ? color : C.textDim }}>{label}</span>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? color : C.surface, border: `1px solid ${active ? color : C.border}`, boxShadow: active ? `0 0 5px ${color}` : 'none', display: 'inline-block', transition: 'all .5s' }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${C.blue},transparent)`, marginBottom: 12 }} />

          {/* Clock + Reset */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock mode="wifi" />
            {currentUser !== 'invitado' && (
              <button onClick={resetAll} disabled={resetting || powering}
                style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: resetting ? `${C.red}0d` : 'transparent', border: `1px solid ${C.red}44`, borderRadius: 8, padding: '7px 9px', cursor: resetting ? 'wait' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: (resetting || powering) ? .45 : 1, transition: 'all .3s', animation: resetting ? 'resetPulse 1s ease-in-out infinite' : 'none' }}>
                <ResetIcon color={C.red} size={14} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 2, color: C.red, lineHeight: 1 }}>{resetting ? '���' : 'RST'}</span>
              </button>
            )}
          </div>

          <Divider C={C} style={{ margin: '12px 0 10px' }} />
          <div style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 5, color: C.textDim, textAlign: 'center', marginBottom: 8 }}>� SELECCIONAR OFICINA �</div>

          {/* Office grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            {[1, 2, 3, 4].map(o => {
              const anyOn = offices[o].lights || offices[o].ventilation;
              const active = isPowered && anyOn;
              return (
                <button key={o} onClick={() => { if (isPowered) { SFX.navigate(); setSelectedOffice(o); } }}
                  style={{ background: active ? `${C.blue}0a` : C.surface, border: `1px solid ${!isPowered ? C.border : active ? C.blue + '55' : C.border}`, boxShadow: active ? `0 0 10px ${C.blueGlow}` : 'none', borderRadius: 10, padding: '14px 0', cursor: isPowered ? 'pointer' : 'not-allowed', opacity: !isPowered ? .4 : 1, transition: 'all .3s', position: 'relative', overflow: 'hidden' }}>
                  {active && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: C.blue }} />}
                  <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 32, color: active ? C.textMid : C.textDim, letterSpacing: 1 }}>{String(o).padStart(2, '0')}</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 4, color: C.textDim, marginTop: 2 }}>OFFICE</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 6 }}>
                    {[{ k: 'lights', c: C.yellow }, { k: 'ventilation', c: '#e8f0fe' }].map(({ k, c }) => (
                      <span key={k} style={{ width: 6, height: 6, borderRadius: '50%', background: offices[o][k] ? c : C.border, boxShadow: offices[o][k] ? `0 0 6px ${c}88` : 'none', display: 'inline-block', transition: 'all .3s' }} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ height: 1, background: `${C.border}66` }} />

          {/* Power button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, marginBottom: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <button onClick={togglePower} disabled={powering} style={{ background: 'none', border: 'none', padding: 0, cursor: powering ? 'wait' : 'pointer' }}>
                <div style={{ width: 110, height: 110, borderRadius: '50%', border: `1px solid ${isPowered ? C.green : C.red}`, boxShadow: `0 0 20px ${isPowered ? C.greenGlow : C.redGlow},inset 0 0 20px ${isPowered ? C.greenGlow : C.redGlow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .5s', opacity: powering ? .5 : 1, background: isPowered ? `${C.green}08` : `${C.red}08` }}>
                  <div style={{ width: 86, height: 86, borderRadius: '50%', border: `1px solid ${isPowered ? C.green : C.red}22`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <PowerIcon color={isPowered ? C.green : C.red} size={28} />
                    <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 8, letterSpacing: 3, color: isPowered ? C.green : C.red }}>{powering ? '���' : 'POWER'}</span>
                  </div>
                </div>
              </button>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 3, color: isPowered ? C.green : C.red, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: isPowered ? C.green : C.red, boxShadow: `0 0 6px ${isPowered ? C.green : C.red}`, display: 'inline-block' }} />
                {isPowered ? 'ONLINE' : 'OFFLINE'}
              </div>
              {savedOffices && !isPowered && <span style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 2, color: C.yellow, textAlign: 'center' }}>? RESTORE ON POWER ON</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ?? VISTA DE OFICINA ??????????????????????????????????????
  const cur = offices[selectedOffice];
  return (
    <div style={{ minHeight: '100dvh', background: C.bg, padding: 16 }}>
      <GridBg />
      <div style={{ maxWidth: 400, margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Topbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={() => { SFX.back(); setSelectedOffice(null); }}
            style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.textMid, fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 2, padding: '7px 12px', borderRadius: 8, cursor: 'pointer' }}>
            ? BACK
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 18, color: isPowered ? C.textMid : C.red, letterSpacing: 4 }}>
              OFFICE <span style={{ color: isPowered ? C.blue : C.red }}>{String(selectedOffice).padStart(2, '0')}</span>
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
              style={{ background: 'transparent', border: `1px solid ${C.red}33`, padding: '7px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = `${C.red}0d`}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <LogoutIcon color={C.red} size={14} />
            </button>
          </div>
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${isPowered ? C.blue : C.red},transparent)`, marginBottom: 14 }} />
        <Clock mode="wifi" />
        <Divider C={C} style={{ margin: '14px 0 10px' }} />

        {/* Status */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px', marginBottom: 12 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 5, color: C.textDim, marginBottom: 10 }}>� SYSTEM STATUS �</div>
          {[{ label: 'LIGHTS', active: cur.lights }, { label: 'VENTILATION', active: cur.ventilation }, { label: 'SYSTEM', active: isPowered }].map(({ label, active }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${C.border}44` }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 3, color: C.textDim }}>{label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 2, color: active ? C.blue : C.textDim }}>{active ? 'ACTIVE' : 'INACTIVE'}</span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? C.blue : C.border, boxShadow: active ? `0 0 6px ${C.blue}` : 'none', display: 'inline-block', transition: 'all .3s' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[{ control: 'lights', label: 'LIGHTS', isFan: false }, { control: 'ventilation', label: 'VENTILATION', isFan: true }].map(({ control, label, isFan }) => {
            const active = cur[control], disabled = !isPowered, utk = `${selectedOffice}_${control}`;
            return (
              <button key={control} onClick={() => toggleControl(selectedOffice, control)} disabled={disabled}
                style={{ width: '100%', background: disabled ? C.bg : active ? isFan ? `${C.blue}0d` : '#fbbf2408' : C.surface, border: `1px solid ${disabled ? C.border : active ? isFan ? `${C.blue}55` : '#fbbf2455' : C.border}`, boxShadow: !disabled && active ? isFan ? `0 0 14px ${C.blueGlow}` : '0 0 14px #fbbf2422' : 'none', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .35 : 1, transition: 'all .3s', position: 'relative', overflow: 'hidden' }}>
                {active && !disabled && <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 2, background: isFan ? C.blue : C.yellow }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {isFan ? <FanIcon active={active && !disabled} size={38} mode="wifi" /> : <BulbIcon active={active && !disabled} size={38} mode="wifi" />}
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, letterSpacing: 3, color: disabled ? C.textDim : active ? C.textMid : C.textDim }}>{label}</div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 2, color: C.textDim, marginTop: 2 }}>{disabled ? 'NO POWER' : active ? 'RUNNING' : 'STANDBY'}</div>
                    {active && !disabled && <Uptime startTime={uptimes[utk]} mode="wifi" />}
                  </div>
                </div>
                <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 17, letterSpacing: 3, color: disabled ? C.border : active ? isFan ? C.blue : C.yellow : C.textDim, textShadow: !disabled && active ? isFan ? `0 0 8px ${C.blue}` : '0 0 8px #fbbf24' : 'none' }}>
                  {disabled ? '�' : active ? 'ON' : 'OFF'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Switch mode footer */}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => { SFX.back(); onSwitchMode(); }}
            style={{ background: 'transparent', border: `1px solid ${C.blue}33`, color: C.textDim, fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 3, padding: '8px 16px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={e => e.currentTarget.style.background = `${C.blue}0d`}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <SwitchModeIcon color={C.blue} size={12} />
            CAMBIAR MODO
          </button>
        </div>
      </div>
    </div>
  );
}

// ??????????????????????????????????????????????????????????
// BLE APP
// ??????????????????????????????????????????????????????????

// Env�a un comando JSON al ESP32 v�a BLE UART (fragmentado en chunks de 20 bytes)
async function btSendCommand(txChar, payload) {
  if (!txChar) return;
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload) + '\n');
  for (let i = 0; i < data.length; i += 20) {
    await txChar.writeValue(data.slice(i, i + 20));
  }
}

function BleApp({ currentUser, onLogout, onSwitchMode }) {
  const C  = CG;
  const FD = FG_DISPLAY;

  const [selectedOffice, setSelectedOffice] = useState(null);
  const [btStatus, setBtStatus]   = useState(() => navigator.bluetooth ? 'disconnected' : 'unsupported');
  const [btDevice, setBtDevice]   = useState(null);
  const [txChar, setTxChar]       = useState(null);

  const DEF = { 1: { lights: false, ventilation: false }, 2: { lights: false, ventilation: false }, 3: { lights: false, ventilation: false }, 4: { lights: false, ventilation: false } };
  const LS1 = 'smartoffice_wifi_offices'; // clave compartida con WiFi
  const LS2 = 'smartoffice_wifi_uptimes'; // clave compartida con WiFi

  const load1 = () => { try { const s = localStorage.getItem(LS1); return s ? JSON.parse(s) : DEF; } catch { return DEF; } };
  const load2 = () => { try { const s = localStorage.getItem(LS2); return s ? JSON.parse(s) : {}; }  catch { return {}; } };

  const [offices, setOffices]         = useState(load1);
  const [uptimes, setUptimes]         = useState(load2);
  const [isPowered, setIsPowered]     = useState(true);
  const [powering, setPowering]       = useState(false);
  const [resetting, setResetting]     = useState(false);
  const [savedOffices, setSavedOffices] = useState(null);
  const [savedUptimes, setSavedUptimes] = useState(null);

  useEffect(() => {
    try { localStorage.setItem(LS1, JSON.stringify(offices)); localStorage.setItem(LS2, JSON.stringify(uptimes)); } catch {}
  }, [offices, uptimes]);

  // ?? Bluetooth ?????????????????????????????????????????????
  const connectGatt = async (device) => {
    const server  = await device.gatt.connect();
    const service = await server.getPrimaryService(BT_SERVICE_UUID);
    const tx      = await service.getCharacteristic(BT_CHAR_TX_UUID);
    const rx      = await service.getCharacteristic(BT_CHAR_RX_UUID);
    await rx.startNotifications();
    SFX.btConnect(); setTxChar(tx); setBtStatus('connected');
  };

  const connectBluetooth = async () => {
    if (!navigator.bluetooth) { setBtStatus('unsupported'); return; }
    setBtStatus('connecting');
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'ESP32' }, { services: [BT_SERVICE_UUID] }],
        optionalServices: [BT_SERVICE_UUID],
      });

      device.addEventListener('gattserverdisconnected', async () => {
        SFX.btDisconnect(); setBtStatus('disconnected'); setTxChar(null);
        // Reintento automatico de reconexion
        try {
          setBtStatus('connecting');
          await connectGatt(device);
        } catch {
          setBtStatus('disconnected'); setBtDevice(null);
        }
      });

      setBtDevice(device);
      await connectGatt(device);
    } catch (err) {
      // Si el usuario cancela el dialogo, volvemos a disconnected limpiamente
      console.warn('BT connect error:', err);
      setBtStatus('disconnected');
      setBtDevice(null);
      setTxChar(null);
    }
  };

  const disconnectBluetooth = () => {
    if (btDevice?.gatt?.connected) btDevice.gatt.disconnect();
    SFX.btDisconnect(); setBtStatus('disconnected'); setBtDevice(null); setTxChar(null);
  };

  const handleLogout = () => { SFX.powerOff(); disconnectBluetooth(); setSelectedOffice(null); onLogout(); };

  const toggleControl = async (office, control) => {
    if (!isPowered) return;
    const ns = !offices[office][control];
    setOffices({ ...offices, [office]: { ...offices[office], [control]: ns } });
    setUptimes({ ...uptimes, [`${office}_${control}`]: ns ? Date.now() : null });
    SFX.navigate();
    await btSendCommand(txChar, { oficina: office, dispositivo: control, estado: ns }).catch(console.error);
  };

  const togglePower = async () => {
    const np = !isPowered; setPowering(true);
    if (np) {
      const snap = savedOffices; SFX.powerOn(); setIsPowered(true);
      if (snap) { setOffices(snap); setUptimes(savedUptimes || {}); setSavedOffices(null); setSavedUptimes(null); }
      await btSendCommand(txChar, { power: true }).catch(console.error);
      if (snap) {
        for (const officeId of [1, 2, 3, 4]) {
          for (const device of ['lights', 'ventilation']) {
            if (snap[officeId][device]) {
              await btSendCommand(txChar, { oficina: officeId, dispositivo: device, estado: true }).catch(console.error);
              await new Promise(r => setTimeout(r, 80));
            }
          }
        }
      }
    } else {
      setSavedOffices(offices); setSavedUptimes(uptimes); SFX.powerOff();
      setIsPowered(false); setSelectedOffice(null); setOffices(DEF); setUptimes({});
      await btSendCommand(txChar, { power: false }).catch(console.error);
    }
    setPowering(false);
  };

  const resetAll = async () => {
    SFX.reset(); setResetting(true); setSelectedOffice(null);
    setOffices(DEF); setUptimes({}); setSavedOffices(null); setSavedUptimes(null);
    try { localStorage.removeItem(LS1); localStorage.removeItem(LS2); } catch {}
    await btSendCommand(txChar, { reset: true }).catch(console.error);
    setResetting(false);
  };

  const GridBg = () => (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(${C.green}0a 1px,transparent 1px),linear-gradient(90deg,${C.green}0a 1px,transparent 1px)`, backgroundSize: '44px 44px' }} />
  );

  // Bot�n Bluetooth reutilizable
  function BluetoothButton() {
    const isConn    = btStatus === 'connected';
    const isConn2   = btStatus === 'connecting';
    const isUnsup   = btStatus === 'unsupported';
    const sc = {
      disconnected: { border: C.border,    bg: C.surface,   text: C.textDim,  label: 'CONECTAR BLUETOOTH', dot: C.textMuted },
      connecting:   { border: C.greenMid,  bg: C.greenPale, text: C.greenMid, label: 'BUSCANDO���',         dot: C.greenMid  },
      connected:    { border: C.green,     bg: C.greenPale, text: C.green,    label: 'BT CONECTADO',        dot: C.green     },
      unsupported:  { border: C.textDim,   bg: C.bgDeep,    text: C.textDim,  label: 'BT NO SOPORTADO',     dot: C.textMuted },
    };
    const s = sc[btStatus] || sc.disconnected;
    return (
      <button className="bt-btn" onClick={isConn ? disconnectBluetooth : connectBluetooth} disabled={isConn2 || isUnsup}
        style={{ width: '100%', background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 10, padding: '12px 16px', cursor: isConn2 || isUnsup ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all .25s', opacity: isUnsup ? .5 : 1, animation: isConn ? 'connectedPop .4s ease' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: C.white, border: `1.5px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: isConn2 ? 'btPulse 1.2s ease-in-out infinite' : 'none', boxShadow: isConn ? `0 0 10px ${C.greenGlow}` : 'none' }}>
            <BluetoothIcon size={18} color={s.text} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 14, letterSpacing: 3, color: s.text }}>{s.label}</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 2, color: C.textDim, marginTop: 2 }}>
              {isConn ? `${btDevice?.name || 'ESP32'} � NORDIC UART` : isConn2 ? 'BUSCANDO ESP32���' : 'TOCA PARA VINCULAR'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot, boxShadow: isConn ? `0 0 8px ${C.greenGlow}` : 'none', display: 'inline-block', animation: isConn2 ? 'btScan .8s ease-in-out infinite' : 'none' }} />
          {isConn && <span style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 1, color: C.red }}>?</span>}
        </div>
      </button>
    );
  }

  // Power button BLE
  function BLEPowerButton() {
    const color = isPowered ? C.green : C.red;
    const glow  = isPowered ? C.greenGlow : C.redGlow;
    return (
      <button onClick={togglePower} disabled={powering} style={{ background: 'none', border: 'none', padding: 0, cursor: powering ? 'wait' : 'pointer' }}>
        <div style={{ width: 100, height: 100, borderRadius: '50%', border: `2px solid ${color}`, boxShadow: `0 0 18px ${glow},inset 0 0 18px ${glow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .5s', opacity: powering ? .5 : 1, background: isPowered ? `${C.green}08` : `${C.red}08` }}>
          <div style={{ width: 76, height: 76, borderRadius: '50%', border: `1.5px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PowerIcon color={color} size={30} />
          </div>
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 4, color, textAlign: 'center', marginTop: 6 }}>
          {powering ? '���' : isPowered ? 'ONLINE' : 'OFFLINE'}
        </div>
      </button>
    );
  }

  const userCfg = USERS[currentUser];

  // ?? VISTA PRINCIPAL ???????????????????????????????????????
  if (!selectedOffice) {
    return (
      <div style={{ minHeight: '100dvh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <GridBg />
        <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 10 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BluetoothIcon size={22} color={C.green} />
              <div>
                <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 26, color: C.text, letterSpacing: 2, lineHeight: 1 }}>SMART<span style={{ color: C.green }}>OFFICE</span></div>
                <div style={{ fontFamily: FD, fontWeight: 300, fontSize: 11, letterSpacing: 7, color: C.greenMid, marginTop: 1 }}>BLUETOOTH CONTROL</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${C.green}0d`, border: `1px solid ${C.green}33`, borderRadius: 6, padding: '3px 8px' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.green, boxShadow: `0 0 4px ${C.green}`, display: 'inline-block' }} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 2, color: C.green }}>{currentUser.toUpperCase()}</span>
                </div>
                {/* Switch mode */}
                <button onClick={() => { SFX.back(); onSwitchMode(); }} title="Cambiar modo"
                  style={{ background: 'transparent', border: `1px solid ${C.green}33`, borderRadius: 6, padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.background = `${C.green}0d`}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <SwitchModeIcon color={C.green} size={12} />
                </button>
                {/* Logout */}
                <button onClick={handleLogout}
                  style={{ background: 'transparent', border: `1px solid ${C.red}33`, borderRadius: 6, padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.background = `${C.red}0d`}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <LogoutIcon color={C.red} size={12} />
                </button>
              </div>
              {[{ label: isPowered ? 'ONLINE' : 'OFFLINE', active: isPowered, color: C.green }, { label: !isPowered ? 'FAULT' : 'CLEAR', active: !isPowered, color: C.red }].map(({ label, active, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 2, color: active ? color : C.textDim }}>{label}</span>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? color : C.bgDeep, border: `1px solid ${active ? color : C.border}`, boxShadow: active ? `0 0 5px ${color}` : 'none', display: 'inline-block', transition: 'all .5s' }} />
                </div>
              ))}
            </div>
          </div>

          <Divider C={C} style={{ marginBottom: 12 }} />

          {/* BT button */}
          <BluetoothButton />
          {btStatus === 'connected' && (
            <div style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 3, color: C.greenMid, textAlign: 'center', marginTop: 6, animation: 'fadeIn .3s ease' }}>
              ? {btDevice?.name || 'ESP32'} � SE�AL ACTIVA
            </div>
          )}

          <div style={{ height: 14 }} />

          {/* Clock + Reset */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock mode="ble" />
            {currentUser !== 'invitado' && (
              <button onClick={resetAll} disabled={resetting || powering}
                style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: resetting ? `${C.red}0d` : 'transparent', border: `1.5px solid ${C.red}44`, borderRadius: 8, padding: '7px 9px', cursor: resetting ? 'wait' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: (resetting || powering) ? .45 : 1, transition: 'all .3s', animation: resetting ? 'resetPulse 1s ease-in-out infinite' : 'none' }}>
                <ResetIcon color={C.red} size={15} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 2, color: C.red, lineHeight: 1 }}>{resetting ? '���' : 'RST'}</span>
              </button>
            )}
          </div>

          <Divider C={C} style={{ margin: '12px 0 10px' }} />
          <div style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 5, color: C.textDim, textAlign: 'center', marginBottom: 8 }}>� SELECCIONAR OFICINA �</div>

          {/* Office grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            {[1, 2, 3, 4].map(o => {
              const anyOn = offices[o].lights || offices[o].ventilation;
              const active = isPowered && anyOn;
              return (
                <button key={o} className="office-btn-g"
                  onClick={() => { if (isPowered) { SFX.navigate(); setSelectedOffice(o); } }}
                  style={{ background: active ? C.greenPale : C.surface, border: `1.5px solid ${!isPowered ? C.border : active ? C.green + '55' : C.border}`, boxShadow: active ? `0 0 10px ${C.greenGlow}` : '0 1px 3px #2E7D3208', borderRadius: 10, padding: '14px 0', cursor: isPowered ? 'pointer' : 'not-allowed', opacity: !isPowered ? .4 : 1, transition: 'all .3s', position: 'relative', overflow: 'hidden' }}>
                  {active && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: C.green }} />}
                  <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 32, color: active ? C.green : C.textDim, letterSpacing: 1 }}>{String(o).padStart(2, '0')}</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 4, color: C.textDim, marginTop: 2 }}>OFFICE</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 6 }}>
                    {[{ k: 'lights', c: C.yellow }, { k: 'ventilation', c: C.green }].map(({ k, c }) => (
                      <span key={k} style={{ width: 6, height: 6, borderRadius: '50%', background: offices[o][k] ? c : C.border, boxShadow: offices[o][k] ? `0 0 6px ${c}` : 'none', display: 'inline-block', transition: 'all .3s' }} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ height: 1, background: `${C.border}66` }} />

          {/* Power */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, marginBottom: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <BLEPowerButton />
              {savedOffices && !isPowered && <span style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 2, color: C.yellow, textAlign: 'center' }}>? RESTAURAR AL ENCENDER</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ?? VISTA DE OFICINA ??????????????????????????????????????
  const cur = offices[selectedOffice];
  return (
    <div style={{ minHeight: '100dvh', background: C.bg, padding: 16 }}>
      <GridBg />
      <div style={{ maxWidth: 400, margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Topbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={() => { SFX.back(); setSelectedOffice(null); }}
            style={{ background: 'transparent', border: `1.5px solid ${C.border}`, color: C.textMid, fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 2, padding: '7px 12px', borderRadius: 8, cursor: 'pointer' }}>
            ? BACK
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 18, color: isPowered ? C.text : C.red, letterSpacing: 4 }}>
              OFFICE <span style={{ color: isPowered ? C.green : C.red }}>{String(selectedOffice).padStart(2, '0')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 2 }}>
              <BluetoothIcon size={10} color={btStatus === 'connected' ? C.green : C.textMuted} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 7, letterSpacing: 2, color: btStatus === 'connected' ? C.greenMid : C.textMuted }}>
                {btStatus === 'connected' ? 'BT OK' : 'SIN BT'}
              </span>
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
              style={{ background: 'transparent', border: `1px solid ${C.red}33`, padding: '7px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.background = `${C.red}0d`}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <LogoutIcon color={C.red} size={14} />
            </button>
          </div>
        </div>
        <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${isPowered ? C.green : C.red},transparent)`, marginBottom: 14 }} />
        <Clock mode="ble" />
        <Divider C={C} style={{ margin: '14px 0 10px' }} />

        {/* Status */}
        <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '12px 16px', marginBottom: 12, boxShadow: '0 1px 8px #2E7D3208' }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 5, color: C.textDim, marginBottom: 10 }}>� SYSTEM STATUS �</div>
          {[{ label: 'LIGHTS', active: cur.lights }, { label: 'VENTILATION', active: cur.ventilation }, { label: 'SISTEMA', active: isPowered }, { label: 'BLUETOOTH', active: btStatus === 'connected' }].map(({ label, active }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${C.border}44` }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 3, color: C.textDim }}>{label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 2, color: active ? C.green : C.textDim }}>{active ? 'ACTIVE' : 'INACTIVE'}</span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? C.green : C.border, boxShadow: active ? `0 0 5px ${C.greenGlow}` : 'none', display: 'inline-block', transition: 'all .3s' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[{ control: 'lights', label: 'LIGHTS', isFan: false }, { control: 'ventilation', label: 'VENTILATION', isFan: true }].map(({ control, label, isFan }) => {
            const active = cur[control], disabled = !isPowered, utk = `${selectedOffice}_${control}`;
            const acc  = isFan ? C.green : C.yellow;
            const accG = isFan ? C.greenGlow : C.yellowGlow;
            return (
              <button key={control} onClick={() => toggleControl(selectedOffice, control)} disabled={disabled}
                style={{ width: '100%', background: disabled ? C.bgDeep : active ? isFan ? C.greenPale : '#FFF9C4' : C.surface, border: `1.5px solid ${disabled ? C.border : active ? acc + '55' : C.border}`, boxShadow: !disabled && active ? `0 0 12px ${accG}` : '0 1px 3px #2E7D3205', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .35 : 1, transition: 'all .3s', position: 'relative', overflow: 'hidden' }}>
                {active && !disabled && <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: acc, borderRadius: '3px 0 0 3px' }} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {isFan ? <FanIcon active={active && !disabled} size={38} mode="ble" /> : <BulbIcon active={active && !disabled} size={38} mode="ble" />}
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 15, letterSpacing: 3, color: disabled ? C.textDim : active ? C.text : C.textDim }}>{label}</div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 2, color: C.textDim, marginTop: 2 }}>{disabled ? 'SIN ENERG�A' : active ? 'EN MARCHA' : 'STANDBY'}</div>
                    {active && !disabled && <Uptime startTime={uptimes[utk]} mode="ble" />}
                  </div>
                </div>
                <div style={{ fontFamily: FD, fontWeight: 700, fontSize: 17, letterSpacing: 3, color: disabled ? C.border : active ? acc : C.textDim, textShadow: !disabled && active ? `0 0 8px ${acc}` : 'none' }}>
                  {disabled ? '�' : active ? 'ON' : 'OFF'}
                </div>
              </button>
            );
          })}
        </div>

        {/* BT banner si no conectado */}
        {btStatus !== 'connected' && (
          <div style={{ marginTop: 14 }}>
            <BluetoothButton />
          </div>
        )}

        {/* Switch mode footer */}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
          <button onClick={() => { SFX.back(); onSwitchMode(); }}
            style={{ background: 'transparent', border: `1px solid ${C.green}33`, color: C.textDim, fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 3, padding: '8px 16px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={e => e.currentTarget.style.background = `${C.green}0d`}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <SwitchModeIcon color={C.green} size={12} />
            CAMBIAR MODO
          </button>
        </div>
      </div>
    </div>
  );
}


export default function App() {
  const [user, setUser] = useState(null);   // null = no autenticado
  const [mode, setMode] = useState(null);   // null = selector de modo, 'wifi' | 'ble'

  if (!user) {
    return <LoginScreen onLogin={u => { setUser(u); setMode(null); }} />;
  }
  if (!mode) {
    return <ModeSelector currentUser={user} onSelect={m => setMode(m)} />;
  }
  if (mode === 'wifi') {
    return <WifiApp currentUser={user} onLogout={() => { setUser(null); setMode(null); }} onSwitchMode={() => setMode(null)} />;
  }
  return <BleApp currentUser={user} onLogout={() => { setUser(null); setMode(null); }} onSwitchMode={() => setMode(null)} />;
}