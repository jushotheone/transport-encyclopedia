'use client'
// The airfield: a wide illustrated scene (1200 x 600). Everything that moves is SVG animation, so it stays crisp and light.
// Each tappable thing is a <Obj>; the hunt decides which ones are riddle answers and which are decoys.

function Obj({ id, label, onPick, pulse, found, badge, children, hit }) {
  const fire = () => onPick(id)
  return (
    <g
      data-obj={id}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={fire}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), fire())}
      className={`obj ${pulse === id ? 'obj-pop' : ''}`}
      style={{ cursor: 'pointer', outline: 'none' }}
    >
      <rect x={hit[0]} y={hit[1]} width={hit[2]} height={hit[3]} fill="transparent" />
      {children}
      {found && (
        <g transform={`translate(${badge[0]} ${badge[1]})`}>
          <circle r="17" fill="#22c55e" stroke="#fff" strokeWidth="4" />
          <path d="M-7 0 l5 6 l10 -12" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
    </g>
  )
}

const stripes = ['#F28C28', '#fff', '#F28C28', '#fff', '#F28C28']

export default function AirfieldScene({ onPick, found = [], pulse = null, celebrate = false }) {
  const f = (id) => found.includes(id)
  return (
    <svg viewBox="0 0 1200 600" className="block h-full w-auto select-none" style={{ aspectRatio: '2 / 1', minWidth: '100%' }} role="group" aria-label="An airfield with a control tower, a windsock, a helicopter, a hangar and planes">
      <defs>
        <linearGradient id="af-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f8fdc" />
          <stop offset="0.55" stopColor="#8fd0f5" />
          <stop offset="1" stopColor="#e9f8ff" />
        </linearGradient>
        <radialGradient id="af-sun"><stop offset="0" stopColor="#fff6c9" /><stop offset="0.5" stopColor="#ffe28a" stopOpacity="0.9" /><stop offset="1" stopColor="#ffe28a" stopOpacity="0" /></radialGradient>
        <linearGradient id="af-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#63b574" /><stop offset="1" stopColor="#3c8a52" /></linearGradient>
        <linearGradient id="af-trail" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0.85" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <clipPath id="af-balloon"><path d="M0 -70 C62 -70 72 -8 42 32 L-42 32 C-72 -8 -62 -70 0 -70Z" /></clipPath>
        <symbol id="af-cloud" viewBox="0 0 200 80">
          <g fill="#fff"><ellipse cx="60" cy="50" rx="50" ry="26" /><ellipse cx="112" cy="36" rx="48" ry="30" /><ellipse cx="152" cy="52" rx="40" ry="24" /><rect x="40" y="50" width="140" height="26" rx="13" /></g>
        </symbol>
      </defs>

      {/* sky, sun and drifting clouds */}
      <rect width="1200" height="460" fill="url(#af-sky)" />
      <g transform="translate(1000 110)">
        <circle r="120" fill="url(#af-sun)" />
        <g>
          {Array.from({ length: 12 }, (_, i) => <rect key={i} x="-3" y="-78" width="6" height="22" rx="3" fill="#ffd45e" opacity="0.8" transform={`rotate(${i * 30})`} />)}
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="60s" repeatCount="indefinite" />
        </g>
        <circle r="44" fill="#ffe28a" />
      </g>
      <g opacity="0.95"><use href="#af-cloud" x="0" y="70" width="220" height="88"><animateTransform attributeName="transform" type="translate" from="-300 0" to="1500 0" dur="150s" repeatCount="indefinite" /></use></g>
      <g opacity="0.8"><use href="#af-cloud" x="0" y="190" width="150" height="60"><animateTransform attributeName="transform" type="translate" from="-250 0" to="1450 0" dur="210s" begin="-90s" repeatCount="indefinite" /></use></g>
      <g opacity="0.9"><use href="#af-cloud" x="0" y="40" width="170" height="68"><animateTransform attributeName="transform" type="translate" from="-250 0" to="1450 0" dur="180s" begin="-40s" repeatCount="indefinite" /></use></g>

      {/* mountains and hills */}
      <path d="M0 450 L110 345 L170 392 L262 300 L360 412 L452 362 L562 450 L642 384 L722 332 L832 450 L922 374 L1022 322 L1122 402 L1200 366 L1200 455 Z" fill="#b3c1e6" />
      <path d="M262 300 L240 328 L254 322 L264 334 L280 320Z M722 332 L704 354 L716 349 L726 359 L740 347Z M1022 322 L1002 346 L1016 340 L1026 352 L1040 338Z" fill="#fff" opacity="0.92" />
      <path d="M0 462 C120 412 260 420 400 448 S660 418 820 446 S1080 420 1200 450 L1200 600 L0 600Z" fill="#79c08e" />
      <rect y="452" width="1200" height="148" fill="url(#af-grass)" />

      {/* drifting birds */}
      {[0, 1, 2].map((i) => (
        <path key={i} d="M0 0 q9 -9 18 0 q9 -9 18 0" stroke="#33506b" strokeWidth="3" fill="none" strokeLinecap="round" transform={`translate(${-40 - i * 26} ${210 + i * 14})`}>
          <animateTransform attributeName="transform" type="translate" from={`${-60 - i * 26} ${215 + i * 14}`} to={`${1260} ${180 + i * 18}`} dur={`${70 + i * 8}s`} begin={`-${20 + i * 12}s`} repeatCount="indefinite" />
        </path>
      ))}

      {/* hot air balloon (decoy) */}
      <Obj id="balloon" label="A hot air balloon" onPick={onPick} pulse={pulse} hit={[-80, -90, 160, 180]}>
        <g transform="translate(238 188)">
          <animateTransform attributeName="transform" type="translate" values="238 192;238 178;238 192" dur="7s" repeatCount="indefinite" />
          <path d="M0 -70 C62 -70 72 -8 42 32 L-42 32 C-72 -8 -62 -70 0 -70Z" fill="#F28C28" />
          <g clipPath="url(#af-balloon)">
            <rect x="-72" y="-72" width="34" height="110" fill="#1D9BF0" /><rect x="-4" y="-72" width="34" height="110" fill="#fff" opacity="0.9" /><rect x="38" y="-72" width="34" height="110" fill="#1D9BF0" />
            <ellipse cx="-18" cy="-30" rx="14" ry="30" fill="#fff" opacity="0.18" />
          </g>
          <path d="M-42 32 L-14 54 M42 32 L14 54 M0 32 L0 54" stroke="#6b4a2b" strokeWidth="2" />
          <rect x="-15" y="54" width="30" height="20" rx="4" fill="#a8743f" /><rect x="-15" y="54" width="30" height="6" rx="3" fill="#8a5a2f" />
          <ellipse cx="0" cy="40" rx="5" ry="8" fill="#ffb347"><animate attributeName="ry" values="8;11;7;9;8" dur="0.7s" repeatCount="indefinite" /></ellipse>
        </g>
      </Obj>

      {/* the airliner crossing the sky (riddle answer) */}
      <Obj id="airliner" label="An airliner flying across the sky" onPick={onPick} pulse={pulse} found={f('airliner')} badge={[-6, -52]} hit={[-160, -90, 330, 170]}>
        <g>
          <animateTransform attributeName="transform" type="translate" from="-380 118" to="1330 118" dur="46s" begin="-14s" repeatCount="indefinite" />
          <rect x="-430" y="-5" width="300" height="10" rx="5" fill="url(#af-trail)" />
          <polygon points="-120,-20 -158,-76 -116,-76 -70,-24" fill="#F28C28" />
          <path d="M-130 0 C-130 -22 -90 -27 -40 -27 L92 -27 C128 -27 152 -13 162 0 C152 13 128 23 92 23 L-40 23 C-90 23 -130 21 -130 0Z" fill="#fff" stroke="#cdd7e4" strokeWidth="2" />
          <path d="M-122 7 L150 7 L154 14 L-120 14Z" fill="#1D9BF0" />
          <polygon points="22,10 64,10 -6,60 -50,60" fill="#e2e8f0" stroke="#c4cfdd" strokeWidth="2" />
          <ellipse cx="14" cy="38" rx="26" ry="10" fill="#c3cedc" stroke="#aab7c8" strokeWidth="2" />
          {Array.from({ length: 11 }, (_, i) => <circle key={i} cx={-96 + i * 19} cy="-9" r="4" fill="#7fd1ff" />)}
          <path d="M118 -17 L148 -8 L120 -8Z" fill="#1b3a57" />
        </g>
      </Obj>

      {/* hangar (decoy) */}
      <Obj id="hangar" label="A hangar" onPick={onPick} pulse={pulse} hit={[50, 330, 250, 160]}>
        <rect x="48" y="466" width="256" height="40" fill="#4d5966" />
        <path d="M62 470 V402 Q176 340 290 402 V470Z" fill="#e3e8f0" stroke="#b3bdcc" strokeWidth="3" />
        <path d="M62 402 Q176 340 290 402" fill="none" stroke="#F28C28" strokeWidth="8" />
        <rect x="108" y="412" width="136" height="58" rx="4" fill="#8f9bad" />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={130 + i * 22} y1="414" x2={130 + i * 22} y2="470" stroke="#7a8799" strokeWidth="3" />)}
        <rect x="132" y="386" width="88" height="22" rx="4" fill="#fff" stroke="#b3bdcc" strokeWidth="2" /><text x="176" y="402" textAnchor="middle" fontSize="15" fontWeight="800" fill="#102A43">ZTS AIR</text>
      </Obj>

      {/* terminal (scenery) and control tower (riddle answer) */}
      <rect x="330" y="432" width="236" height="42" rx="5" fill="#e9eef5" stroke="#b3bdcc" strokeWidth="2" />
      <rect x="330" y="426" width="236" height="10" rx="3" fill="#1D9BF0" />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={342 + i * 25} y="444" width="16" height="16" rx="3" fill="#7fd1ff" />)}
      <Obj id="tower" label="The control tower" onPick={onPick} pulse={pulse} found={f('tower')} badge={[650, 300]} hit={[540, 190, 120, 290]}>
        <rect x="588" y="302" width="26" height="170" fill="#f0f3f8" stroke="#b3bdcc" strokeWidth="2" />
        {[326, 366, 406].map((y) => <rect key={y} x="588" y={y} width="26" height="20" fill="#D64045" />)}
        <polygon points="568,302 634,302 646,262 556,262" fill="#c8d9ea" stroke="#9fb4cc" strokeWidth="2" />
        <rect x="562" y="268" width="80" height="28" fill="#7fd1ff" stroke="#5aa9d6" strokeWidth="2" />
        {[582, 602, 622].map((x) => <line key={x} x1={x} y1="268" x2={x} y2="296" stroke="#5aa9d6" strokeWidth="3" />)}
        <rect x="552" y="252" width="98" height="12" rx="4" fill="#102A43" />
        <line x1="601" y1="252" x2="601" y2="218" stroke="#263238" strokeWidth="4" />
        <circle cx="601" cy="214" r="8" fill="#D64045"><animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" /></circle>
        <circle cx="601" cy="214" r="18" fill="#D64045" opacity="0"><animate attributeName="opacity" values="0.5;0;0.5" dur="1.2s" repeatCount="indefinite" /></circle>
        <rect x="590" y="446" width="22" height="28" rx="3" fill="#6b7a8d" />
      </Obj>

      {/* windsock (riddle answer) */}
      <Obj id="windsock" label="A windsock" onPick={onPick} pulse={pulse} found={f('windsock')} badge={[790, 360]} hit={[700, 340, 130, 140]}>
        <rect x="740" y="384" width="6" height="90" rx="3" fill="#cfd6df" /><circle cx="743" cy="384" r="6" fill="#9aa6b6" /><ellipse cx="743" cy="474" rx="16" ry="5" fill="#9aa6b6" />
        <g transform="translate(743 388)">
          <animateTransform attributeName="transform" type="rotate" values="-8 0 0 ;7 0 0;-8 0 0" dur="2.6s" repeatCount="indefinite" additive="sum" />
          {stripes.map((c, i) => {
            const x0 = i * 21
            const w0 = 13 - i * 2
            const w1 = 13 - (i + 1) * 2
            return <polygon key={i} points={`${x0},${-w0} ${x0 + 21},${-w1} ${x0 + 21},${w1} ${x0},${w0}`} fill={c} stroke="#e07b1c" strokeWidth="1" />
          })}
        </g>
      </Obj>

      {/* fuel truck (decoy) */}
      <Obj id="fuel" label="A fuel truck" onPick={onPick} pulse={pulse} hit={[820, 430, 150, 80]}>
        <rect x="836" y="454" width="96" height="30" rx="15" fill="#eef2f7" stroke="#b3bdcc" strokeWidth="2" />
        <rect x="836" y="466" width="96" height="6" fill="#F28C28" />
        <text x="884" y="463" textAnchor="middle" fontSize="11" fontWeight="800" fill="#102A43">FUEL</text>
        <rect x="930" y="462" width="34" height="24" rx="5" fill="#D64045" /><rect x="944" y="466" width="16" height="10" rx="2" fill="#aee3ff" />
        {[856, 904, 950].map((x) => <g key={x}><circle cx={x} cy="490" r="10" fill="#263238" /><circle cx={x} cy="490" r="4" fill="#cbd5e1" /></g>)}
        <path d="M836 478 q-18 6 -14 20" stroke="#263238" strokeWidth="3" fill="none" />
      </Obj>

      {/* runway (decoy) */}
      <Obj id="runway" label="The runway" onPick={onPick} pulse={pulse} hit={[0, 500, 1200, 74]}>
        <rect x="-10" y="506" width="1220" height="62" fill="#3a444e" />
        <line x1="0" y1="511" x2="1200" y2="511" stroke="#fff" strokeWidth="2" opacity="0.7" /><line x1="0" y1="563" x2="1200" y2="563" stroke="#fff" strokeWidth="2" opacity="0.7" />
        <line x1="0" y1="537" x2="1200" y2="537" stroke="#fff" strokeWidth="5" strokeDasharray="46 34" />
        <text x="96" y="556" fontSize="30" fontWeight="800" fill="#fff" opacity="0.9">27</text>
        {Array.from({ length: 13 }, (_, i) => (
          <circle key={i} cx={40 + i * 95} cy="503" r="4" fill="#ffd45e"><animate attributeName="opacity" values="1;0.25;1" dur="2s" begin={`${(i % 4) * 0.4}s`} repeatCount="indefinite" /></circle>
        ))}
      </Obj>

      <g pointerEvents="none" aria-hidden="true">
        <g>
          <animateMotion dur="26s" begin="-8s" repeatCount="indefinite" rotate="auto" calcMode="spline" keyTimes="0;1" keySplines="0.55 0 0.85 0.6" path="M-160 531 L640 531 C760 531 860 490 1060 400 L1400 250" />
          <path d="M-46 0 C-46 -10 -26 -12 -6 -12 L30 -12 C44 -12 54 -5 58 0 C54 5 44 10 30 10 L-6 10 C-26 10 -46 9 -46 0Z" fill="#fff" stroke="#cdd7e4" strokeWidth="1.5" />
          <polygon points="-42,-8 -58,-34 -42,-34 -22,-10" fill="#1D9BF0" />
          <polygon points="-2,8 18,8 -10,28 -26,28" fill="#dfe6ef" stroke="#c4cfdd" strokeWidth="1.5" />
          <rect x="-34" y="-3" width="86" height="3" fill="#F28C28" />
          <circle cx="-10" cy="13" r="3.5" fill="#263238" /><circle cx="34" cy="13" r="3.5" fill="#263238" />
        </g>
      </g>

      {/* helipad and air ambulance (riddle answer). It lifts off when the hunt is finished. */}
      <Obj id="ambulance" label="An air ambulance helicopter" onPick={onPick} pulse={pulse} found={f('ambulance')} badge={[1010, 392]} hit={[950, 320, 240, 190]}>
        <ellipse cx="1076" cy="486" rx="78" ry="15" fill="#4b5662" /><ellipse cx="1076" cy="486" rx="62" ry="11" fill="none" stroke="#ffd45e" strokeWidth="3" />
        <text x="1076" y="491" textAnchor="middle" fontSize="16" fontWeight="800" fill="#fff">H</text>
        <g style={{ transform: celebrate ? 'translateY(-110px)' : 'none', transition: 'transform 2.2s ease-in-out' }}>
          <g>
            <animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="2.4s" repeatCount="indefinite" />
            <line x1="1052" y1="472" x2="1052" y2="458" stroke="#263238" strokeWidth="3" /><line x1="1096" y1="472" x2="1096" y2="458" stroke="#263238" strokeWidth="3" /><line x1="1038" y1="474" x2="1112" y2="474" stroke="#263238" strokeWidth="4" strokeLinecap="round" />
            <polygon points="1104,436 1170,428 1170,441 1104,450" fill="#D64045" />
            <polygon points="1158,428 1172,404 1180,430" fill="#fff" stroke="#D64045" strokeWidth="2" />
            <ellipse cx="1076" cy="442" rx="44" ry="24" fill="#fff" stroke="#cfd8e3" strokeWidth="2" />
            <path d="M1032 446 Q1076 470 1120 446 Q1120 458 1076 466 Q1032 458 1032 446Z" fill="#D64045" />
            <ellipse cx="1054" cy="434" rx="19" ry="14" fill="#aee3ff" stroke="#7bc3e8" strokeWidth="2" />
            <circle cx="1090" cy="444" r="10" fill="#fff" stroke="#D64045" strokeWidth="2" /><path d="M1090 438 v12 M1084 444 h12" stroke="#D64045" strokeWidth="4" strokeLinecap="round" />
            <line x1="1076" y1="418" x2="1076" y2="408" stroke="#263238" strokeWidth="5" />
            <ellipse cx="1076" cy="408" rx="104" ry="9" fill="#fff" opacity="0.32" />
            <line y1="408" y2="408" stroke="#33414f" strokeWidth="5" strokeLinecap="round">
              <animate attributeName="x1" values="976;1176;976" dur="0.42s" repeatCount="indefinite" />
              <animate attributeName="x2" values="1176;976;1176" dur="0.42s" repeatCount="indefinite" />
            </line>
            <circle cx="1170" cy="436" r="9" fill="#fff" opacity="0.4"><animate attributeName="r" values="9;3;9" dur="0.25s" repeatCount="indefinite" /></circle>
          </g>
        </g>
      </Obj>

      {/* foreground grass and flowers */}
      <path d={`M0 600 L0 584 ${Array.from({ length: 40 }, (_, i) => `Q${i * 30 + 8} ${572 + (i % 3) * 4} ${i * 30 + 15} 584 T${i * 30 + 30} 584`).join(' ')} L1200 600Z`} fill="#357c4a" />
      {Array.from({ length: 22 }, (_, i) => <circle key={i} cx={20 + i * 55 + (i % 3) * 9} cy={580 + (i % 4) * 4} r="3.2" fill={i % 2 ? '#fff' : '#ffd45e'} />)}
    </svg>
  )
}
