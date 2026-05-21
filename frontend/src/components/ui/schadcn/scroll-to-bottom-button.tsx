"use client"

import { useEffect, useState, type RefObject } from "react"
import { ArrowDown } from "lucide-react"
import { Button } from "./button"

const THRESHOLD = 100

export function ScrollToBottomButton({
  containerRef,
  className
}: {
  containerRef: RefObject<HTMLElement | null>
  className?: string
}) {
  const [show, setShow] = useState(false)
  console.log("Show value is", show)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const check = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight + 20
      setShow(distanceFromBottom > THRESHOLD)
    }

    check()
    el.addEventListener("scroll", check, { passive: true })
    const ro = new ResizeObserver(check)
    ro.observe(el)

    return () => {
      el.removeEventListener("scroll", check)
      ro.disconnect()
    }
  }, [containerRef])

  const scrollToBottom = () => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" })
  }

  return (
    <div className={`sticky bottom-14 z-20 flex justify-center pointer-events-none ${className}`}>
      <Button
        variant="outline"
        size="icon"
        onClick={scrollToBottom}
        aria-label="Scroll to bottom"
        className={`pointer-events-auto rounded-full border-2 border-primary/20 shadow-lg bg-primary text-primary-foreground ${
          show ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ArrowDown className="size-5" />
      </Button>
    </div>
  )
}
