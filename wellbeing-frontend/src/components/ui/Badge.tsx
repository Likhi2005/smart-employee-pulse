import * as React from "react"
import { cn } from "@/utils/cn"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "primary" | "success" | "warning" | "danger"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = "default", ...props }, ref) => {
        const variants = {
            default: "bg-slate-100 text-slate-900",
            primary: "bg-blue-100 text-blue-900",
            success: "bg-green-100 text-green-900",
            warning: "bg-yellow-100 text-yellow-900",
            danger: "bg-red-100 text-red-900",
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                    variants[variant],
                    className
                )}
                {...props}
            />
        )
    }
)
Badge.displayName = "Badge"

export { Badge }