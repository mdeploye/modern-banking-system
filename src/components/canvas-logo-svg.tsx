interface CanvasLogoSVGProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  className?: string
}

export function CanvasLogoSVG({ size = "md", showText = true, className = "" }: CanvasLogoSVGProps) {
  const sizes = {
    sm: { height: "h-6", width: "w-auto", viewBox: "0 0 180 50" },
    md: { height: "h-10", width: "w-auto", viewBox: "0 0 180 50" },
    lg: { height: "h-16", width: "w-auto", viewBox: "0 0 180 50" },
    xl: { height: "h-24", width: "w-auto", viewBox: "0 0 180 50" },
  }

  const s = sizes[size]

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg 
        className={`${s.height} ${s.width}`}
        viewBox={s.viewBox}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Canvas Interlocking Pattern - Orange */}
        <g id="interlocking-pattern">
          {/* Left Chevron */}
          <path 
            d="M 95 5 L 105 15 L 95 25 L 85 15 Z" 
            fill="#E8541E"
          />
          
          {/* Middle Top Chevron */}
          <path 
            d="M 110 0 L 125 8 L 125 18 L 115 13 L 115 23 L 105 18 L 105 8 Z" 
            fill="#E8541E"
          />
          
          {/* Middle Bottom Chevron */}
          <path 
            d="M 110 30 L 125 22 L 125 12 L 115 17 L 115 7 L 105 12 L 105 22 Z" 
            fill="#E8541E"
          />
          
          {/* Right Top Chevron */}
          <path 
            d="M 130 3 L 145 11 L 145 21 L 135 16 L 135 26 L 125 21 L 125 11 Z" 
            fill="#E8541E"
          />
          
          {/* Right Bottom Chevron */}
          <path 
            d="M 130 27 L 145 19 L 145 9 L 135 14 L 135 4 L 125 9 L 125 19 Z" 
            fill="#E8541E"
          />
          
          {/* Far Right Chevron */}
          <path 
            d="M 150 6 L 165 14 L 165 24 L 155 19 L 155 29 L 145 24 L 145 14 Z" 
            fill="#E8541E"
          />
        </g>

        {showText && (
          <>
            {/* "canvas" text - Gray/Brown */}
            <g id="canvas-text">
              <text 
                x="0" 
                y="42" 
                fontFamily="Arial, Helvetica, sans-serif" 
                fontSize="24" 
                fontWeight="700" 
                fill="#6B5D56"
                letterSpacing="-0.5"
              >
                canvas
              </text>
              <text 
                x="112" 
                y="42" 
                fontFamily="Arial, Helvetica, sans-serif" 
                fontSize="10" 
                fontWeight="400" 
                fill="#6B5D56"
              >
                ®
              </text>
            </g>

            {/* "credit union" text - Smaller Gray */}
            <g id="credit-union-text">
              <text 
                x="0" 
                y="48" 
                fontFamily="Arial, Helvetica, sans-serif" 
                fontSize="8" 
                fontWeight="500" 
                fill="#8B8680"
                letterSpacing="0.5"
              >
                credit union
              </text>
            </g>
          </>
        )}
      </svg>
    </div>
  )
}
