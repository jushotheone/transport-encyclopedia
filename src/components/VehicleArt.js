'use client'
import { useEffect, useId, useState } from 'react'
import { accentFor, shade } from '@/lib/color'
import { bodies } from '@/lib/studio'

// Vehicles drawn as proper families (a car is a car, a train is a train), each in three body styles, with a paint scheme,
// shading and moving parts. Local coordinates: the ground is y = 0, the vehicle faces right.
const OUT = '#0b1626'
const GLASS = '#bfe8ff'
const GLASS_EDGE = '#6fb5de'

// ---- shared pieces -----------------------------------------------------------------------------------------
function Shell({ d, box, colour, livery, uid, name }) {
  const [x, y, w, h] = box
  const id = `clip-${uid}-${name}`
  const acc = accentFor(colour)
  return (
    <g>
      <clipPath id={id}><path d={d} /></clipPath>
      <path d={d} fill={colour} />
      <g clipPath={`url(#${id})`}>
        <rect x={x} y={y} width={w} height={h * 0.42} fill="#fff" opacity="0.18" />
        <rect x={x} y={y + h * 0.74} width={w} height={h * 0.3} fill="#000" opacity="0.15" />
        {livery === 'stripe' && <rect x={x} y={y + h * 0.5} width={w} height={h * 0.15} fill={acc} opacity="0.95" />}
        {livery === 'double' && (
          <>
            <rect x={x} y={y + h * 0.44} width={w} height={h * 0.07} fill={acc} />
            <rect x={x} y={y + h * 0.6} width={w} height={h * 0.07} fill={acc} />
          </>
        )}
        {livery === 'chevron' &&
          Array.from({ length: 6 }, (_, i) => {
            const cx = x + w * 0.08 + i * w * 0.075
            return <polyline key={i} points={`${cx},${y + h * 0.4} ${cx + h * 0.15},${y + h * 0.58} ${cx},${y + h * 0.76}`} fill="none" stroke={acc} strokeWidth={h * 0.07} strokeLinejoin="round" />
          })}
        {livery === 'zigzag' && (
          <polyline
            points={Array.from({ length: 13 }, (_, i) => `${x + (w / 12) * i},${y + h * (i % 2 ? 0.44 : 0.68)}`).join(' ')}
            fill="none" stroke={acc} strokeWidth={h * 0.075} strokeLinejoin="round"
          />
        )}
      </g>
      <path d={d} fill="none" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
    </g>
  )
}

const Win = ({ d, x, y, w, h, rx = 4 }) =>
  d ? <path d={d} fill={GLASS} stroke={GLASS_EDGE} strokeWidth="2" strokeLinejoin="round" /> : <rect x={x} y={y} width={w} height={h} rx={rx} fill={GLASS} stroke={GLASS_EDGE} strokeWidth="2" />

function Wheel({ x, y = -14, r = 15, still }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="#1b2430" stroke={OUT} strokeWidth="2.5" />
      <circle r={r * 0.56} fill="#d4dce6" stroke="#8da0b6" strokeWidth="1.5" />
      <g>
        {[0, 60, 120].map((a) => <line key={a} x1={-r * 0.5} x2={r * 0.5} y1="0" y2="0" transform={`rotate(${a})`} stroke="#8da0b6" strokeWidth="2.2" />)}
        {!still && <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.8s" repeatCount="indefinite" />}
      </g>
      <circle r={r * 0.15} fill="#8da0b6" />
    </g>
  )
}

const Arch = ({ x, r, y = -14 }) => <path d={`M${x - r - 4} ${y} A${r + 4} ${r + 4} 0 0 1 ${x + r + 4} ${y}Z`} fill="#0f1822" />
const Shadow = ({ rx = 80, y = 2 }) => <ellipse cx="0" cy={y} rx={rx} ry="7" fill="#000" opacity="0.22" />

function Roof({ kind, x, y, still }) {
  if (kind === 'cargo')
    return (
      <g transform={`translate(${x} ${y})`}>
        <rect x="-24" y="-20" width="48" height="20" rx="3" fill="#f59e0b" stroke={OUT} strokeWidth="2.5" />
        <line x1="0" y1="-20" x2="0" y2="0" stroke={OUT} strokeWidth="2" /><rect x="-24" y="-20" width="48" height="6" rx="3" fill="#fff" opacity="0.25" />
      </g>
    )
  if (kind === 'antenna')
    return (
      <g transform={`translate(${x} ${y})`}>
        <line x1="0" y1="0" x2="0" y2="-30" stroke={OUT} strokeWidth="3.5" strokeLinecap="round" />
        <circle cy="-33" r="5" fill="#F28C28" stroke={OUT} strokeWidth="2" />
        <path d="M-10 -40 a14 14 0 0 1 20 0 M-16 -46 a22 22 0 0 1 32 0" fill="none" stroke="#F28C28" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    )
  if (kind === 'beacon')
    return (
      <g transform={`translate(${x} ${y})`}>
        <rect x="-9" y="-5" width="18" height="5" rx="2" fill="#475569" stroke={OUT} strokeWidth="2" />
        <path d="M-7 -5 Q-7 -19 0 -19 Q7 -19 7 -5Z" fill="#D64045" stroke={OUT} strokeWidth="2">{!still && <animate attributeName="opacity" values="1;0.35;1" dur="0.9s" repeatCount="indefinite" />}</path>
      </g>
    )
  return null
}

