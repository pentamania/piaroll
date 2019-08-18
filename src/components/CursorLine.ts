import { AbstractElement } from './abstracts/AbstractElement';
import { createDiv } from '../utils';
import { CSS_CLASS_CURSOR_LINE } from '../cssSelectors';
import { CURSOR_LINE_WIDTH, CURSOR_LINE_COLOR } from '../config';

export class CursorLine extends AbstractElement {

  constructor() {
    super();
    const el = this.element = createDiv();
    el.style.position = "absolute";
    el.classList.add(CSS_CLASS_CURSOR_LINE);
    el.style.background = CURSOR_LINE_COLOR; // REVIEW: user setting

    this.width = CURSOR_LINE_WIDTH;
    this.y = 0;
  }

  protected _x = 0
  get x() { return this._x; }
  set x(v) {
    this._x = v;
    this.element.style.left = v - this.width/2 + "px";
  }

  protected _y = 0
  get y() { return this._y; }
  set y(v) {
    this._y = v;
    this.element.style.top = v + "px";
  }

  protected _width = 0
  get width() { return this._width; }
  set width(v) {
    this._width = v;
    this.element.style.width = v+"px";
  }

  protected _height = 0
  get height() { return this._height; }
  set height(v) {
    this._height = v;
    this.element.style.height = v + "px";
  }

}