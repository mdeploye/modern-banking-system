import Image from "next/image"

interface CanvasLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  className?: string
}

export function CanvasLogo({ size = "md", showText = true, className = "" }: CanvasLogoProps) {
  const sizes = {
    sm: { height: 24, width: 120 },
    md: { height: 40, width: 200 },
    lg: { height: 64, width: 320 },
    xl: { height: 96, width: 480 },
  }

  const s = sizes[size]

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/canvas-logo.png"
        alt="Canvas Credit Union"
        width={s.width}
        height={s.height}
        priority
        className="object-contain"
      />
    </div>
  )
}
