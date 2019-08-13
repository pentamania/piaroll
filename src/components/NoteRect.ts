import {SVG_NAMESPACE, CSS_CLASS_NOTE_RECT_EXTENSION_RECT, CSS_CLASS_NOTE_RECT_INPUT_LABEL, _EVENT_NOTERECT_REMOVED, NOTE_RECT_ACTIVE_STROKE_STYLE, NOTE_RECT_INPUT_ELEMENT_HEIGHT, EXTENSION_RECT_WIDTH, NOTE_RECT_INPUT_ELEMENT_WIDTH, NOTE_RECT_DEFAULT_FILL, NOTE_RECT_STROKE_WIDTH, EXTENSTION_RECT_FILL, EVENT_REMOVE_NOTE, NOTE_RECT_INPUT_ELEMENT_LEFT, CSS_CLASS_NOTE_RECT_IMAGE} from "../config";
import EventEmitter from 'wolfy87-eventemitter';
import { SVGImage } from "./SVGImage";

/**
 * @class NoteRect
 * TODO: refactor getter/setters
 */
export class NoteRect extends EventEmitter {

  private _x = 0
  private _y = 0
  private _width = 0
  private _height = 0
  private _tick = 0
  private _trackId = 0
  private _activeStrokeStyle = NOTE_RECT_ACTIVE_STROKE_STYLE
  private _fillStyle
  private _selected = false
  private _removable = true
  private _shiftable = true
  private _isInputting: boolean = false
  private _id: number
  duration: number
  tempStartX: number
  tempStartY: number

  /* elements */
  private _containerElement: SVGSVGElement
  private _debugTextElement
  private _rectElement: SVGRectElement
  private _foreignInputWrapper: SVGForeignObjectElement
  inputElement: HTMLInputElement
  extensionElement: SVGRectElement

  /* accesssors */
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
    if (this.extensionElement != null) {
      this.extensionElement.setAttribute('height', String(v));
    }
    if (this._foreignInputWrapper) {
      this._foreignInputWrapper.setAttribute('y', String((v - NOTE_RECT_INPUT_ELEMENT_HEIGHT)*0.5));
    }
    if (this._imageSVG) {
      this._imageSVG.y = (this._height - this._imageSVG.height) * 0.5;
    }
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
  get removable() { return this._removable && !this._isInputting; }
  // set removable(v: boolean) { this._removable = v; }
  get shiftable() { return this._shiftable; }
  get tick() { return this._tick; }
  set tick(v: number) { this._tick = v; }
  get trackId() { return this._trackId; }
  set trackId(v: number) { this._trackId = v; }
  get fill() { return this._fillStyle; };
  set fill(v) {
    this._fillStyle = v;
    this._rectElement.setAttribute('fill', v);
  }
  get inputValue() { return this.inputElement.value };
  set inputValue(v:number|string) {
    if (!this.inputElement) {
      var fi = this._foreignInputWrapper = document.createElementNS(SVG_NAMESPACE, "foreignObject");
      fi.setAttribute('width', String(NOTE_RECT_INPUT_ELEMENT_WIDTH));
      fi.setAttribute('height', String(NOTE_RECT_INPUT_ELEMENT_HEIGHT));
      fi.setAttribute('x', String(NOTE_RECT_INPUT_ELEMENT_LEFT));
      fi.setAttribute('y', String(this.height));
      this._containerElement.appendChild(fi)

      var input = this.inputElement = document.createElement('input');
      this.inputElement.type = (typeof v === 'number') ? 'number' : 'text';
      input.className = CSS_CLASS_NOTE_RECT_INPUT_LABEL;
      input.style.position = "absolute";
      input.style.padding = "0";
      input.style.border = "none";
      input.style.background = "transparent";
      // input.style.width = INPUT_ELEMENT_WIDTH+"px";

      // REVIEW: prevent chart mouse event propagation
      ['mouseup', 'mousedown'].forEach((eventName)=> {
        const handler = (e) => {
          e.stopPropagation();
        };
        input.addEventListener(eventName, handler, false);
        this.once(_EVENT_NOTERECT_REMOVED, ()=> {
          input.removeEventListener(eventName, handler, false);
        })
      });

      // disable note removing while input
      ['focus', 'blur'].forEach((eventName)=> {
        const handler = (e) => {
          e.stopPropagation();
          this._isInputting = (eventName === 'focus') ? true : false;
        };
        input.addEventListener(eventName, handler, false);
        this.once(_EVENT_NOTERECT_REMOVED, () => {
          input.removeEventListener(eventName, handler, false);
        })
      })

      fi.appendChild(this.inputElement);
    }
    this.inputElement.value = String(v);
  }

