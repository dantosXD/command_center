/**
 * Production-ready logging utility
 * Logs errors to console in development and can be extended to send to monitoring services
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV || false;
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Log informational message
   */
  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '');
    }
    // In production, could send to monitoring service
    this.sendToMonitoring(LogLevel.INFO, message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext) {
    console.warn(`[WARN] ${message}`, context || '');
    this.sendToMonitoring(LogLevel.WARN, message, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error;

    console.error(`[ERROR] ${message}`, {
      ...context,
      error: errorDetails,
    });

    this.sendToMonitoring(LogLevel.ERROR, message, {
      ...context,
      error: errorDetails,
    });
  }

  /**
   * Send logs to monitoring service (e.g., Sentry, LogRocket)
   * Placeholder for production monitoring integration
   */
  private sendToMonitoring(level: LogLevel, message: string, context?: LogContext) {
    // In production, integrate with monitoring service
    // Example: Sentry.captureMessage(message, { level, extra: context });

    // For now, just ensure we don't spam in development
    if (!this.isDevelopment && level === LogLevel.ERROR) {
      // Could send to API endpoint for centralized logging
      // fetch('/api/logs', {
      //   method: 'POST',
      //   body: JSON.stringify({ level, message, context, timestamp: new Date().toISOString() })
      // }).catch(() => {});
    }
  }

  /**
   * Track user action for analytics
   */
  trackEvent(eventName: string, properties?: Record<string, any>) {
    if (this.isDevelopment) {
      console.log(`[EVENT] ${eventName}`, properties || '');
    }

    // In production, send to analytics service
    // Example: analytics.track(eventName, properties);
  }
}

export const logger = new Logger();
