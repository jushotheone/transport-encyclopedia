// Placeholder ZTS mark: curved routes joining at one hub, in the master palette. The final logo is a design task.
export default function Logo({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Zion Transport System logo">
      <circle cx="24" cy="24" r="22" fill="#102A43" stroke="#1D9BF0" strokeWidth="2" />
      <path d="M8 30 C16 30 18 18 24 24 S34 18 40 18" fill="none" stroke="#F28C28" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M10 16 C18 16 20 30 26 25 S34 32 38 31" fill="none" stroke="#1D9BF0" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="24" cy="24.5" r="3.4" fill="#F7FAFC" />
    </svg>
  )
}
