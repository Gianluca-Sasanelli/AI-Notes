"use client"

import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/schadcn/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/schadcn/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/schadcn/tooltip"
import { cn } from "@/lib/utils"
import { Notebook, Plus, Pencil, PanelLeft, Sun, Moon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/schadcn/avatar"
import { AccountDialog } from "@/components/account-dialog"
import { ChatHistory } from "@/components/chat/ChatHistory"
import { getChatsClient } from "@/lib/api"
import { usePrefetchQuery } from "@tanstack/react-query"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { useGT } from "gt-react"

const navigationItems = [
  {
    href: "/notes",
    titleKey: "nav.notes",
    icon: <Notebook className="size-6" />,
    testId: "nav-notes"
  },
  {
    href: "/new",
    titleKey: "nav.newNote",
    icon: <Pencil className="size-6" />,
    testId: "nav-new"
  },
  {
    href: "/chat",
    titleKey: "nav.newChat",
    icon: <Plus className="size-6" />,
    testId: "nav-chat"
  }
]

function ThemeToggle({ isCollapsed }: { isCollapsed: boolean }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    queueMicrotask(() => setMounted(true))
  }, [])

  const isDark = mounted && resolvedTheme === "dark"

  const toggle = () => setTheme(isDark ? "light" : "dark")

  if (isCollapsed) {
    return (
      <Button variant="ghost" size="icon" onClick={toggle} className="w-full justify-center">
        {isDark ? <Moon className="size-6" /> : <Sun className="size-6" />}
      </Button>
    )
  }

  return (
    <div
      onClick={toggle}
      className="relative flex w-full cursor-pointer items-center rounded-lg bg-muted p-1"
    >
      <div
        className={cn(
          "absolute h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-md bg-background shadow-sm transition-transform duration-300 ease-in-out",
          isDark ? "translate-x-[calc(100%+4px)]" : "translate-x-0"
        )}
      />
      <div
        className={cn(
          "z-10 flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 transition-colors duration-300",
          !isDark ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <Sun className="size-4" />
        <span className="text-xs font-medium">Light</span>
      </div>
      <div
        className={cn(
          "z-10 flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 transition-colors duration-300",
          isDark ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <Moon className="size-4" />
        <span className="text-xs font-medium">Dark</span>
      </div>
    </div>
  )
}

function SidebarContent({ isCollapsed, onClose }: { isCollapsed: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const { user, isLoaded } = useUser()
  const gt = useGT()
  const [accountOpen, setAccountOpen] = useState(false)

  const navTitles: Record<string, string> = {
    "nav.notes": gt("Notes"),
    "nav.newNote": gt("New Note"),
    "nav.newChat": gt("New Chat")
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex-none p-1">
          <nav className="flex flex-col space-y-1">
            {navigationItems.map((item) => {
              const title = navTitles[item.titleKey]
              const LinkContent = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group inline-flex items-center justify-start whitespace-nowrap rounded-md p-2 text-base font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href ? "bg-accent text-accent-foreground" : "bg-transparent"
                  )}
                >
                  <div className="size-6 justify-start">{item.icon}</div>
                  {!isCollapsed && <span className="ml-2">{title}</span>}
                </Link>
              )

              if (isCollapsed) {
                return (
                  <TooltipProvider key={item.href}>
                    <Tooltip>
                      <TooltipTrigger asChild>{LinkContent}</TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              }

              return LinkContent
            })}
          </nav>
        </div>

        {!isCollapsed && (
          <div className="flex min-h-0 flex-1 flex-col whitespace-nowrap pt-4">
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-1 scrollbar-thin text-secondary-foreground">
              <ChatHistory onNavigate={onClose} />
            </div>
          </div>
        )}
      </div>

      <div className="mb-2 min-h-0 flex-none mt-auto flex flex-col ">
        <ThemeToggle isCollapsed={isCollapsed} />
        {(() => {
          const initials = user?.firstName?.[0] || user?.primaryEmailAddress?.emailAddress?.[0]

          const avatarButton = (
            <Button
              variant="ghost"
              size="icon-lg"
              onClick={() => setAccountOpen(true)}
              className="w-full justify-start p-2 text-base font-medium"
            >
              <Avatar className="size-8 shrink-0">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
                {initials && (
                  <AvatarFallback className="bg-primary/10 text-xs font-medium">
                    {initials.toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              {!isCollapsed && (
                <span className="ml-2 truncate text-secondary-foreground">
                  {user?.fullName || user?.primaryEmailAddress?.emailAddress || ""}
                </span>
              )}
            </Button>
          )

          if (!isLoaded) {
            return (
              <div className="inline-flex items-center rounded-md p-2">
                <div className="size-6 animate-pulse rounded-full bg-muted" />
                {!isCollapsed && <div className="ml-2 h-3 w-24 animate-pulse rounded bg-muted" />}
              </div>
            )
          }

          return (
            <>
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>{avatarButton}</TooltipTrigger>
                  <TooltipContent side="right">{gt("Profile")}</TooltipContent>
                </Tooltip>
              ) : (
                avatarButton
              )}
              <AccountDialog open={accountOpen} onOpenChange={setAccountOpen} />
            </>
          )
        })()}
      </div>
    </>
  )
}

function DesktopSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-none bg-secondary text-secondary-foreground p-1 pt-4 transition-all duration-200 overflow-hidden",
        isCollapsed ? "w-14" : "w-56"
      )}
    >
      <div className={cn("flex items-center px-2", isCollapsed && "px-1")}>
        {!isCollapsed && (
          <span className="font-semibold  whitespace-nowrap text-2xl text-primary">AI Notes</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "hover:bg-accent hover:text-accent-foreground cursor-pointer text-secondary-foreground",
            !isCollapsed && "ml-auto"
          )}
        >
          <PanelLeft className="size-6 " />
        </Button>
      </div>
      <SidebarContent isCollapsed={isCollapsed} />
    </aside>
  )
}

function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const gt = useGT()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-2 left-2 z-40">
          <PanelLeft className="size-6 " />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[80%] max-w-[280px] bg-secondary text-secondary-foreground p-0 py-2"
      >
        <VisuallyHidden.Root>
          <SheetTitle>{gt("Navigation Menu")}</SheetTitle>
        </VisuallyHidden.Root>
        <div className="flex items-center px-4 pb-2">
          <span className="font-semibold text-foreground text-xl text-primary">AI Notes</span>
        </div>
        <SidebarContent isCollapsed={false} onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}

function PrefetchChatHistory() {
  usePrefetchQuery({
    queryKey: ["chats", 0, 20],
    queryFn: () => getChatsClient(0, 20),
    staleTime: 2 * 60 * 1000
  })
  return null
}

export function Sidebar() {
  return (
    <>
      <PrefetchChatHistory />
      <div className="hidden lg:block">
        <DesktopSidebar />
      </div>
      <div className="block lg:hidden">
        <MobileSidebar />
      </div>
    </>
  )
}
