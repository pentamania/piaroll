import { createDiv, shallowDiff, arrayItemSimpleDiff, cloneObj } from "../utils";
import { HEADER_DEFAULT_STATE as defaultState, TRACK_PROP_HEIGHT } from "../config";
import { StrOrNum } from "../config";
import { CSS_CLASS_TRACK_HEADER, CSS_CLASS_TRACK_HEADER_BUTTON, CSS_CLASS_TRACK_HEADER_LABEL } from "../cssSelectors";
const KEY_PROP = 'key';
const initialState = {
  tracks: [],
}

/**
 * @class HeaderComponent
 * header HTML wrapper component
 */
class HeaderComponent {

  element: HTMLDivElement
  id: number
  private _labelArea
  private _muteButton
  private _isActive: boolean = true;

  get parent() {return this.element.parentElement; }
  set height(v: StrOrNum) {
    if (typeof v === 'number') {
      this.element.style.height = v + "px";
      this.element.style.lineHeight = v + "px";
    } else  {
      this.element.style.height = v;
      this.element.style.lineHeight = v;
    }
  }
  set text(v: string) {
    this._labelArea.innerText = v;
  }
  get active() {return this._isActive}
  set active(v: boolean) {
    // TODO: darken if in-active
    if (v === true) {
      this._isActive = true;
      this._muteButton.style.background = "green";
    } else {
      this._isActive = false;
      this._muteButton.style.background = "white";
    }
  }

  constructor(addButton = true) {
    var el = this.element = createDiv();
    el.style.width = "100%";
    el.style.boxSizing = 'border-box';
    el.style.borderBottom = "1px solid gray";
    el.style.borderTop = "1px solid gray";
    el.style.background = "#6B6B70";
    el.className = CSS_CLASS_TRACK_HEADER;

    // mute button area: WIP
    if (addButton) {
      var muteButton = this._muteButton = document.createElement('span')
      muteButton.style.width = "12px";
      muteButton.style.height = "12px";
      muteButton.style.boxSizing = 'border-box';
      muteButton.style.borderRadius = "50%";
      muteButton.style.display = "inline-block";
      this.active = true;
      muteButton.addEventListener('click', (e)=> {
        // TODO: dispatch isMute prop change
        this.active = (this.active) ? false : true;
      })
      muteButton.className = CSS_CLASS_TRACK_HEADER_BUTTON;
      el.appendChild(muteButton);
    }

    var la = this._labelArea = document.createElement('span');
    la.className = CSS_CLASS_TRACK_HEADER_LABEL;
    el.appendChild(la);
  }

  appendTo(parent: HTMLElement) {
    parent.appendChild(this.element)
  }

  remove() {
    if (this.parent) this.parent.removeChild(this.element)
  }
}

/**
 * @class TrackHeader
 */
export class TrackHeader {

  container: HTMLDivElement
  private _state = cloneObj(initialState);
  private _headers: HeaderComponent[] = []

  constructor() {
    this.container = createDiv();
    this.render(this._state);
  }

  // private _clearContainer() {
  //   while (this.container.lastChild) {
  //     this.container.removeChild(this.container.lastChild);
  //   }
  // }

  render(newState) {
    newState = Object.assign({}, defaultState, newState);
    const paramDiff = shallowDiff(this._state, newState);
    const trackDiff = arrayItemSimpleDiff(this._state.tracks, newState.tracks, KEY_PROP)

    this._state = newState;

    trackDiff.forEach( diff => {
      let targetHeader
      // TODO: add/edit style setting
      switch (diff.kind) {
        case "new":
          var newHeader = (diff.value['muted'] != null) ? new HeaderComponent() : new HeaderComponent(false);
          newHeader.text = diff.value['label'];
          newHeader.height = newState.trackHeight;
          newHeader.id = diff.value[KEY_PROP];
          newHeader.appendTo(this.container);
          this._headers.push(newHeader);
          break;
        case "edit":
          const prop = diff.value[0];
          const val = diff.value[1];
          targetHeader = this._headers.find((header) => {
            return header.id == diff.key;
          });
          if (targetHeader) targetHeader[prop] = val;
          break;
        case "remove":
          targetHeader = this._headers.find((header) => {
            return header.id == diff.key;
          });
          if (targetHeader) targetHeader.remove();
          break;
      }
    });

    paramDiff.forEach((d) => {
      // const key = d.path[0];
      const key = d.key;
      if (key === TRACK_PROP_HEIGHT) {
        this._headers.forEach((header) => {
          header.height = d.value;
        });
      }
    });
  }

  /**
   * append to specified element
   */
  appendTo(parent: SVGElement | HTMLElement) {
    parent.appendChild(this.container);
    return this;
  }

}