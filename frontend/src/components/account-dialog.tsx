"use client"

import { LogOut, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

import { useClerk, useUser } from "@clerk/nextjs"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/schadcn/avatar"
import { Button } from "@/components/ui/schadcn/button"
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle
} from "@/components/ui/schadcn/responsive-dialog"
import { useGT } from "gt-react"

interface AccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const gt = useGT()

  const initials = user?.firstName?.[0] || user?.primaryEmailAddress?.emailAddress?.[0] || "?"

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-sm">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{gt("Account")}</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="flex items-center gap-3 pb-2">
          <Avatar className="size-10">
            <AvatarImage src={user?.imageUrl} alt={user?.fullName || ""} />
            <AvatarFallback className="bg-primary/10 text-sm font-medium">
              {initials.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            {user?.fullName && <p className="truncate text-sm font-medium">{user.fullName}</p>}
            <p className="truncate text-xs text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress ?? ""}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              onOpenChange(false)
              router.push("/settings")
            }}
          >
            <Settings className="mr-2 size-4" />
            {gt("Settings")}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={() => void signOut({ redirectUrl: "/sign-in" })}
          >
            <LogOut className="mr-2 size-4" />
            {gt("Sign out")}
          </Button>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
