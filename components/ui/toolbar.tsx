'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  variant?: "default" | "compact" | "grouped"
}

export function Toolbar({ 
  className, 
  orientation = "horizontal", 
  variant = "default",
  ...props 
}: ToolbarProps) {
  return (
    <div
      className={cn(
        "flex items-center",
        orientation === "vertical" && "flex-col items-start",
        variant === "default" && "gap-2",
        variant === "compact" && "gap-1",
        variant === "grouped" && "gap-1 p-1 border rounded-lg bg-muted/30",
        className
      )}
      role="toolbar"
      {...props}
    />
  )
}

interface ToolbarSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
}

export function ToolbarSeparator({ 
  className, 
  orientation = "vertical",
  ...props 
}: ToolbarSeparatorProps) {
  return (
    <div
      className={cn(
        "bg-border shrink-0",
        orientation === "vertical" ? "h-6 w-px mx-1" : "h-px w-6 my-1",
        className
      )}
      {...props}
    />
  )
}

interface ToolbarButtonProps extends React.ComponentProps<typeof Button> {
  pressed?: boolean
  tooltip?: string
}

export function ToolbarButton({ 
  className, 
  pressed, 
  tooltip,
  ...props 
}: ToolbarButtonProps) {
  return (
    <Button
      variant={pressed ? "default" : "ghost"}
      size="sm"
      className={cn(
        "h-9 px-3 shrink-0",
        pressed && "bg-accent text-accent-foreground",
        className
      )}
      title={tooltip}
      {...props}
    />
  )
}

interface ToolbarIconButtonProps extends React.ComponentProps<typeof Button> {
  pressed?: boolean
  tooltip?: string
}

export function ToolbarIconButton({ 
  className, 
  pressed, 
  tooltip,
  ...props 
}: ToolbarIconButtonProps) {
  return (
    <Button
      variant={pressed ? "default" : "ghost"}
      size="icon"
      className={cn(
        "h-9 w-9 shrink-0",
        pressed && "bg-accent text-accent-foreground",
        className
      )}
      title={tooltip}
      {...props}
    />
  )
}

interface ToolbarToggleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple"
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
}

export function ToolbarToggleGroup({ 
  className,
  children,
  ...props 
}: ToolbarToggleGroupProps) {
  return (
    <div
      className={cn("flex items-center rounded-md border p-1 bg-muted/30", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface ToolbarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
}

export function ToolbarGroup({ 
  className,
  label,
  children,
  ...props 
}: ToolbarGroupProps) {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      {label && (
        <span className="text-xs font-medium text-muted-foreground mr-2">
          {label}
        </span>
      )}
      {children}
    </div>
  )
}