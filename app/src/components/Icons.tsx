export function EmberIcon({ size = 22 }: { size?: number }) {
  return (
    <svg className="ember-icon" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M12 2c1 4 6 6.500 6 12a6 6 0 0 1-12 0c0-3 2-4.500 2.500-7 1.500 1 2 2.500 2 3.500 1-2.500 2-5.500 1.500-8.500z" fill="#c8532c" stroke="#2b2422" strokeWidth="1.300" strokeLinejoin="round" />
      <path d="M12 12.500c1 1.500 2.500 2.500 2.500 4.500a2.500 2.500 0 0 1-5 0c0-1.500 1.500-2.500 2.500-4.500z" fill="#f0c351" />
    </svg>
  )
}

export function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.800" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9.500v5h3.500L12 18.500v-13L7.500 9.500z" fill="currentColor" fillOpacity="0.150" />
      {on ? <path d="M15.500 9a4.500 4.500 0 0 1 0 6M18 6.500a8 8 0 0 1 0 11" /> : <path d="M16 9.500l5 5M21 9.500l-5 5" />}
    </svg>
  )
}

export function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.200" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  )
}

export function PasteIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.800" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="6" y="5" width="12" height="15" rx="1.500" />
      <path d="M9 5V3.500h6V5M9 10h6M9 13.500h6M9 17h3.500" />
    </svg>
  )
}
