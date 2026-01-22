"use client"

import { UserButton, useUser } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/schadcn/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/schadcn/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/schadcn/tooltip"
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
        <div className="flex-none p-1">
          <nav className="flex flex-col space-y-1">
            {navigationItems.map((item) => {
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
          <div className="flex min-h-0 flex-1 flex-col whitespace-nowrap pt-4">
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-1 scrollbar-thin text-secondary-foreground">
              <ChatHistory onNavigate={onClose} />
            </div>
          </div>
        )}
      </div>

      <div className="h-[100px] min-h-0 flex-none mt-auto flex flex-col ">
        {(() => {
          const SettingsLink = (
            <Link
              href="/settings"
              onClick={onClose}
              className={cn(
                "group inline-flex h-[50px] w-full items-center  justify-start p-2 pl-3 whitespace-nowrap bg-transparent text-sm font-medium text-foreground hover:bg-accent rounded-md",
                pathname === "/settings" && "bg-accent text-accent-foreground"
              )}
            >
              <div className="size-6 flex items-center ">
                <Settings />
              </div>
              {!isCollapsed && <span className="ml-2">Settings</span>}
            </Link>
          )

          return isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>{SettingsLink}</TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          ) : (
            SettingsLink
          )
        })()}

        <div className="h-[50px] w-full flex-none border-t" suppressHydrationWarning>
          {!isLoaded ? (
            <div
              className={
                "flex items-center justify-start size-full bg-muted animate-pulse rounded-md"
              }
            ></div>
          ) : isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="size-full">
                  <UserButton
                    appearance={{
                      elements: {
                        rootBox:
                          "!size-full hover:bg-accent bg-transparent whitespace-nowrap justify-start p-2 pl-3 rounded-md text-sm font-medium text-secondary-foreground [&_*]:!outline-none [&_*]:!ring-0",
                        userButtonTrigger: "size-full cursor-pointer !outline-none !ring-0",
                        userButtonBox: "size-full !outline-none !ring-0",
                        userButtonAvatarBox:
                          "order-first !size-6 justify-start !outline-none !ring-0",
                        userButtonAvatarImage: "!outline-none !ring-0",
                        userButtonOuterIdentifier: "hidden",
                        card: "bg-popover border-border",
                        profileSectionTitle: "!text-secondary-foreground",
                        accordionTriggerButton: "text-secondary-foreground hover:bg-accent",
                        accordionContent: "bg-background",
                        profileSectionContent: "text-secondary-foreground"
                      }
                    }}
                    showName={false}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">Profile</TooltipContent>
            </Tooltip>
          ) : (
            <div className="size-full cursor-pointer">
              <UserButton
                appearance={{
                  elements: {
                    rootBox:
                      "!size-full cursor-pointer hover:bg-accent bg-transparent whitespace-nowrap justify-start p-2 pl-3 rounded-md ",
                    userButtonTrigger: "hidden",
                    userButtonBox: "size-full flex items-center !gap-0 focus:ring-0",
                    userButtonAvatarBox: "order-first !size-6",
                    userButtonOuterIdentifier:
                      "flex-1 p-0  whitespace-nowrap text-left  !text-foreground",
                    card: "bg-popover border-border",
                    profileSectionTitle: "p-0 !text-secondary-foreground items-center",
                    accordionTriggerButton: "hover:bg-accent focus:bg-accent",
                    accordionContent: "bg-background",
                    profileSectionContent: "text-secondary-foreground"
                  }
                }}
                showName
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function DesktopSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-secondary text-secondary-foreground p-1 transition-all duration-200 overflow-hidden",
        isCollapsed ? "w-14" : "w-56"
      )}
    >
      <div className={cn("flex items-center px-2", isCollapsed && "px-1")}>
        {!isCollapsed && (
          <span className="font-semibold  whitespace-nowrap text-2xl text-primary">AI Notes</span>
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
          <span className="font-semibold text-foreground text-xl text-primary">AI Notes</span>
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
