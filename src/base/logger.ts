export class Logger {

  public static LEVEL_DEBUG: number = 0;
  public static LEVEL_ERROR: number = 1;
  public static LEVEL_INFO: number = 2;

  public static level: number = Logger.LEVEL_DEBUG;

  public static debug(...messages: any[]) {
    if (Logger.level <= Logger.LEVEL_DEBUG) {
      console.log(...messages);
    }
  }

  public static error(...messages: any[]) {
    if (Logger.level <= Logger.LEVEL_ERROR) {
      console.error(...messages);
    }
  }

}
