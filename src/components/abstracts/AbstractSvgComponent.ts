import EventEmitter from 'wolfy87-eventemitter';

/**
 * @class AbstractSvgComponent
 */
export class AbstractSvgComponent extends EventEmitter {

  protected _x = 0
  protected _y = 0
  protected _width = 0
  protected _height = 0
  protected _fillStyle
  element: SVGElement

  // get x() { return Number(this.rectElement.getAttribute('x')); }
  get x() { return this._x; }
  set x(v) {
    this._x = v;
    this.element.setAttribute('x', String(v));
  }
  // get y() { return Number(this.rectElement.getAttribute('y')); }
  get y() { return this._y; }
  set y(v) {
    this._y = v;
    this.element.setAttribute('y', String(v));
  }
  get width() { return this._width; }
  set width(v) {
    this._width = v;
    this.element.setAttribute("width", String(v));
  }
  get height() { return this._height; }
  set height(v) {
    this._height = v;
    this.element.setAttribute("height", String(v));
  }
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
  get parent() { return this.element.parentElement }

  append(parent) {
    parent.appendChild(this.element);
    return this;
  }

  remove() {
    this.parent.removeChild(this.element);
    this.emit('removed');
    return this;
  }
}