import {SVG_NAMESPACE} from "../config";
import EventEmitter from 'wolfy87-eventemitter';
const DEFAULT_FILL = "#FE7A8E";
const STROKE_WIDTH = 2;
const ACTIVE_STROKE_STYLE = "#FFF";
const EXTENSION_RECT_WIDTH = 4;
const EXTENSTION_RECT_FILL = "#ce3939";

/**
 * @class NoteRect
 */
export class NoteRect extends EventEmitter {

  private _x = 0
  private _y = 0
  private _width = 0
  private _height = 0
  private _tick = 0
  private _trackId = 0
  private _activeStrokeStyle = ACTIVE_STROKE_STYLE
  private _fillStyle
  private _selected = false
  private _id: number
  duration: number
  tempStartX: number
  tempStartY: number

  private containerElement: SVGSVGElement
  rectElement: SVGRectElement
  hitBoxElement: SVGRectElement
  private _debugTextElement

  constructor(color: string = DEFAULT_FILL) {
    super();

    // container svg
    this.containerElement = document.createElementNS(SVG_NAMESPACE, "svg");

    // main rect svg
    this.rectElement = document.createElementNS(SVG_NAMESPACE, "rect");
    // this.svgElement = document.createElementNS(SVG_NAMESPACE, "rect");
    this.rectElement.setAttribute('stroke-width', String(STROKE_WIDTH));
    this.fill = color;
    this.containerElement.appendChild(this.rectElement);

    // extension rect on edge
    this.hitBoxElement = document.createElementNS(SVG_NAMESPACE, "rect");
    this.hitBoxElement.setAttribute('width', String(EXTENSION_RECT_WIDTH));
    this.hitBoxElement.setAttribute('fill', EXTENSTION_RECT_FILL);
    this.containerElement.appendChild(this.hitBoxElement);

    this._debugTextElement = document.createElementNS(SVG_NAMESPACE, "text")
    this._debugTextElement.setAttribute('y', "16");
    this.containerElement.appendChild(this._debugTextElement);

    // TODO: 画像を追加できるようにする
  }

  get id() { return this._id; }
  set id(v) {
    this._id = v;
    // this._debugTextElement.textContent = v;
  }
  // get x() { return Number(this.svgElement.getAttribute('x')); }
  get x() { return this._x; }
  set x(v: number) {
    this._x = v;
    this.containerElement.setAttribute('x', String(v));
    // this.rectElement.setAttribute('x', v);
  }
  get y() { return this._y; }
  set y(v: number) {
    this._y = v;
    this.containerElement.setAttribute('y', String(v));
    // this.rectElement.setAttribute('y', v);
  }
  get width() { return this._width; }
  set width(v) {
    this._width = v;
    this.rectElement.setAttribute("width", String(v));
    this.hitBoxElement.setAttribute("x", String(v - EXTENSION_RECT_WIDTH));
  }
  get height() { return this._height; }
  set height(v) {
    this._height = v;
    this.rectElement.setAttribute("height", String(v));
    this.hitBoxElement.setAttribute('height', String(v));
  }
  get selected() { return this._selected; }
  set selected(v) {
    if (v === true) {
      this._selected = true;
      this.rectElement.setAttribute('stroke', this._activeStrokeStyle);
    } else {
      this._selected = false;
      this.rectElement.setAttribute('stroke', null);
    }
  }

  get tick() { return this._tick; }
  set tick(v: number) { this._tick = v; }

  get trackId() { return this._trackId; }
  set trackId(v: number) { this._trackId = v; }

  get fill() { return this._fillStyle; };
  set fill(v) {
    this._fillStyle = v;
    this.rectElement.setAttribute('fill', v);
  }

  append(parent) {
    parent.appendChild(this.containerElement);
  }

  remove() {
    this.containerElement.parentElement.removeChild(this.containerElement);
    this.emit('removed');
  }

  addEventListener(...v) {
    this.rectElement.addEventListener(v[0], v[1])
  }
  removeEventListener(...v) {
    this.rectElement.removeEventListener(v[0], v[1])
  }

}