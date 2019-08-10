import { SVG_NAMESPACE } from "../config";
import { AbstractSvgComponent } from "./abstracts/AbstractSvgComponent";

/**
 * @class SVGImage
 * Wrapper class of svg-image
 */
export class SVGImage extends AbstractSvgComponent {

  constructor() {
    super();
    this.element = document.createElementNS(SVG_NAMESPACE, "image");
  }

  setImage(v: string): Promise<null> {
    let image = new Image();
    image.src = v;
    return new Promise((resolve, reject)=> {
      this.element.setAttribute('href', v);
      image.onload = ()=> {
        this._width = image.width;
        this._height = image.height;
        image = null;
        resolve();
      }
      image.onerror = reject;
    });
  }
}