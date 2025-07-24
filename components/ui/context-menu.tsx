'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface ContextMenuProps {
  children: React.ReactNode
}

export function ContextMenu({ children }: ContextMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setPosition({ x: e.clientX, y: e.clientY })
    setIsOpen(true)
  }

  const handleClick = () => {
    setIsOpen(false)
  }

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [isOpen])

  return (
    <div onContextMenu={handleContextMenu}>
      {children}
    </div>
  )
}

interface ContextMenuTriggerProps {
  children: React.ReactNode
}

export function ContextMenuTrigger({ children }: ContextMenuTriggerProps) {
  return <>{children}</>
}

interface ContextMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ContextMenuContent({ className, ...props }: ContextMenuContentProps) {
  return (
    <div
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg",
        className
      )}
      {...props}
    />
  )
}

interface ContextMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ContextMenuItem({ className, ...props }: ContextMenuItemProps) {
  return (
    <div
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    />
  )
}

interface ContextMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ContextMenuSeparator({ className, ...props }: ContextMenuSeparatorProps) {
  return (
    <div
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  )
}