  /**
   * image (experimental)
   */
  private _imageSVG: SVGImage
  set image(v: string) {
    let imageSVG = this._imageSVG;
    if (!imageSVG) {
      imageSVG = this._imageSVG = new SVGImage();
      imageSVG.element.style.pointerEvents = 'none'; // ignore mouse event
      imageSVG.classList = CSS_CLASS_NOTE_RECT_IMAGE;
      imageSVG.appendTo(this._containerElement);
    }
    imageSVG.setImage(v).then(()=> {
      // TODO: enable setting different postion?
      // imageSVG.x = (this._width - imageSVG.width) * 0.5;
      imageSVG.x = -imageSVG.width * 0.5;
      imageSVG.y = (this._height - imageSVG.height) * 0.5;
    });
  }

  set classList(v: string|string[]) {
    if (typeof v === 'string') {
      this._rectElement.setAttribute('class', v);
    } else{
      const listString: string = v.join(' ');
      this._rectElement.setAttribute('class', listString);
    }
  }

  /**
   * constructor
   */
  constructor(
    color: string = NOTE_RECT_DEFAULT_FILL,
    extendable: boolean|string = true,
    removable: boolean = true,
    shiftable: boolean = true,
  ) {
    super();

    // container-svg
    this._containerElement = document.createElementNS(SVG_NAMESPACE, "svg");
    this._containerElement.setAttribute('overflow', 'visible'); // avoid hiding image

    // main-rect-svg
    this._rectElement = document.createElementNS(SVG_NAMESPACE, "rect");
    // this.svgElement = document.createElementNS(SVG_NAMESPACE, "rect");
    this._rectElement.setAttribute('stroke-width', String(NOTE_RECT_STROKE_WIDTH));
    this.fill = color;
    this._containerElement.appendChild(this._rectElement);

    // extension-rect on edge
    if (extendable) {
      const fill = (typeof extendable === "string") ? extendable : EXTENSTION_RECT_FILL;
      const extel = this.extensionElement = document.createElementNS(SVG_NAMESPACE, "rect");
      extel.setAttribute('width', String(EXTENSION_RECT_WIDTH));
      extel.setAttribute('fill', fill);
      extel.setAttribute('style', CSS_CLASS_NOTE_RECT_EXTENSION_RECT);
      this._containerElement.appendChild(extel);
    }
    if (removable != null) this._removable = removable;
    if (shiftable != null) this._shiftable = shiftable;

    // TODO: remove later?
    this._debugTextElement = document.createElementNS(SVG_NAMESPACE, "text")
    this._debugTextElement.setAttribute('y', "16");
    this._containerElement.appendChild(this._debugTextElement);
  }

  appendTo(parent) {
    parent.appendChild(this._containerElement);
  }

  remove() {
    this._containerElement.parentElement.removeChild(this._containerElement);
    this.emit(_EVENT_NOTERECT_REMOVED);
  }

  addEventListener(...v) {
    this._rectElement.addEventListener(v[0], v[1])
  }

  removeEventListener(...v) {
    this._rectElement.removeEventListener(v[0], v[1])
  }

}