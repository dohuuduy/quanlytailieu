'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { 
  FileText, 
  Users, 
  Settings, 
  BarChart3, 
  Home,
  Plus,
  Search,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Download,
  Folder,
  BookOpen,
  CheckSquare,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Sidebar, 
  SidebarProvider, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import { 
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@/components/ui/menubar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Trang chủ', href: '/', icon: Home },
  { name: 'Hồ sơ tài liệu', href: '/ho-so', icon: FileText },
  { name: 'Người dùng', href: '/nguoi-dung', icon: Users },
  { 
    name: 'Tra cứu', 
    href: '/tra-cuu', 
    icon: Search,
    hasSubmenu: true,
    submenu: [
      { name: 'Theo tiêu chuẩn', href: '/tra-cuu/tieu-chuan', icon: BookOpen },
      { name: 'Theo loại tài liệu', href: '/tra-cuu/loai-tai-lieu', icon: FileText },
      { name: 'Theo người ban hành', href: '/tra-cuu/nguoi-ban-hanh', icon: Users },
      { name: 'Tìm kiếm nâng cao', href: '/tra-cuu/tim-kiem-nang-cao', icon: Search }
    ]
  },
  { 
    name: 'Danh mục', 
    href: '/danh-muc', 
    icon: Folder,
    hasSubmenu: true,
    submenu: [
      { name: 'Loại tài liệu', href: '/danh-muc/loai-tai-lieu', icon: FileText },
      { name: 'Tiêu chuẩn', href: '/danh-muc/tieu-chuan', icon: BookOpen },
      { name: 'Trạng thái', href: '/danh-muc/trang-thai', icon: CheckSquare }
    ]
  },
  { name: 'Báo cáo', href: '/bao-cao', icon: BarChart3 },
  { name: 'Cài đặt', href: '/cai-dat', icon: Settings },
]