const Lights = ({ fx, y = -26 }) => (
  <>
    <circle cx={fx} cy={y} r="5" fill="#fff7c2" stroke={OUT} strokeWidth="1.5" />
    <rect x={-fx - 4} y={y - 4} width="6" height="9" rx="2" fill="#D64045" stroke={OUT} strokeWidth="1.5" />
  </>
)

// ---- families -------------------------------------------------------------------------------------------------
function Car({ st, colour, livery, top, uid, still }) {
  const defs = [
    { d: 'M-75 -12 L-75 -32 Q-74 -42 -62 -44 L-44 -46 Q-30 -64 -6 -64 L30 -64 Q50 -62 60 -44 L70 -42 Q76 -40 76 -28 L76 -12Z', box: [-75, -64, 151, 52], wheels: [-44, 46], r: 15, roof: [0, -64] },
    { d: 'M-120 -14 L-120 -76 Q-120 -84 -110 -84 L104 -84 Q120 -84 122 -68 L122 -14Z', box: [-120, -84, 242, 70], wheels: [-80, 76], r: 17, roof: [-20, -84] },
    { d: 'M-88 -12 L-88 -26 Q-84 -32 -60 -34 L-24 -38 Q-2 -54 30 -50 L52 -44 Q90 -38 94 -26 L94 -12Z', box: [-88, -52, 182, 40], wheels: [-54, 58], r: 14, roof: [8, -50] },
  ][st]
  return (
    <g>
      <Shadow rx={st === 1 ? 128 : 92} />
      <Shell d={defs.d} box={defs.box} colour={colour} livery={livery} uid={uid} name="car" />
      {st === 0 && <><Win d="M-38 -47 Q-26 -58 -8 -58 L10 -58 L10 -47Z" /><Win d="M17 -58 L30 -58 Q44 -56 52 -47 L17 -47Z" /></>}
      {st === 1 && (
        <>
          {Array.from({ length: 6 }, (_, i) => <Win key={i} x={-106 + i * 30} y={-72} w={23} h={24} />)}
          <rect x="82" y="-70" width="26" height="54" rx="4" fill={shade(colour, -0.25)} stroke={OUT} strokeWidth="2" /><Win x={86} y={-66} w={18} h={26} />
        </>
      )}
      {st === 2 && <><Win d="M-14 -39 Q2 -50 26 -48 L44 -43 L-6 -39Z" /><path d="M-90 -34 L-102 -46 L-76 -46 L-72 -35Z" fill={shade(colour, -0.3)} stroke={OUT} strokeWidth="2.5" /></>}
      {defs.wheels.map((x) => <Arch key={x} x={x} r={defs.r} />)}
      {defs.wheels.map((x) => <Wheel key={x} x={x} r={defs.r} still={still} />)}
      <Lights fx={defs.box[0] + defs.box[2] - 6} y={st === 1 ? -30 : -24} />
      <Roof kind={top} x={defs.roof[0]} y={defs.roof[1]} still={still} />
    </g>
  )
}

function Train({ st, colour, livery, top, uid, still }) {
  const defs = [
    { d: 'M-70 -22 L-70 -62 Q-70 -72 -58 -72 L58 -72 Q70 -72 70 -62 L70 -22Z', box: [-70, -72, 140, 50], wheels: [-44, 44], roof: [10, -72] },
    { d: 'M-130 -22 L-130 -66 Q-130 -74 -120 -74 L120 -74 Q130 -74 130 -66 L130 -22Z', box: [-130, -74, 260, 52], wheels: [-92, -64, 64, 92], roof: [0, -74] },
    { d: 'M-130 -22 L-130 -58 Q-130 -66 -118 -66 L30 -66 Q100 -66 138 -36 L138 -22Z', box: [-130, -66, 268, 44], wheels: [-96, -60, 60, 100], roof: [-30, -66] },
  ][st]
  return (
    <g>
      <Shadow rx={st === 0 ? 90 : 150} y={4} />
      <rect x={defs.box[0] + 10} y="-24" width={defs.box[2] - 20} height="14" rx="3" fill="#2a3542" stroke={OUT} strokeWidth="2" />
      <Shell d={defs.d} box={defs.box} colour={colour} livery={livery} uid={uid} name="train" />
      {st === 0 && Array.from({ length: 4 }, (_, i) => <Win key={i} x={-54 + i * 28} y={-62} w={22} h={22} />)}
      {st === 1 && Array.from({ length: 8 }, (_, i) => <Win key={i} x={-118 + i * 31} y={-64} w={23} h={22} />)}
      {st === 2 && (
        <>
          {Array.from({ length: 5 }, (_, i) => <Win key={i} x={-118 + i * 28} y={-58} w={21} h={18} />)}
          <Win d="M32 -58 L66 -58 Q92 -52 112 -38 L32 -38Z" />
        </>
      )}
      {defs.wheels.map((x) => (
        <g key={x} transform={`translate(${x} -11)`}>
          <rect x="-13" y="-7" width="26" height="12" rx="3" fill="#2a3542" stroke={OUT} strokeWidth="2" />
          <circle r="8.5" fill="#1b2430" stroke={OUT} strokeWidth="2" /><circle r="4" fill="#cdd6e1" />
        </g>
      ))}
      <rect x={defs.box[0] + defs.box[2] - 4} y="-30" width="12" height="7" rx="2" fill="#5b6a7c" stroke={OUT} strokeWidth="1.5" />
      <Lights fx={defs.box[0] + defs.box[2] - 6} y={-34} />
      {top === 'plain' && st !== 2 && (
        <g transform={`translate(${defs.roof[0]} ${defs.roof[1]})`} stroke={OUT} strokeWidth="2.5" fill="none" strokeLinecap="round"><path d="M-14 0 L0 -16 L14 0 M-6 -16 H6" /></g>
      )}
      {top !== 'plain' && <Roof kind={top} x={defs.roof[0]} y={defs.roof[1]} still={still} />}
    </g>
  )
}

