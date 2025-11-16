import Image from "next/image"

interface CanvasIconProps {
  size?: number
  className?: string
}

export function CanvasIcon({ size = 32, className = "" }: CanvasIconProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/canvas-logo.png"
        alt="Canvas Credit Union"
        width={size * 2.5}
        height={size}
        className="object-contain"
      />
    </div>
  )
}
