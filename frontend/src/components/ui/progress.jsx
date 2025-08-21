import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "../../lib/utils"

const Progress = React.forwardRef(({ className, value = 0, ...props }, ref) => {
  const percent = Math.max(0, Math.min(100, value || 0))
  let indicatorGradient = "from-sky-500 to-fuchsia-500"
  if (percent < 34) indicatorGradient = "from-rose-500 to-orange-500"
  else if (percent < 67) indicatorGradient = "from-amber-400 to-yellow-500"
  else indicatorGradient = "from-emerald-500 to-green-400"

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-white/10",
        className
      )}
      {...props}>
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 bg-gradient-to-r transition-all",
          indicatorGradient
        )}
        style={{ transform: `translateX(-${100 - percent}%)` }} />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
