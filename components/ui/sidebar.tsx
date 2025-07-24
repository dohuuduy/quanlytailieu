'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

const SidebarContext = React.createContext<{
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}>({
  collapsed: false,
  setCollapsed: () => {},
})

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
}

export function SidebarProvider({ children, defaultCollapsed = false }: SidebarProviderProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right"
}

export function Sidebar({ side = "left", className, children, ...props }: SidebarProps) {
  const { collapsed } = useSidebar()

  return (
    <div
      className={cn(
        "relative flex h-full flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        side === "right" && "border-l border-r-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarHeader({ className, ...props }: SidebarHeaderProps) {
  return (
    <div
      className={cn("flex h-16 items-center border-b px-4", className)}
      {...props}
    />
  )
}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarContent({ className, ...props }: SidebarContentProps) {
  return (
    <ScrollArea className="flex-1">
      <div className={cn("flex flex-col gap-2 p-4", className)} {...props} />
    </ScrollArea>
  )
}

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarFooter({ className, ...props }: SidebarFooterProps) {
  return (
    <div
      className={cn("border-t p-4", className)}
      {...props}
    />
  )
}

interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarMenu({ className, ...props }: SidebarMenuProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props} />
  )
}

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  active?: boolean
  disabled?: boolean
  hasSubmenu?: boolean
}

export function SidebarMenuItem({ 
  className, 
  children, 
  icon, 
  active, 
  disabled,
  hasSubmenu,
  ...props 
}: SidebarMenuItemProps) {
  const { collapsed } = useSidebar()

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
        active 
          ? "bg-primary text-primary-foreground" 
          : "hover:bg-accent hover:text-accent-foreground",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="flex h-4 w-4 items-center justify-center">
          {icon}
        </div>
      )}
      {!collapsed && (
        <>
          <span className="flex-1">{children}</span>
          {hasSubmenu && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="chevron-down"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          )}
        </>
      )}
    </div>
  )
}

interface SidebarSubmenuProps {
  children: React.ReactNode
  open: boolean
  className?: string
}

export function SidebarSubmenu({ 
  children, 
  open, 
  className 
}: SidebarSubmenuProps) {
  const { collapsed } = useSidebar()
  
  if (collapsed) return null
  
  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-200 ease-in-out",
        open ? "max-h-96" : "max-h-0",
        className
      )}
    >
      <div className="pl-6 border-l ml-4 mt-1 mb-1">
        {children}
      </div>
    </div>
  )
}

interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function SidebarTrigger({ className, ...props }: SidebarTriggerProps) {
  const { collapsed, setCollapsed } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", className)}
      onClick={() => setCollapsed(!collapsed)}
      {...props}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </Button>
  )
}