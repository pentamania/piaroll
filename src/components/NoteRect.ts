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

  private _containerElement: SVGSVGElement
  private _debugTextElement
  private _rectElement: SVGRectElement
  extensionElement: SVGRectElement

  constructor(
    color: string = DEFAULT_FILL,
    extendable:boolean|string = true
  ) {
    super();

    // container svg
    this._containerElement = document.createElementNS(SVG_NAMESPACE, "svg");

    // main rect svg
    this._rectElement = document.createElementNS(SVG_NAMESPACE, "rect");
    // this.svgElement = document.createElementNS(SVG_NAMESPACE, "rect");
    this._rectElement.setAttribute('stroke-width', String(STROKE_WIDTH));
    this.fill = color;
    this._containerElement.appendChild(this._rectElement);

    // extension rect on edge
    if (extendable) {
      const fill = (typeof extendable === "string") ? extendable : EXTENSTION_RECT_FILL;
      this.extensionElement = document.createElementNS(SVG_NAMESPACE, "rect");
      this.extensionElement.setAttribute('width', String(EXTENSION_RECT_WIDTH));
      this.extensionElement.setAttribute('fill', fill);
      this._containerElement.appendChild(this.extensionElement);
    }

    this._debugTextElement = document.createElementNS(SVG_NAMESPACE, "text")
    this._debugTextElement.setAttribute('y', "16");
    this._containerElement.appendChild(this._debugTextElement);

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
    this._containerElement.setAttribute('x', String(v));
    // this.rectElement.setAttribute('x', v);
  }
  get y() { return this._y; }
  set y(v: number) {
    this._y = v;
    this._containerElement.setAttribute('y', String(v));
    // this.rectElement.setAttribute('y', v);
  }
  get width() { return this._width; }
  set width(v) {
    this._width = v;
    this._rectElement.setAttribute("width", String(v));
    if (this.extensionElement != null) this.extensionElement.setAttribute("x", String(v - EXTENSION_RECT_WIDTH));
  }
  get height() { return this._height; }
  set height(v) {
    this._height = v;
    this._rectElement.setAttribute("height", String(v));
    if (this.extensionElement != null) this.extensionElement.setAttribute('height', String(v));
  }
  get selected() { return this._selected; }
  set selected(v) {
    if (v === true) {
      this._selected = true;
      this._rectElement.setAttribute('stroke', this._activeStrokeStyle);
    } else {
      this._selected = false;
      this._rectElement.setAttribute('stroke', null);
    }
  }

  get tick() { return this._tick; }
  set tick(v: number) { this._tick = v; }

  get trackId() { return this._trackId; }
  set trackId(v: number) { this._trackId = v; }

  get fill() { return this._fillStyle; };
  set fill(v) {
    this._fillStyle = v;
    this._rectElement.setAttribute('fill', v);
  }

  append(parent) {
    parent.appendChild(this._containerElement);
  }

  remove() {
    this._containerElement.parentElement.removeChild(this._containerElement);
    this.emit('removed');
  }

  addEventListener(...v) {
    this._rectElement.addEventListener(v[0], v[1])
  }
  removeEventListener(...v) {
    this._rectElement.removeEventListener(v[0], v[1])
  }

}