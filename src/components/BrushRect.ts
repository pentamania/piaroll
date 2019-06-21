import { SVG_NAMESPACE } from "../config";
import { AbstractSvgComponent } from './abstracts/AbstractSvgComponent';
const DEFAULT_FILL = "rgba(255,255,255, 0.4)";

/**
 * @class BrushRect
 */
export class BrushRect extends AbstractSvgComponent {

  constructor(color: string = DEFAULT_FILL) {
    super();
    this.element = document.createElementNS(SVG_NAMESPACE, "rect");
    this.fill = color;
  }
}