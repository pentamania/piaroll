import {SVG_NAMESPACE} from "../config";
import EventEmitter from 'wolfy87-eventemitter';
const DEFAULT_FILL = "#FE7A8E";
const HITBOX_WIDTH = 4;

/**
 * class NoteRect
 */
export class NoteRect extends EventEmitter {

  private _width = 0
  private _tick = 0
  private _trackId = 0
  private _activeStrokeStyle = "#FFF"
  private _fillStyle
  private _selected = false
  private _image
  private _index: number
  private _id: number
  duration: number
  svgElement: SVGSVGElement
  rectElement: SVGRectElement
  hitBoxElement: SVGRectElement
  tempStartX: number
  tempStartY: number

  constructor(color: string = DEFAULT_FILL) {
    super();
    // TODO: グループ化するため、svgにする
    this.svgElement = document.createElementNS(SVG_NAMESPACE, "svg");

    this.rectElement = document.createElementNS(SVG_NAMESPACE, "rect");
    // this.svgElement = document.createElementNS(SVG_NAMESPACE, "rect");
    this.rectElement.setAttribute('stroke-width', "2");
    this.fill = color;
    this.svgElement.appendChild(this.rectElement);

    // TODO: 伸ばし判定用の端矩形
    this.hitBoxElement = document.createElementNS(SVG_NAMESPACE, "rect");
    this.hitBoxElement.setAttribute('width', String(HITBOX_WIDTH));
    this.hitBoxElement.setAttribute('fill', "#ff0000");
    this.svgElement.appendChild(this.hitBoxElement);

    this._debugTextElement = document.createElementNS(SVG_NAMESPACE, "text")
    this._debugTextElement.setAttribute('y', "16");
    this.svgElement.appendChild(this._debugTextElement);
    // TODO: 画像を追加できるようにする
  }


  get id() { return this._id; }
  set id(v) {
    this._id = v;
    // this._debugTextElement.textContent = v;
  }
  // get index() { return this._index; }
  // set index(v) {
  //   this._index = v;
  //   this._debugTextElement.textContent = v;
  // }

  get width() { return this._width; }
  set width(v) {
    this._width = v;
    this.rectElement.setAttribute("width", String(v));
    this.hitBoxElement.setAttribute("x", String(v - HITBOX_WIDTH));
  }
  set height(v) {
    this.rectElement.setAttribute("height", String(v));
    this.hitBoxElement.setAttribute('height', String(v));
  }
  get x() { return Number(this.svgElement.getAttribute('x'));}
  set x(v) {
    this.svgElement.setAttribute('x', v);
    // this.rectElement.setAttribute('x', v);
  }
  get y() { return Number(this.svgElement.getAttribute('y')); }
  set y(v) {
    this.svgElement.setAttribute('y', v);
    // this.rectElement.setAttribute('y', v);
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
    parent.appendChild(this.svgElement);
    // console.log(this.svgElement.parentElement);
  }

  remove() {
    this.svgElement.parentElement.removeChild(this.svgElement);
    this.emit('removed');
  }

  addEventListener(...v) {
    this.rectElement.addEventListener(v[0], v[1])
  }
  removeEventListener(...v) {
    this.rectElement.removeEventListener(v[0], v[1])
  }

}