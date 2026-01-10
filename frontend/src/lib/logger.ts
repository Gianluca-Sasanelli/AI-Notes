type LogLevel = "debug" | "info" | "warn" | "error"

const formatDuration = (ms: number) => {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`
  if (ms < 1000) return `${ms.toFixed(1)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

const log = (level: LogLevel, context: string, message: string, meta?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString().slice(11, 23)
  const prefix = `${timestamp} [${level.toUpperCase()}]`
  const ctx = `[${context}]`
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
