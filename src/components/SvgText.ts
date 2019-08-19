import { SVG_NAMESPACE } from "../config";
import { AbstractSvgComponent } from "./abstracts/AbstractSvgComponent";

/**
 * @class SVGText
 * Wrapper class of vanilla svg
 */
export class SVGText extends AbstractSvgComponent {

  constructor() {
    super();
    const text = this.element = document.createElementNS(SVG_NAMESPACE, "text");
    text.setAttribute('fill', 'white');
    text.setAttribute('y', "50%");
    text.setAttribute('dominant-baseline', 'central'); // vertial align
    text.setAttribute('text-anchor', 'middle'); // horizontal align
  }

  set text(v:string) {
    this.element.textContent = v;
  }
  set fontSize(v:number|string) {
    this.element.setAttribute('font-size', String(v));
  }
}