"use client"

import * as React from "react"
import { useIsMobile } from "@/lib/hooks"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/schadcn/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/schadcn/drawer"
import { cn } from "@/lib/utils"

interface ResponsiveDialogProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function ResponsiveDialog({ children, ...props }: ResponsiveDialogProps) {
  const isMobile = useIsMobile()

  if (!isMobile) {
    return <Dialog {...props}>{children}</Dialog>
  }

  return (
    <Drawer {...props} shouldScaleBackground={false}>
      {children}
    </Drawer>
  )
}

function ResponsiveDialogTrigger({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogTrigger>) {
  const isMobile = useIsMobile()

  if (!isMobile) {
    return <DialogTrigger {...props}>{children}</DialogTrigger>
  }

  return <DrawerTrigger {...props}>{children}</DrawerTrigger>
}

function ResponsiveDialogContent({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogContent>) {
  const isMobile = useIsMobile()

  if (!isMobile) {
    return (
      <DialogContent className={className} {...props}>
        {children}
      </DialogContent>
    )
  }

  return (
    <DrawerContent className="max-h-[96dvh]">
      <div className={cn("overflow-y-auto px-4 pb-4", className)}>{children}</div>
    </DrawerContent>
  )
}

function ResponsiveDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  const isMobile = useIsMobile()

  if (!isMobile) {
    return <DialogHeader className={className} {...props} />
  }

  return <DrawerHeader className={cn("px-0", className)} {...props} />
}

function ResponsiveDialogTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogTitle>) {
  const isMobile = useIsMobile()

  if (!isMobile) {
    return <DialogTitle className={className} {...props} />
  }

  return <DrawerTitle className={className} {...props} />
}

function ResponsiveDialogDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogDescription>) {
  const isMobile = useIsMobile()

  if (!isMobile) {
    return <DialogDescription className={className} {...props} />
  }

  return <DrawerDescription className={className} {...props} />
}

function ResponsiveDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  const isMobile = useIsMobile()

  if (!isMobile) {
    return <DialogFooter className={className} {...props} />
  }

  return <DrawerFooter className={cn("px-0", className)} {...props} />
}

function ResponsiveDialogClose({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogClose>) {
  const isMobile = useIsMobile()

  if (!isMobile) {
    return <DialogClose {...props}>{children}</DialogClose>
  }

  return <DrawerClose {...props}>{children}</DrawerClose>
}

export {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger
}
