export class Logger {
  
  public static LEVEL_DEBUG: number = 0;
  public static LEVEL_INFO: number = 1;

  public static level: number = Logger.LEVEL_DEBUG;

  public static debug(...messages: any[]) {
    if (Logger.level >= Logger.LEVEL_DEBUG) {
      console.log(...messages);
    }
  }
}
