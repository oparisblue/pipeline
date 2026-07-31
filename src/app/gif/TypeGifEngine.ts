import { TypeOption } from "types";
import { gifEngines } from "./engines";

/**
 * @classdesc A dropdown for picking which GIF encoding engine to use.
 * @author Simon
 */
export class TypeGifEngine extends TypeOption {
  public getOptions(): string[] {
    return gifEngines.map((engine) => engine.getName());
  }

  public getName(): string {
    return "Engine";
  }
}