function DashboardSidebar() {
  const pathname = usePathname()
  const { collapsed } = useSidebar()
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)

  // Kiểm tra xem pathname có thuộc submenu nào không
  React.useEffect(() => {
    navigation.forEach(item => {
      if (item.submenu && item.submenu.some(subItem => pathname.startsWith(subItem.href))) {
        setOpenSubmenu(item.name);
      }
    });
  }, [pathname]);

  const toggleSubmenu = (name: string) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">QuanLyTaiLieu</span>
              <span className="text-xs text-muted-foreground">v1.0</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
                            (item.submenu && item.submenu.some(subItem => pathname.startsWith(subItem.href)));
            
            if (item.hasSubmenu && item.submenu) {
              const isOpen = openSubmenu === item.name;
              
              return (
                <React.Fragment key={item.name}>
                  <div
                    onClick={() => toggleSubmenu(item.name)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
                      isActive 
                        ? "bg-accent text-accent-foreground" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <div className="flex h-4 w-4 items-center justify-center">
                      <item.icon className="h-4 w-4" />
                    </div>
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </div>
                  
                  {!collapsed && (
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-200 ease-in-out",
                        isOpen ? "max-h-96" : "max-h-0"
                      )}
                    >
                      <div className="pl-6 border-l ml-4 mt-1 mb-1">
                        {item.submenu.map(subItem => {
                          const isSubActive = pathname.startsWith(subItem.href);
                          return (
                            <Link key={subItem.name} href={subItem.href}>
                              <div
                                className={cn(
                                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
                                  isSubActive 
                                    ? "bg-primary text-primary-foreground" 
                                    : "hover:bg-accent hover:text-accent-foreground"
                                )}
                              >
                                <div className="flex h-4 w-4 items-center justify-center">
                                  <subItem.icon className="h-4 w-4" />
                                </div>
                                <span className="flex-1">{subItem.name}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            }
            
            return (
              <Link key={item.name} href={item.href}>
                <SidebarMenuItem
                  icon={<item.icon className="h-4 w-4" />}
                  active={isActive}
                >
                  {item.name}
                </SidebarMenuItem>
              </Link>
            );
          })}
        </SidebarMenu>

        <div className="mt-6">
          <div className="px-3 py-2">
            {!collapsed && (
              <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Thao tác nhanh
              </h3>
            )}
          </div>
          <SidebarMenu>
            <Link href="/ho-so/tao-moi">
              <SidebarMenuItem icon={<Plus className="h-4 w-4" />}>
                Tạo tài liệu mới
              </SidebarMenuItem>
            </Link>
            <Link href="/tra-cuu">
              <SidebarMenuItem icon={<Search className="h-4 w-4" />}>
                Tìm kiếm nâng cao
              </SidebarMenuItem>
            </Link>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem icon={<User className="h-4 w-4" />}>
            {!collapsed ? 'Hồ sơ cá nhân' : ''}
          </SidebarMenuItem>
          <SidebarMenuItem icon={<LogOut className="h-4 w-4" />}>
            {!collapsed ? 'Đăng xuất' : ''}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function DashboardHeader() {
  const { collapsed, setCollapsed } = useSidebar()

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      {/* Left section - Menu toggle and main actions */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-10 w-10 shrink-0 hover:bg-accent/80 transition-colors"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>

        {/* Main Navigation - Desktop */}
        <div className="hidden lg:flex items-center gap-1">
          <div className="flex items-center bg-muted/40 rounded-lg border p-1">
            <Link href="/">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-3 text-sm font-medium hover:bg-background hover:shadow-sm transition-all duration-200"
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/ho-so">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-3 text-sm font-medium hover:bg-background hover:shadow-sm transition-all duration-200"
              >
                <FileText className="mr-2 h-4 w-4" />
                Tài liệu
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 text-sm font-medium hover:bg-background hover:shadow-sm transition-all duration-200"
              disabled
              title="Tính năng sẽ phát triển sau"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Đào tạo
            </Button>
            <Link href="/lich-danh-gia">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-3 text-sm font-medium hover:bg-background hover:shadow-sm transition-all duration-200"
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                Lịch đánh giá
              </Button>
            </Link>
          </div>
        </div>

        {/* Compact Navigation - Tablet */}
        <div className="hidden md:flex lg:hidden items-center gap-2">
          <Link href="/">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-10 px-4 font-medium hover:bg-accent/80 transition-colors"
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          <Link href="/ho-so">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-10 px-4 font-medium hover:bg-accent/80 transition-colors"
            >
              <FileText className="mr-2 h-4 w-4" />
              Tài liệu
            </Button>
          </Link>
          <Link href="/lich-danh-gia">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 hover:bg-accent/80 transition-colors"
              title="Lịch đánh giá"
            >
              <CheckSquare className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-10 px-4 font-medium hover:bg-accent/80 transition-colors"
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          
          <Menubar className="border-0 bg-transparent p-0 h-10">
            <MenubarMenu>
              <MenubarTrigger className="px-4 py-2 text-sm h-10 border rounded-md font-medium hover:bg-accent/80 transition-colors">
                <Menu className="mr-2 h-4 w-4" />
                Menu
              </MenubarTrigger>
              <MenubarContent>
                <Link href="/ho-so">
                  <MenubarItem className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    Tài liệu
                  </MenubarItem>
                </Link>
                <MenubarItem className="cursor-not-allowed opacity-50">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Đào tạo (Sắp có)
                </MenubarItem>
                <Link href="/lich-danh-gia">
                  <MenubarItem className="cursor-pointer">
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Lịch đánh giá
                  </MenubarItem>
                </Link>
                <MenubarSeparator />
                <Link href="/ho-so/tao-moi">
                  <MenubarItem className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo tài liệu mới
                  </MenubarItem>
                </Link>
                <Link href="/tra-cuu">
                  <MenubarItem className="cursor-pointer">
                    <Search className="mr-2 h-4 w-4" />
                    Tìm kiếm nâng cao
                  </MenubarItem>
                </Link>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      </div>

      {/* Right section - Search and user actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Search - Desktop only */}
        <div className="relative hidden xl:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm tài liệu..."
            className="w-64 pl-10 h-10 text-sm border-input focus:border-primary transition-colors"
          />
        </div>
        
        {/* User action buttons */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 shrink-0 hover:bg-accent/80 transition-colors"
          >
            <Bell className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 shrink-0 hover:bg-accent/80 transition-colors"
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar - Hidden on mobile, overlay on tablet */}
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>
        
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
            <div className="mx-auto max-w-7xl w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}