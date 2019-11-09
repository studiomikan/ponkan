export class Logger {
  public static LEVEL_ERROR: number = 4;
  public static LEVEL_WARN: number = 3;
  public static LEVEL_INFO: number = 2;
  public static LEVEL_DEBUG: number = 1;
  public static LEVEL_TRACE: number = 0;

  public static level: number = Logger.LEVEL_INFO;

  public static error(...messages: any[]): void {
    if (Logger.level <= Logger.LEVEL_ERROR) {
      console.error(...messages);
    }
  }

  public static WARN(...messages: any[]): void {
    if (Logger.level <= Logger.LEVEL_WARN) {
      if (window.console.warn) {
        console.warn(...messages);
      } else {
        console.log(...messages);
      }
    }
  }

  public static info(...messages: any[]): void {
    if (Logger.level <= Logger.LEVEL_INFO) {
      console.log(...messages);
    }
  }

  public static debug(...messages: any[]): void {
    if (Logger.level <= Logger.LEVEL_DEBUG) {
      console.log(...messages);
    }
  }

  public static trace(...messages: any[]): void {
    if (Logger.level <= Logger.LEVEL_TRACE) {
      console.log(...messages);
    }
  }
}
