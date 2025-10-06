import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// Log entry interface
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: any;
}

class Logger {
  private logFile: string;
  private logLevel: LogLevel;
  
  constructor(logLevel: LogLevel = 'info') {
    // Use built-in Date methods instead of date-fns
    const now = new Date();
    const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    this.logFile = path.join(logsDir, `app-${dateString}.log`);
    this.logLevel = logLevel;
  }
  
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex <= currentLevelIndex;
  }
  
  private writeLog(level: LogLevel, message: string, meta?: any) {
    if (!this.shouldLog(level)) {
      return;
    }
    
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta
    };
    
    const logString = JSON.stringify(logEntry) + '\n';
    
    // Write to file
    fs.appendFileSync(this.logFile, logString);
    
    // Also log to console in development
    if (process.env['NODE_ENV'] !== 'production') {
      console.log(`[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}`);
      if (meta) {
        console.log(meta);
      }
    }
  }
  
  error(message: string, meta?: any) {
    this.writeLog('error', message, meta);
  }
  
  warn(message: string, meta?: any) {
    this.writeLog('warn', message, meta);
  }
  
  info(message: string, meta?: any) {
    this.writeLog('info', message, meta);
  }
  
  debug(message: string, meta?: any) {
    this.writeLog('debug', message, meta);
  }
}

// Create a default logger instance
const logger = new Logger(process.env['LOG_LEVEL'] as LogLevel || 'info');

export default logger;
export { Logger };