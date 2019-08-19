import { AbstractElement } from './AbstractElement';

/**
 * @class AbstractSvgComponent
 */
export abstract class AbstractSvgComponent extends AbstractElement {

  protected _x = 0
  // get x() { return Number(this.rectElement.getAttribute('x')); }
  get x() { return this._x; }
  set x(v) {
    this._x = v;
    this.element.setAttribute('x', String(v));
  }

  protected _y = 0
  // get y() { return Number(this.rectElement.getAttribute('y')); }
  get y() { return this._y; }
  set y(v) {
    this._y = v;
    this.element.setAttribute('y', String(v));
  }

  protected _width = 0
  get width() { return this._width; }
  set width(v) {
    this._width = v;
    this.element.setAttribute("width", String(v));
  }

  protected _height = 0
  get height() { return this._height; }
  set height(v) {
    this._height = v;
    this.element.setAttribute("height", String(v));
  }

  protected _fillStyle
  get fill() { return this._fillStyle; };
  set fill(v) {
    this._fillStyle = v;
    this.element.setAttribute('fill', v);
  }

  // get visible() { return; };
  set visible(v: boolean) {
    if (v === true) {
      this.element.setAttribute('visibility', 'visible');
    } else {
      this.element.setAttribute('visibility', 'hidden');
    }
  }
}