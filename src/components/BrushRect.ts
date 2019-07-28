import { SVG_NAMESPACE, BRUSH_DEFAULT_FILL } from "../config";
import { AbstractSvgComponent } from './abstracts/AbstractSvgComponent';

/**
 * @class BrushRect
 */
export class BrushRect extends AbstractSvgComponent {

  constructor(color: string = BRUSH_DEFAULT_FILL) {
    super();
    this.element = document.createElementNS(SVG_NAMESPACE, "rect");
    this.fill = color;
  }
}