function Plane({ st, colour, livery, top, uid, still }) {
  const defs = [
    { d: 'M-72 2 C-72 -12 -52 -20 -24 -20 L34 -20 C56 -20 70 -10 74 2 C70 12 56 16 34 16 L-24 16 C-52 16 -72 14 -72 2Z', box: [-72, -20, 146, 36], roof: [0, -20] },
    { d: 'M-130 0 C-130 -22 -90 -27 -40 -27 L92 -27 C128 -27 152 -13 162 0 C152 13 128 23 92 23 L-40 23 C-90 23 -130 21 -130 0Z', box: [-130, -27, 292, 50], roof: [0, -27] },
    { d: 'M-92 2 L-74 -12 L58 -12 Q104 -8 126 2 Q104 12 58 14 L-74 14Z', box: [-92, -12, 218, 26], roof: [-10, -12] },
  ][st]
  const sc = st === 1 ? 0.78 : 1
  return (
    <g>
      <g transform="translate(0 70)"><ellipse rx={80 * (st === 1 ? 1.4 : 1)} ry="6" fill="#000" opacity="0.2" /></g>
      <g transform={`translate(0 -62) scale(${sc})`}>
        <g>
          {!still && <animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0" dur="3s" repeatCount="indefinite" />}
          {st === 0 && <><polygon points="-66,-12 -86,-48 -62,-48 -38,-16" fill={shade(colour, -0.3)} stroke={OUT} strokeWidth="2.5" /><polygon points="-6,6 32,6 0,44 -36,44" fill={shade(colour, -0.2)} stroke={OUT} strokeWidth="2.5" /></>}
          {st === 1 && <><polygon points="-120,-20 -158,-76 -116,-76 -70,-24" fill={shade(colour, -0.3)} stroke={OUT} strokeWidth="2.5" /><polygon points="22,10 64,10 -6,60 -50,60" fill={shade(colour, -0.15)} stroke={OUT} strokeWidth="2.5" /><ellipse cx="14" cy="38" rx="26" ry="10" fill="#c3cedc" stroke={OUT} strokeWidth="2" /></>}
          {st === 2 && <><polygon points="-84,-10 -104,-46 -70,-46 -50,-12" fill={shade(colour, -0.3)} stroke={OUT} strokeWidth="2.5" /><polygon points="-6,8 40,8 -52,52 -76,52" fill={shade(colour, -0.2)} stroke={OUT} strokeWidth="2.5" /></>}
          <Shell d={defs.d} box={defs.box} colour={colour} livery={livery} uid={uid} name="plane" />
          {st === 0 && <><Win d="M18 -17 L44 -15 Q56 -11 58 -3 L20 -3Z" /><circle cx="76" cy="0" r="5" fill="#cfd8e3" stroke={OUT} strokeWidth="2" /><line x1="80" x2="80" y1="-26" y2="26" stroke="#33414f" strokeWidth="4" strokeLinecap="round">{!still && <><animate attributeName="y1" values="-26;26;-26" dur="0.16s" repeatCount="indefinite" /><animate attributeName="y2" values="26;-26;26" dur="0.16s" repeatCount="indefinite" /></>}</line></>}
          {st === 1 && <>{Array.from({ length: 11 }, (_, i) => <circle key={i} cx={-96 + i * 19} cy="-9" r="4" fill={GLASS} stroke={GLASS_EDGE} strokeWidth="1.5" />)}<path d="M118 -17 L148 -8 L120 -8Z" fill="#1b3a57" /></>}
          {st === 2 && <><Win d="M44 -10 L88 -6 Q100 -3 102 0 L48 0Z" /><polygon points="-92,-4 -128,2 -92,8" fill="#ffb347">{!still && <animate attributeName="points" values="-92,-4 -128,2 -92,8;-92,-4 -112,2 -92,8;-92,-4 -128,2 -92,8" dur="0.25s" repeatCount="indefinite" />}</polygon></>}
          <Roof kind={top} x={defs.roof[0]} y={defs.roof[1]} still={still} />
        </g>
      </g>
    </g>
  )
}

function Heli({ st, colour, livery, top, uid, still }) {
  const defs = [
    { d: 'M-46 4 A46 30 0 0 1 46 4 A46 30 0 0 1 -46 4Z', box: [-46, -26, 92, 60], boom: 112, win: 'M-6 -16 Q22 -22 38 -4 L-6 -4Z' },
    { d: 'M-70 8 Q-70 -26 -40 -30 L60 -30 Q84 -28 84 -2 L84 12 Q84 20 70 20 L-56 20 Q-70 20 -70 8Z', box: [-70, -30, 154, 50], boom: 150, win: 'M52 -26 L74 -22 Q82 -16 82 -6 L52 -6Z' },
    { d: 'M-60 10 Q-58 -20 -20 -26 L40 -26 Q96 -20 110 4 Q96 16 40 20 L-50 20 Q-60 20 -60 10Z', box: [-60, -26, 170, 46], boom: 130, win: 'M44 -22 Q86 -16 100 0 L44 -4Z' },
  ][st]
  return (
    <g>
      <g transform="translate(0 70)"><ellipse rx="70" ry="6" fill="#000" opacity="0.2" /></g>
      <g transform="translate(0 -56)">
        <g>
          {!still && <animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0" dur="2.4s" repeatCount="indefinite" />}
          <polygon points={`30,-8 ${defs.boom},-14 ${defs.boom},-2 30,10`} fill={shade(colour, -0.2)} stroke={OUT} strokeWidth="2.5" />
          <polygon points={`${defs.boom - 10},-12 ${defs.boom + 4},-40 ${defs.boom + 12},-10`} fill={shade(colour, -0.1)} stroke={OUT} strokeWidth="2.5" />
          <line x1="-34" y1="28" x2="40" y2="28" stroke={OUT} strokeWidth="4" strokeLinecap="round" /><line x1="-20" y1="18" x2="-20" y2="28" stroke={OUT} strokeWidth="3" /><line x1="24" y1="18" x2="24" y2="28" stroke={OUT} strokeWidth="3" />
          <Shell d={defs.d} box={defs.box} colour={colour} livery={livery} uid={uid} name="heli" />
          <Win d={defs.win} />
          <line x1="0" y1="-26" x2="0" y2="-38" stroke={OUT} strokeWidth="5" />
          <ellipse cy="-38" rx="104" ry="8" fill="#fff" opacity="0.28" />
          <line y1="-38" y2="-38" stroke="#33414f" strokeWidth="5" strokeLinecap="round" x1="-100" x2="100">{!still && <><animate attributeName="x1" values="-100;100;-100" dur="0.4s" repeatCount="indefinite" /><animate attributeName="x2" values="100;-100;100" dur="0.4s" repeatCount="indefinite" /></>}</line>
          <circle cx={defs.boom + 4} cy="-8" r="8" fill="#fff" opacity="0.4">{!still && <animate attributeName="r" values="8;3;8" dur="0.22s" repeatCount="indefinite" />}</circle>
          <Roof kind={top} x={-20} y={-38} still={still} />
        </g>
      </g>
    </g>
  )
}

function Boat({ st, colour, livery, top, uid, still }) {
  const defs = [
    { d: 'M-72 -26 L74 -26 L58 8 L-58 8Z', box: [-72, -26, 146, 34], cab: [-26, -62, 60, 36], roof: [4, -62] },
    { d: 'M-130 -30 L124 -30 L98 10 L-108 10Z', box: [-130, -30, 254, 40], cab: [-86, -70, 160, 40], roof: [-10, -70] },
    { d: 'M-82 -20 L72 -20 Q106 -20 120 -34 L96 10 L-74 10Z', box: [-82, -34, 202, 44], cab: [-20, -48, 50, 28], roof: [8, -48] },
  ][st]
  return (
    <g>
      <rect x={defs.cab[0]} y={defs.cab[1]} width={defs.cab[2]} height={defs.cab[3] + 6} rx="6" fill="#f1f5f9" stroke={OUT} strokeWidth="2.5" />
      {st === 1 && <rect x={-60} y={-98} width="108" height="30" rx="6" fill="#f1f5f9" stroke={OUT} strokeWidth="2.5" />}
      {st === 0 && <><rect x="-50" y="-76" width="14" height="22" fill="#D64045" stroke={OUT} strokeWidth="2.5" /><rect x="-50" y="-80" width="14" height="6" fill="#263238" stroke={OUT} strokeWidth="2" /></>}
      {st === 1 && <><rect x="-30" y="-122" width="18" height="26" fill="#D64045" stroke={OUT} strokeWidth="2.5" /><rect x="-30" y="-126" width="18" height="6" fill="#263238" stroke={OUT} strokeWidth="2" /></>}
      {Array.from({ length: st === 1 ? 6 : 3 }, (_, i) => <Win key={i} x={defs.cab[0] + 8 + i * (st === 1 ? 25 : 17)} y={defs.cab[1] + 8} w={st === 1 ? 18 : 12} h={14} rx={3} />)}
      {st === 1 && Array.from({ length: 4 }, (_, i) => <Win key={i} x={-50 + i * 25} y={-92} w={18} h={14} rx={3} />)}
      <Shell d={defs.d} box={defs.box} colour={colour} livery={livery} uid={uid} name="boat" />
      <Roof kind={top} x={defs.roof[0]} y={defs.roof[1]} still={still} />
    </g>
  )
}

function Rocket({ st, colour, livery, top, uid, still }) {
  const defs = [
    { d: 'M-30 0 L-30 -60 Q-30 -114 0 -122 Q30 -114 30 -60 L30 0Z', box: [-30, -122, 60, 122], fin: 38 },
    { d: 'M-26 0 L-26 -118 Q-26 -154 0 -172 Q26 -154 26 -118 L26 0Z', box: [-26, -172, 52, 172], fin: 54 },
    { d: 'M-22 0 L-22 -108 Q-22 -146 0 -164 Q22 -146 22 -108 L22 0Z', box: [-22, -164, 44, 164], fin: 70 },
  ][st]
  return (
    <g transform="scale(0.88)">
      <Shadow rx={60} y={4} />
      <polygon points={`-${defs.box[2] / 2},-34 -${defs.fin},4 -${defs.box[2] / 2},4`} fill={shade(colour, -0.3)} stroke={OUT} strokeWidth="2.5" />
      <polygon points={`${defs.box[2] / 2},-34 ${defs.fin},4 ${defs.box[2] / 2},4`} fill={shade(colour, -0.3)} stroke={OUT} strokeWidth="2.5" />
      {st === 2 && <><polygon points="-22,-10 -66,6 -22,-66" fill={shade(colour, -0.2)} stroke={OUT} strokeWidth="2.5" /><polygon points="22,-10 66,6 22,-66" fill={shade(colour, -0.2)} stroke={OUT} strokeWidth="2.5" /></>}
      <Shell d={defs.d} box={defs.box} colour={colour} livery={livery} uid={uid} name="rocket" />
      <circle cy={defs.box[1] + 52} r="11" fill={GLASS} stroke={GLASS_EDGE} strokeWidth="3" />
      <circle cy={defs.box[1] + 52} r="11" fill="none" stroke={OUT} strokeWidth="2.5" />
      {st !== 1 && <circle cy={defs.box[1] + 82} r="7" fill={GLASS} stroke={OUT} strokeWidth="2.5" />}
      <polygon points="-16,0 0,46 16,0" fill="#ffb347">{!still && <animate attributeName="points" values="-16,0 0,46 16,0;-14,0 0,60 14,0;-16,0 0,46 16,0" dur="0.18s" repeatCount="indefinite" />}</polygon>
      <polygon points="-8,0 0,26 8,0" fill="#fff3b0" />
      <rect x="-44" y="0" width="88" height="8" rx="3" fill="#59687a" stroke={OUT} strokeWidth="2" />
      <Roof kind={top} x={0} y={defs.box[1] + 4} still={still} />
    </g>
  )
}

function CableCar({ st, colour, livery, top, uid, still }) {
  const defs = [
    { d: 'M-34 -16 L-34 -62 Q-34 -92 0 -92 Q34 -92 34 -62 L34 -16 Q34 -6 24 -6 L-24 -6 Q-34 -6 -34 -16Z', box: [-34, -92, 68, 86], roof: [0, -92] },
    { d: 'M-70 -10 L-70 -70 Q-70 -80 -60 -80 L60 -80 Q70 -80 70 -70 L70 -10 Q70 0 60 0 L-60 0 Q-70 0 -70 -10Z', box: [-70, -80, 140, 80], roof: [0, -80] },
    { d: 'M-56 -8 L-56 -52 Q-56 -76 -20 -78 L30 -78 Q64 -70 64 -40 L64 -8 Q64 0 54 0 L-46 0 Q-56 0 -56 -8Z', box: [-56, -78, 120, 78], roof: [0, -78] },
  ][st]
  return (
    <g>
      <line x1="-300" y1="-152" x2="300" y2="-152" stroke="#2a3542" strokeWidth="4" />
      <g>
        {!still && <animateTransform attributeName="transform" type="rotate" values="-2.5 0 -150;2.5 0 -150;-2.5 0 -150" dur="3.4s" repeatCount="indefinite" />}
        <line x1="0" y1="-146" x2="0" y2={defs.roof[1] - 12} stroke="#2a3542" strokeWidth="5" />
        <rect x="-12" y="-160" width="24" height="12" rx="4" fill="#5b6a7c" stroke={OUT} strokeWidth="2.5" />
        <g transform="translate(0 -12)">
          <Shell d={defs.d} box={defs.box} colour={colour} livery={livery} uid={uid} name="cable" />
          {st === 0 && Array.from({ length: 2 }, (_, i) => <Win key={i} x={-24 + i * 26} y={-76} w={20} h={26} rx={8} />)}
          {st === 1 && Array.from({ length: 5 }, (_, i) => <Win key={i} x={-62 + i * 26} y={-70} w={20} h={28} />)}
          {st === 2 && Array.from({ length: 4 }, (_, i) => <Win key={i} x={-46 + i * 26} y={-68} w={20} h={26} />)}
          <Roof kind={top} x={defs.roof[0]} y={defs.roof[1]} still={still} />
        </g>
      </g>
    </g>
  )
}

function Hover({ st, colour, livery, top, uid, still }) {
  const defs = [
    { d: 'M-60 0 Q-60 -26 0 -30 Q60 -26 60 0 Q60 14 40 16 L-40 16 Q-60 14 -60 0Z', box: [-60, -30, 120, 46], roof: [0, -30] },
    { d: 'M-110 4 L-110 -52 Q-110 -62 -100 -62 L96 -62 Q110 -62 112 -48 L112 4 Q112 12 100 12 L-98 12 Q-110 12 -110 4Z', box: [-110, -62, 222, 74], roof: [-10, -62] },
    { d: 'M-84 6 Q-80 -8 -50 -12 L-16 -16 Q10 -34 40 -30 L62 -22 Q96 -16 98 -2 L98 8 Q98 14 88 14 L-76 14 Q-86 14 -84 6Z', box: [-84, -34, 184, 48], roof: [6, -32] },
  ][st]
  return (
    <g>
      <Shadow rx={st === 1 ? 110 : 70} y={4} />
      <g transform="translate(0 -34)">
        <g>
          {!still && <animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur="2s" repeatCount="indefinite" />}
          <ellipse cy="26" rx={st === 1 ? 100 : 60} ry="10" fill="#00BBD4" opacity="0.55">{!still && <animate attributeName="opacity" values="0.35;0.75;0.35" dur="1s" repeatCount="indefinite" />}</ellipse>
          <ellipse cy="22" rx={st === 1 ? 74 : 40} ry="6" fill="#bff6ff" opacity="0.8" />
          <Shell d={defs.d} box={defs.box} colour={colour} livery={livery} uid={uid} name="hover" />
          {st === 0 && <path d="M-34 -12 Q0 -42 34 -12Z" fill={GLASS} stroke={GLASS_EDGE} strokeWidth="2" />}
          {st === 1 && Array.from({ length: 7 }, (_, i) => <Win key={i} x={-98 + i * 29} y={-50} w={22} h={22} />)}
          {st === 2 && <Win d="M-6 -16 Q14 -28 36 -26 L56 -19 L-4 -15Z" />}
          <Roof kind={top} x={defs.roof[0]} y={defs.roof[1]} still={still} />
        </g>
      </g>
    </g>
  )
}

const FAMILIES = { wheels: Car, railwheels: Train, wings: Plane, rotor: Heli, hull: Boat, rocket: Rocket, hook: CableCar, hover: Hover }
// How much to scale each family so it fills its picture: [compact, long, sleek].
const FIT = { wheels: [1.5, 1, 1.4], railwheels: [1.45, 1, 1], wings: [1.25, 1, 1.15], rotor: [1.2, 1, 1.1], hull: [1.35, 0.95, 1.2], rocket: [1, 1, 1], hook: [1, 1, 1], hover: [1.5, 1, 1.3] }
const WORLD = { wheels: 'road', railwheels: 'rail', wings: 'sky', rotor: 'sky', hull: 'water', rocket: 'space', hook: 'mountain', hover: 'future' }

// ---- worlds ---------------------------------------------------------------------------------------------------------
function Cloud({ x, y, s = 1, dur = 90, delay = 0 }) {
  return (
    <g opacity="0.95">
      <g fill="#fff" transform={`translate(${x} ${y}) scale(${s})`}>
        <ellipse cx="0" cy="0" rx="26" ry="11" /><ellipse cx="18" cy="-6" rx="18" ry="12" /><ellipse cx="-16" cy="-4" rx="14" ry="9" />
        <animateTransform attributeName="transform" type="translate" additive="sum" from="-80 0" to="520 0" dur={`${dur}s`} begin={`-${delay}s`} repeatCount="indefinite" />
      </g>
    </g>
  )
}

function World({ kind, uid }) {
  const g = (n) => `${n}-${uid}`
  const sky = (
    <>
      <defs><linearGradient id={g('sky')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2f8fdc" /><stop offset="0.7" stopColor="#9ed8f7" /><stop offset="1" stopColor="#e9f8ff" /></linearGradient></defs>
      <rect width="400" height="220" fill={`url(#${g('sky')})`} />
      <circle cx="338" cy="44" r="22" fill="#ffe28a" /><circle cx="338" cy="44" r="34" fill="#ffe28a" opacity="0.28" />
      <Cloud x={60} y={52} s={1.1} dur={110} delay={30} /><Cloud x={0} y={96} s={0.8} dur={150} delay={90} /><Cloud x={0} y={30} s={0.7} dur={130} delay={10} />
    </>
  )
  const hills = (
    <>
      <path d="M0 160 L60 118 L100 144 L156 100 L210 150 L260 124 L330 160Z M240 160 L300 112 L350 150 L400 120 L400 170 L0 170Z" fill="#b3c1e6" />
      <path d="M0 176 C80 146 160 150 240 168 S360 150 400 166 L400 220 L0 220Z" fill="#79c08e" />
    </>
  )
  if (kind === 'road')
    return (
      <>
        {sky}{hills}
        {[40, 120, 330].map((x, i) => <g key={x} transform={`translate(${x} ${150 + (i % 2) * 6})`}><rect x="-3" y="0" width="6" height="16" fill="#7a5230" /><circle cy="-6" r="13" fill="#3f9a5a" /></g>)}
        <rect y="168" width="400" height="52" fill="#3a444e" /><rect y="166" width="400" height="4" fill="#5b6877" />
        <line x1="-40" y1="196" x2="440" y2="196" stroke="#fff" strokeWidth="4" strokeDasharray="30 22"><animate attributeName="stroke-dashoffset" from="0" to="-52" dur="0.9s" repeatCount="indefinite" /></line>
      </>
    )
  if (kind === 'rail')
    return (
      <>
        {sky}{hills}
        {[30, 150, 270, 390].map((x) => <g key={x}><rect x={x - 2} y="94" width="4" height="78" fill="#4a5662" /><line x1={x - 12} y1="100" x2={x + 12} y2="100" stroke="#4a5662" strokeWidth="3" /></g>)}
        <path d="M-10 102 L410 102" stroke="#4a5662" strokeWidth="1.8" fill="none" />
        <rect y="170" width="400" height="50" fill="#8a7860" />
        {Array.from({ length: 22 }, (_, i) => <rect key={i} x={-6 + i * 20} y="171" width="12" height="9" fill="#6b4a2b" />)}
        <rect y="170" width="400" height="4" fill="#9aa8b8" /><rect y="179" width="400" height="3" fill="#7b8998" />
      </>
    )
  if (kind === 'sky')
    return (
      <>
        {sky}{hills}
        <rect y="188" width="400" height="32" fill="#4fa06a" /><path d="M0 188 H400" stroke="#3b8a55" strokeWidth="3" />
      </>
    )
  if (kind === 'water')
    return (
      <>
        {sky}
        <path d="M0 150 L80 112 L140 140 L210 104 L290 150 L400 128 L400 175 L0 175Z" fill="#b3c1e6" />
        <defs><linearGradient id={g('sea')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#38bdf8" /><stop offset="1" stopColor="#0b5a8a" /></linearGradient></defs>
        <rect y="168" width="400" height="52" fill={`url(#${g('sea')})`} />
      </>
    )
  if (kind === 'space')
    return (
      <>
        <defs><linearGradient id={g('night')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#070a2e" /><stop offset="1" stopColor="#2a2f78" /></linearGradient></defs>
        <rect width="400" height="220" fill={`url(#${g('night')})`} />
        {Array.from({ length: 34 }, (_, i) => <circle key={i} cx={(i * 97) % 400} cy={(i * 53) % 150} r={i % 6 === 0 ? 1.8 : 1} fill="#fff" opacity="0.85">{i % 3 === 0 && <animate attributeName="opacity" values="0.9;0.2;0.9" dur={`${2 + (i % 4)}s`} repeatCount="indefinite" />}</circle>)}
        <circle cx="330" cy="62" r="34" fill="#4246A3" /><ellipse cx="330" cy="62" rx="54" ry="10" fill="none" stroke="#c7d2fe" strokeWidth="3" opacity="0.7" /><circle cx="318" cy="52" r="34" fill="#070a2e" opacity="0.25" />
        <circle cx="60" cy="48" r="14" fill="#dfe6f3" /><circle cx="55" cy="44" r="3" fill="#b8c2d6" /><circle cx="66" cy="54" r="4" fill="#b8c2d6" />
        <rect y="170" width="400" height="50" fill="#4a5568" /><rect y="168" width="400" height="4" fill="#6b7a90" />
        <g stroke="#7e8ea6" strokeWidth="3"><line x1="40" y1="170" x2="40" y2="60" /><line x1="62" y1="170" x2="62" y2="60" />{[70, 90, 110, 130, 150].map((y) => <line key={y} x1="40" y1={y} x2="62" y2={y + 12} />)}<line x1="62" y1="96" x2="150" y2="96" strokeWidth="4" /></g>
      </>
    )
  if (kind === 'mountain')
    return (
      <>
        {sky}
        <path d="M0 176 L50 96 L88 136 L150 62 L220 150 L270 100 L340 160 L400 110 L400 176Z" fill="#aab9de" />
        <path d="M150 62 L132 88 L146 82 L156 94 L170 80Z M50 96 L38 116 L48 110 L56 120 L66 108Z M270 100 L256 122 L268 116 L276 126 L288 114Z" fill="#fff" />
        <rect y="172" width="400" height="48" fill="#eef4fb" /><path d="M0 172 C80 160 160 166 240 172 S360 166 400 170 V176 H0Z" fill="#dbe7f5" />
        {[20, 70, 360, 392].map((x, i) => <polygon key={x} points={`${x},${176 - (i % 2) * 4} ${x - 12},${176 - (i % 2) * 4} ${x - 6},${150 - (i % 2) * 4}`} fill="#2f7a4d" />)}
        {[40, 360].map((x) => <g key={x}><rect x={x - 3} y="20" width="6" height="156" fill="#5b6a7c" /><line x1={x - 14} y1="26" x2={x + 14} y2="26" stroke="#5b6a7c" strokeWidth="5" /></g>)}
      </>
    )
  // future
  return (
    <>
      <defs><linearGradient id={g('dusk')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a1147" /><stop offset="0.6" stopColor="#4b2f99" /><stop offset="1" stopColor="#00bbd4" /></linearGradient></defs>
      <rect width="400" height="220" fill={`url(#${g('dusk')})`} />
      {[[20, 90, 34], [60, 60, 30], [100, 110, 28], [140, 70, 36], [250, 100, 32], [292, 56, 30], [330, 96, 34], [368, 74, 30]].map(([x, y, w], i) => (
        <g key={i}><rect x={x} y={y} width={w} height={170 - y} fill="#12123a" stroke="#00bbd4" strokeWidth="1.5" opacity="0.95" />{Array.from({ length: 5 }, (_, k) => <rect key={k} x={x + 5 + (k % 2) * 12} y={y + 8 + k * 12} width="6" height="4" fill={k % 3 ? '#7fe9ff' : '#ffd45e'} opacity="0.9" />)}</g>
      ))}
      <rect y="170" width="400" height="50" fill="#0e0c33" />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 50 - 40} y1="220" x2={190 + (i - 4) * 14} y2="170" stroke="#7057D9" strokeWidth="1.5" opacity="0.8" />)}
      {[180, 192, 206].map((y) => <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#00bbd4" strokeWidth="1.2" opacity="0.7" />)}
    </>
  )
}

// The water and its waves are drawn in front of boats, so the hull sits in the sea.
function Waves() {
  return (
    <g>
      {[0, 1].map((i) => (
        <path key={i} d="M-60 0 q15 -8 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 V60 H-60Z" fill={i ? '#0e6ea3' : '#1d94cf'} opacity={i ? 0.95 : 0.8} transform={`translate(0 ${176 + i * 16})`}>
          <animateTransform attributeName="transform" type="translate" additive="replace" values={`${i ? 0 : -30} ${176 + i * 16};${i ? -30 : 0} ${176 + i * 16};${i ? 0 : -30} ${176 + i * 16}`} dur={`${3 + i}s`} repeatCount="indefinite" />
        </path>
      ))}
    </g>
  )
}

// ---- the picture --------------------------------------------------------------------------------------------------
function Barrier({ x }) {
  return (
    <g transform={`translate(${x} 170)`}>
      <rect x="-6" y="-36" width="6" height="36" fill="#cfd6df" stroke={OUT} strokeWidth="2" /><rect x="40" y="-36" width="6" height="36" fill="#cfd6df" stroke={OUT} strokeWidth="2" />
      <rect x="-8" y="-34" width="56" height="12" fill="#fff" stroke={OUT} strokeWidth="2" />
      {[0, 14, 28, 42].map((o) => <polygon key={o} points={`${o - 6},-34 ${o + 4},-34 ${o - 2},-22 ${o - 12},-22`} fill="#D64045" />)}
    </g>
  )
}

const Flag = ({ x }) => (
  <g transform={`translate(${x} 170)`}>
    <rect x="-2" y="-70" width="4" height="70" fill="#cfd6df" stroke={OUT} strokeWidth="1.5" />
    <g>{[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={2 + c * 9} y={-70 + r * 8} width="9" height="8" fill={(r + c) % 2 ? '#fff' : '#0b1626'} />))}</g>
  </g>
)

// drive = { rating: 'great' | 'ok' | 'poor' } plays a short test drive. Everything else is a still, living picture.
export default function VehicleArt({ design, bare = false, drive = null, className = '' }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const { body = 'pod', mover = 'wheels', top = 'plain', colour = '#1D9BF0', livery = 'stripe', size = 1 } = design
  const st = Math.max(0, bodies.findIndex((b) => b.id === body))
  const Family = FAMILIES[mover] || Car
  const world = WORLD[mover] || 'road'
  const vertical = mover === 'rocket'
  const fit = (FIT[mover] || [1, 1, 1])[st]
  const vehicle = <Family st={st} colour={colour} livery={livery} top={top === 'windows' || top === 'none' ? 'plain' : top} uid={uid} still={bare} />

  const [step, setStep] = useState(0)
  useEffect(() => {
    setStep(0)
    if (!drive) return
    const t = [setTimeout(() => setStep(1), 80), setTimeout(() => setStep(2), drive.rating === 'ok' ? 2300 : 1900)]
    return () => t.forEach(clearTimeout)
  }, [drive])

  if (bare) {
    return (
      <svg viewBox="-170 -205 340 235" className={className} role="img" aria-label={`${design.name || 'Vehicle'} design`}>
        <g transform={`scale(${size * fit})`}>{vehicle}</g>
      </svg>
    )
  }

  const rating = drive?.rating
  const dx = !drive ? 0 : { great: [0, 190, 190], ok: [0, 70, 190], poor: [0, 56, 56] }[rating][step]
  const dy = !drive || !vertical ? 0 : { great: [0, -330, -330], ok: [0, -80, -330], poor: [0, -10, 0] }[rating][step]
  const move = vertical ? `translate(0px, ${dy}px)` : `translate(${dx}px, 0px)`
  const dur = step === 0 ? 0 : rating === 'ok' && step === 1 ? 1.9 : rating === 'poor' ? 1.6 : 2.8
  const stuck = drive && rating === 'poor' && step === 2

  return (
    <svg viewBox="0 0 400 220" className={className} role="img" aria-label={`${design.name || 'Vehicle'}, drawn in its own world`}>
      <rect width="400" height="220" fill="#102A43" />
      <World kind={world} uid={uid} />
      {drive && !vertical && <Flag x={352} />}
      {drive && rating === 'poor' && !vertical && <Barrier x={262} />}
      <g transform={`translate(${drive && !vertical ? 56 : 200} 170)`}>
        <g transform={`scale(${size * fit})`}>
          <g style={{ transform: move, transition: `transform ${dur}s ${rating === 'ok' && step === 2 ? 'ease-in' : 'ease-in-out'}` }}>
            <g className={stuck ? 'animate-shake' : ''}>{vehicle}</g>
          </g>
        </g>
      </g>
      {world === 'water' && <Waves />}
      {stuck && (
        <g transform={`translate(${200 + (vertical ? 0 : -60)} 62)`}>
          <g className="animate-pop" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            <circle r="22" fill="#fff" stroke={OUT} strokeWidth="3" /><text textAnchor="middle" y="11" fontSize="30" fontWeight="800" fill="#D64045">?</text>
          </g>
        </g>
      )}
    </svg>
  )
}

export const bodyName = (id) => bodies.find((b) => b.id === id)?.name
