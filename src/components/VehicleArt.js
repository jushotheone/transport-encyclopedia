import { Star, Zap, Flame, Heart, Cat, Bird, Rocket, Gem } from 'lucide-react'
import { bodies } from '@/lib/studio'

const STICKERS = { star: Star, zap: Zap, flame: Flame, heart: Heart, cat: Cat, bird: Bird, rocket: Rocket, gem: Gem }

const OUT = '#0b1626'

// A vehicle drawn from a design's parts. Pure SVG, so it is crisp at any size.
export default function VehicleArt({ design, className = '' }) {
  const { body = 'pod', mover = 'wheels', top = 'windows', colour = '#1D9BF0', sticker = '', size = 1 } = design
  const stroke = { stroke: OUT, strokeWidth: 3, strokeLinejoin: 'round' }
  const shade = { fill: '#000', opacity: 0.22 }

  const bodyShape =
    body === 'long' ? (
      <rect x="25" y="42" width="150" height="36" rx="14" fill={colour} {...stroke} />
    ) : body === 'wedge' ? (
      <path d="M28 80 L46 42 L150 42 L180 62 L174 80 Z" fill={colour} {...stroke} />
    ) : (
      <rect x="50" y="35" width="100" height="45" rx="22" fill={colour} {...stroke} />
    )

  return (
    <svg viewBox="0 0 200 120" className={className} role="img" aria-label={`${design.name || 'Vehicle'} design`}>
      <g transform={`translate(100 60) scale(${size}) translate(-100 -60)`}>
        {mover === 'hook' && (
          <g>
            <line x1="0" y1="6" x2="200" y2="6" stroke="#94a3b8" strokeWidth="3" />
            <line x1="100" y1="6" x2="100" y2="36" stroke="#94a3b8" strokeWidth="3" />
            <rect x="90" y="22" width="20" height="10" rx="3" fill="#475569" {...stroke} />
          </g>
        )}
        {mover === 'wings' && (
          <g>
            <path d="M85 55 L55 18 L78 18 L125 55 Z" fill={colour} {...stroke} />
            <path d="M85 68 L50 102 L74 102 L125 68 Z" fill={colour} {...stroke} />
            <path d="M85 55 L55 18 L78 18 L125 55 Z" {...shade} />
            <path d="M40 48 L28 20 L54 40 Z" fill={colour} {...stroke} />
          </g>
        )}
        {mover === 'rocket' && (
          <g>
            <path d="M52 62 L14 48 L26 62 L14 76 Z" fill="#F28C28" stroke="#F59E0B" strokeWidth="2" />
            <path d="M62 80 L44 104 L88 80 Z" fill={colour} {...stroke} />
            <path d="M62 40 L44 16 L88 40 Z" fill={colour} {...stroke} />
          </g>
        )}
        {mover === 'hull' && (
          <g>
            <path d="M28 78 L172 78 L150 100 L52 100 Z" fill="#334155" {...stroke} />
            <path d="M8 108 q12 -8 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}
        {mover === 'rotor' && (
          <g>
            <line x1="100" y1="26" x2="100" y2="38" stroke={OUT} strokeWidth="5" />
            <line x1="30" y1="24" x2="170" y2="24" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
            <path d="M60 94 H150 M72 80 V94 M138 80 V94" stroke="#475569" strokeWidth="5" strokeLinecap="round" fill="none" />
          </g>
        )}

        {bodyShape}
        <path d={body === 'wedge' ? 'M28 80 L46 42 L150 42 L180 62 L174 80 Z' : body === 'long' ? 'M25 62 H175 V64 a14 14 0 0 1 -14 14 H39 a14 14 0 0 1 -14 -14 Z' : 'M50 62 H150 V58 a22 22 0 0 1 -22 22 H72 a22 22 0 0 1 -22 -22 Z'} {...shade} opacity="0.12" />

        {top === 'windows' ? (
          [78, 100, 122].map((x) => <circle key={x} cx={x} cy={body === 'long' ? 58 : 55} r="7" fill="#bae6fd" {...stroke} strokeWidth="2.5" />)
        ) : (
          <rect x="132" y="48" width="18" height="12" rx="3" fill="#bae6fd" {...stroke} strokeWidth="2.5" />
        )}
        {top === 'cargo' && (
          <g>
            <rect x="70" y="12" width="60" height="26" rx="4" fill="#f59e0b" {...stroke} />
            <line x1="100" y1="12" x2="100" y2="38" stroke={OUT} strokeWidth="2.5" />
          </g>
        )}
        {top === 'antenna' && (
          <g>
            <line x1="100" y1="36" x2="100" y2="10" stroke={OUT} strokeWidth="4" />
            <circle cx="100" cy="9" r="5" fill="#F28C28" {...stroke} strokeWidth="2.5" />
            <path d="M88 4 a16 16 0 0 1 24 0 M82 -1 a24 24 0 0 1 36 0" fill="none" stroke="#F28C28" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {sticker && STICKERS[sticker] && (() => {
          const Sticker = STICKERS[sticker]
          return <Sticker x="88" y={body === 'long' ? 62 : 63} width="24" height="24" color="#0b1626" strokeWidth="2.6" fill="#fff" fillOpacity="0.9" />
        })()}
        {sticker && !STICKERS[sticker] && (
          <text x="100" y={body === 'long' ? 73 : 74} fontSize="17" textAnchor="middle" dominantBaseline="central">{sticker}</text>
        )}

        {mover === 'wheels' && [66, 134].map((x) => (
          <g key={x}><circle cx={x} cy="82" r="14" fill="#1e293b" {...stroke} /><circle cx={x} cy="82" r="5" fill="#cbd5e1" /></g>
        ))}
        {mover === 'railwheels' && (
          <g>
            {[58, 88, 118, 148].map((x) => <circle key={x} cx={x} cy="86" r="9" fill="#1e293b" {...stroke} />)}
            <line x1="10" y1="96" x2="190" y2="96" stroke="#94a3b8" strokeWidth="4" />
            {[22, 52, 82, 112, 142, 172].map((x) => <rect key={x} x={x} y="98" width="8" height="6" fill="#a16207" />)}
          </g>
        )}
        {mover === 'hover' && (
          <g>
            {[70, 130].map((x) => <ellipse key={x} cx={x} cy="88" rx="20" ry="7" fill="#00BBD4" opacity="0.85" />)}
            {[70, 130].map((x) => <path key={x} d={`M${x - 14} 95 L${x - 20} 108 M${x} 95 V110 M${x + 14} 95 L${x + 20} 108`} stroke="#00BBD4" strokeWidth="3" strokeLinecap="round" opacity="0.6" />)}
          </g>
        )}
      </g>
    </svg>
  )
}

export const bodyName = (id) => bodies.find((b) => b.id === id)?.name
