import { Ponkan } from "../src/ts/ponkan";
import { PonkanSettings } from "./settings";

export function createPonkan(): Ponkan {
  return new Ponkan("ponkangame", PonkanSettings);
}

export function destroyPonkan(ponkan: Ponkan): void {
  try {
    ponkan.destroy();
  } catch (e) {
    console.error(e);
  }
}
