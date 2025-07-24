'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ToolbarSeparator, ToolbarGroup } from "@/components/ui/toolbar"

interface ActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "compact" | "floating"
}

export function ActionBar({ 
  className, 
  variant = "default",
  children,
  ...props 
}: ActionBarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur min-h-[60px]",
        variant === "compact" && "p-3 min-h-[52px]",
        variant === "floating" && "mx-4 mt-4 rounded-lg border shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface ActionBarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "left" | "center" | "right"
}

export function ActionBarSection({ 
  className, 
  align = "left",
  ...props 
}: ActionBarSectionProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        align === "center" && "justify-center",
        align === "right" && "justify-end ml-auto",
        className
      )}
      {...props}
    />
  )
}

interface ActionBarButtonProps extends React.ComponentProps<typeof Button> {
  icon?: React.ReactNode
  shortcut?: string
}

export function ActionBarButton({ 
  className, 
  icon,
  shortcut,
  children,
  ...props 
}: ActionBarButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "h-10 px-4 gap-2 font-medium hover:bg-accent/80 transition-colors",
        className
      )}
      {...props}
    >
      {icon}
      {children}
      {shortcut && (
        <kbd className="ml-2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          {shortcut}
        </kbd>
      )}
    </Button>
  )
}

interface ActionBarIconButtonProps extends React.ComponentProps<typeof Button> {
  tooltip?: string
  icon?: React.ReactNode
}

export function ActionBarIconButton({ 
  className, 
  tooltip,
  icon,
  children,
  ...props 
}: ActionBarIconButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "h-10 w-10 hover:bg-accent/80 transition-colors",
        className
      )}
      title={tooltip}
      {...props}
    >
      {icon || children}
    </Button>
  )
}

// Pre-built action groups for common use cases
interface FileActionsProps {
  onNew?: () => void
  onOpen?: () => void
  onSave?: () => void
  onExport?: () => void
  disabled?: {
    new?: boolean
    open?: boolean
    save?: boolean
    export?: boolean
  }
}

export function FileActions({ 
  onNew, 
  onOpen, 
  onSave, 
  onExport,
  disabled = {}
}: FileActionsProps) {
  return (
    <ToolbarGroup label="File">
      <ActionBarButton 
        icon={<Plus className="h-4 w-4" />}
        onClick={onNew}
        disabled={disabled.new}
        shortcut="Ctrl+N"
      >
        Tạo mới
      </ActionBarButton>
      <ActionBarButton 
        icon={<FolderOpen className="h-4 w-4" />}
        onClick={onOpen}
        disabled={disabled.open}
        shortcut="Ctrl+O"
      >
        Mở
      </ActionBarButton>
      <ToolbarSeparator />
      <ActionBarButton 
        icon={<Save className="h-4 w-4" />}
        onClick={onSave}
        disabled={disabled.save}
        shortcut="Ctrl+S"
      >
        Lưu
      </ActionBarButton>
      <ActionBarButton 
        icon={<Download className="h-4 w-4" />}
        onClick={onExport}
        disabled={disabled.export}
      >
        Xuất
      </ActionBarButton>
    </ToolbarGroup>
  )
}

// Import icons
import { Plus, FolderOpen, Save, Download } from 'lucide-react'