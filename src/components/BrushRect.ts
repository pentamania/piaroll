import { SVG_NAMESPACE } from "../config";
import EventEmitter from 'wolfy87-eventemitter';
const DEFAULT_FILL = "rgba(255,255,255, 0.4)";

/**
 * @class BrushRect
 */
export class BrushRect extends EventEmitter {

  private _x = 0
  private _y = 0
  private _width = 0
  private _height = 0
  private _fillStyle
  rectElement: SVGRectElement

  constructor(color: string = DEFAULT_FILL) {
    super();
    this.rectElement = document.createElementNS(SVG_NAMESPACE, "rect");
    this.fill = color;
  }

  // get x() { return Number(this.rectElement.getAttribute('x')); }
  get x() { return this._x; }
  set x(v) {
    this._x = v;
    this.rectElement.setAttribute('x', String(v));
  }
  // get y() { return Number(this.rectElement.getAttribute('y')); }
  get y() { return this._y; }
  set y(v) {
    this._y = v;
    this.rectElement.setAttribute('y', String(v));
  }
  get width() { return this._width; }
  set width(v) {
    this._width = v;
    this.rectElement.setAttribute("width", String(v));
  }
  get height() { return this._height; }
  set height(v) {
    this._height = v;
    this.rectElement.setAttribute("height", String(v));
  }
  get fill() { return this._fillStyle; };
  set fill(v) {
    this._fillStyle = v;
    this.rectElement.setAttribute('fill', v);
  }
  // get visible() { return; };
  set visible(v: boolean) {
    if (v === true) {
      this.rectElement.setAttribute('visibility', 'visible');
    } else {
      this.rectElement.setAttribute('visibility', 'hidden');
    }
  }

  append(parent) {
    parent.appendChild(this.rectElement);
  }
}