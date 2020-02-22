import { Ponkan3 } from "../src/ts/ponkan3";
import { Ponkan3Settings } from "./settings";

export function createPonkan(): Ponkan3 {
  return new Ponkan3("ponkan3game", Ponkan3Settings);
}

export function destroyPonkan(ponkan: Ponkan3): void {
  try {
    ponkan.destroy();
  } catch (e) {
    console.error(e);
  }
}
