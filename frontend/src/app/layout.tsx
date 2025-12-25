import "./global.css"
import { Plus_Jakarta_Sans } from "next/font/google"
// import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/app/providers"
import { Toaster } from "@/components/toaster"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={jakarta.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex-1 bg-background">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
