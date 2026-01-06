"use client"

import { UserButton, useUser } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/lib/hooks"
import { Notebook, Plus, Pencil, PanelLeft, Settings } from "lucide-react"
import { ChatHistory } from "@/components/chat/ChatHistory"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"

const navigationItems = [
  {
    href: "/notes",
    title: "Notes",
    icon: <Notebook className="size-6" />,
    testId: "nav-notes"
  },
  {
    href: "/new",
    title: "New Note",
    icon: <Pencil className="size-6" />,
    testId: "nav-new"
  },
  {
    href: "/chat",
    title: "New Chat",
    icon: <Plus className="size-6" />,
    testId: "nav-chat"
  }
]

function SidebarContent({ isCollapsed, onClose }: { isCollapsed: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const { isLoaded } = useUser()

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col transition-all duration-200">
        <div className="flex-none p-2">
          <nav className="flex flex-col space-y-1">
            {navigationItems.map((item) => {
              const LinkContent = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group inline-flex items-center justify-start whitespace-nowrap rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href ? "bg-accent text-accent-foreground" : "bg-transparent"
                  )}
                >
                  <div className="size-6 justify-start">{item.icon}</div>
                  {!isCollapsed && <span className="ml-2">{item.title}</span>}
                </Link>
              )

              if (isCollapsed) {
                return (
                  <TooltipProvider key={item.href}>
                    <Tooltip>
                      <TooltipTrigger asChild>{LinkContent}</TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.title}</p>
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
          <div className="flex min-h-0 flex-1 flex-col whitespace-nowrap pb-2">
            <span className="text-foreground/80 flex-none px-4 pt-4 font-medium">Chat History</span>
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-1 scrollbar-thin">
              <ChatHistory onNavigate={onClose} />
            </div>
          </div>
        )}
      </div>

      <div className="h-[100px] min-h-0 flex-none mt-auto">
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                onClick={onClose}
                className={cn(
                  "group inline-flex h-[50px] w-full items-center justify-start whitespace-nowrap bg-transparent px-3 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md",
                  pathname === "/settings" && "bg-accent text-accent-foreground"
                )}
              >
                <Settings className="size-6" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-secondary-foreground">
              Settings
            </TooltipContent>
          </Tooltip>
        ) : (
          <Link
            href="/settings"
            onClick={onClose}
            className={cn(
              "group inline-flex h-[50px] w-full items-center justify-start whitespace-nowrap bg-transparent px-3 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md",
              pathname === "/settings" && "bg-accent text-accent-foreground"
            )}
          >
            <Settings className="size-6" />
            <span className="ml-2">Settings</span>
          </Link>
        )}

        <div className="h-[50px] flex-none justify-start border-t" suppressHydrationWarning>
          {!isLoaded ? (
            <div
              className={
                "flex items-center size-full bg-muted animate-pulse rounded-md"
              }
            >
            </div>
          ) : (
            <UserButton
              appearance={{
                elements: {
                  rootBox:
                    "!size-full hover:bg-accent bg-transparent whitespace-nowrap justify-start rounded-md px-3 pt-2 text-sm font-medium text-secondary-foreground",
                  userButtonTrigger: "size-full cursor-pointer",
                  userButtonBox: "size-full",
                  userButtonAvatarBox: cn("order-first size-6"),
                  userButtonOuterIdentifier: cn(
                    "flex-1 cursor-pointer whitespace-nowrap text-left text-sm !text-secondary-foreground",
                    isCollapsed && "hidden"
                  ),
                  card: "bg-popover border-border",
                  profileSectionTitle: "!text-secondary-foreground",
                  accordionTriggerButton: "text-secondary-foreground hover:bg-accent",
                  accordionContent: "bg-background",
                  profileSectionContent: "text-secondary-foreground"
                }
              }}
              showName={!isCollapsed}
            />
          )}
        </div>
      </div>
    </>
  )}

function DesktopSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-secondary text-secondary-foreground py-2 transition-all duration-200 overflow-hidden",
        isCollapsed ? "w-14" : "w-56"
      )}
    >
      <div className="flex items-center px-2">
        {!isCollapsed && (
          <span className="px-2 font-semibold text-foreground whitespace-nowrap">
            Medical Notes
          </span>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "hover:bg-accent hover:text-accent-foreground cursor-pointer",
                !isCollapsed && "ml-auto"
              )}
            >
              <PanelLeft className="size-5 " />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{isCollapsed ? "Expand" : "Collapse"}</TooltipContent>
        </Tooltip>
      </div>
      <SidebarContent isCollapsed={isCollapsed} />
    </aside>
  )
}

function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-2 left-2 z-40">
          <PanelLeft className="size-5 " />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80%] max-w-[280px] bg-secondary p-0 py-2">
        <VisuallyHidden.Root>
          <SheetTitle>Navigation Menu</SheetTitle>
        </VisuallyHidden.Root>
        <div className="flex items-center px-4 pb-2">
          <span className="font-semibold text-foreground">Medical Notes</span>
        </div>
        <SidebarContent isCollapsed={false} onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}

export function Sidebar() {
  const isMobile = useIsMobile()

  return isMobile ? <MobileSidebar /> : <DesktopSidebar />
}
