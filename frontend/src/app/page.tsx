import Link from "next/link"
import { Button } from "@/components/ui/schadcn/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center  h-svh justify-center gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground text-primary">AI Notes</h1>
      </div>
      <Button asChild size="lg">
        <Link href="/sign-in">Sign In</Link>
      </Button>
    </div>
  )
}
