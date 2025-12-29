const isDev = process.env.NODE_ENV === "development"

type LogLevel = "debug" | "info" | "warn" | "error"

const colors = {
  debug: "\x1b[36m",
  info: "\x1b[32m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
  reset: "\x1b[0m",
  dim: "\x1b[2m"
}

const formatDuration = (ms: number) => {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`
  if (ms < 1000) return `${ms.toFixed(1)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

const log = (level: LogLevel, context: string, message: string, meta?: Record<string, unknown>) => {
  if (!isDev && level === "debug") return

  const timestamp = new Date().toISOString().slice(11, 23)
  const color = colors[level]
  const prefix = `${colors.dim}${timestamp}${colors.reset} ${color}[${level.toUpperCase()}]${colors.reset}`
  const ctx = `${colors.dim}[${context}]${colors.reset}`

  if (meta) {
    console.log(`${prefix} ${ctx} ${message}`, meta)
  } else {
    console.log(`${prefix} ${ctx} ${message}`)
  }
}

export const logger = {
  debug: (context: string, message: string, meta?: Record<string, unknown>) =>
    log("debug", context, message, meta),
  info: (context: string, message: string, meta?: Record<string, unknown>) =>
    log("info", context, message, meta),
  warn: (context: string, message: string, meta?: Record<string, unknown>) =>
    log("warn", context, message, meta),
  error: (context: string, message: string, meta?: Record<string, unknown>) =>
    log("error", context, message, meta)
}

export const withTiming = async <T>(
  context: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = performance.now()
  try {
    const result = await fn()
    const duration = performance.now() - start
    logger.debug(context, `${operation} completed`, { duration: formatDuration(duration) })
    return result
  } catch (error) {
    const duration = performance.now() - start
    logger.error(context, `${operation} failed`, {
      duration: formatDuration(duration),
      error: error instanceof Error ? error.message : "Unknown error"
    })
    throw error
  }
}
