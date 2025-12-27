"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  Notebook,
  MessageSquarePlus,
  Pencil,
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun
} from "lucide-react"
import { ChatHistory } from "@/components/chat/ChatHistory"

const navItems = [
  { href: "/notes", icon: Notebook, label: "Notes" },
  { href: "/new", icon: Pencil, label: "New Note" },
  { href: "/chat/new", icon: MessageSquarePlus, label: "New Chat" }
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const { theme, setTheme } = useTheme()

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar py-4 transition-all duration-200",
        isCollapsed ? "w-14" : "w-56"
      )}
    >
      <div className="flex items-center justify-center px-2">
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(false)}
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <ChevronRight className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <ChevronLeft className="size-5" />
          </Button>
        )}
      </div>

      <nav className="mt-2 flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const linkContent = (
            <Button
              asChild
              variant="ghost"
              size={isCollapsed ? "icon" : "default"}
              className={cn(
                "w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                !isCollapsed && "justify-start"
              )}
            >
              <Link href={item.href}>
                <item.icon className="size-5" />
                {!isCollapsed && <span className="ml-2">{item.label}</span>}
              </Link>
            </Button>
          )

          if (isCollapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            )
          }

          return <div key={item.href}>{linkContent}</div>
        })}
      </nav>

      {!isCollapsed && (
        <div className="flex flex-1 flex-col overflow-hidden px-2">
          <span className="mb-2 px-2 text-xs font-medium text-sidebar-foreground/60">History</span>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <ChatHistory />
          </div>
        </div>
      )}

      <div className="mt-auto flex flex-col items-center gap-2 px-2">
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            <span className="ml-2">{theme === "dark" ? "Light" : "Dark"}</span>
          </Button>
        )}
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Settings className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Settings className="size-5" />
            <span className="ml-2">Settings</span>
          </Button>
        )}
      </div>
    </aside>
  )
}
