import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Ai Notes</h1>
      </div>
      <Button asChild size="lg">
        <Link href="/sign-in">Sign In</Link>
      </Button>
    </div>
  )
}
