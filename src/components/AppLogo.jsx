const SIZES = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-14',
}

function AppLogo({ size = 'md', className = '' }) {
  return (
    <img
      src="/adscale-ai-logo.png"
      alt="AdScale AI"
      className={`w-auto object-contain ${SIZES[size] ?? SIZES.md} ${className}`.trim()}
    />
  )
}

export default AppLogo
