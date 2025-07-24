'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface MenubarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Menubar({ className, ...props }: MenubarProps) {
  return (
    <div
      className={cn(
        "flex h-10 items-center space-x-1 rounded-md border bg-background p-1",
        className
      )}
      {...props}
    />
  )
}

interface MenubarMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MenubarMenu({ className, ...props }: MenubarMenuProps) {
  return <div className={cn("relative", className)} {...props} />
}

interface MenubarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function MenubarTrigger({ className, ...props }: MenubarTriggerProps) {
  return (
    <button
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

interface MenubarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MenubarContent({ className, ...props }: MenubarContentProps) {
  return (
    <div
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        className
      )}
      {...props}
    />
  )
}

interface MenubarItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MenubarItem({ className, ...props }: MenubarItemProps) {
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

interface MenubarSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MenubarSeparator({ className, ...props }: MenubarSeparatorProps) {
  return (
    <div
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  )
}