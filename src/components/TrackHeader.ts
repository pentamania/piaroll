import { createDiv, shallowDiff, arrayItemSimpleDiff, cloneObj } from "../utils";
import { HEADER_DEFAULT_STATE as defaultState, TRACK_PROP_HEIGHT, TRACK_HEADER_PROP_LABEL, TRACK_HEADER_PROP_KEY, TrackHeaderState } from "../config";
import { StrOrNum } from "../config";
import { CSS_CLASS_TRACK_HEADER, CSS_CLASS_TRACK_HEADER_BUTTON, CSS_CLASS_TRACK_HEADER_LABEL } from "../cssSelectors";
import { AbstractElement } from "./abstracts/AbstractElement";

const initialState = {
  tracks: [],
}

/**
 * @class HeaderComponent
 * header HTML wrapper component
 */
class HeaderComponent extends AbstractElement {

  constructor(addButton = true) {
    super();
    var el = this.element = createDiv();

    // TODO: remove default style
    el.style.width = "100%";
    el.style.boxSizing = 'border-box';
    el.style.borderBottom = "1px solid gray";
    el.style.borderTop = "1px solid gray";
    el.style.background = "#6B6B70";
    el.className = CSS_CLASS_TRACK_HEADER;

    // TODO: mute button area setup
    if (addButton) {
      var muteButton = this._muteButton = document.createElement('span')
      muteButton.style.width = "12px";
      muteButton.style.height = "12px";
      muteButton.style.boxSizing = 'border-box';
      muteButton.style.borderRadius = "50%";
      muteButton.style.display = "inline-block";
      this.active = true;
      muteButton.addEventListener('click', (e) => {
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

  key: string
  private _muteButton
  private _labelArea

  set height(v: StrOrNum) {
    if (typeof v === 'number') {
      this.element.style.height = v + "px";
      this.element.style.lineHeight = v + "px";
    } else {
      this.element.style.height = v;
      this.element.style.lineHeight = v;
    }
  }

  set text(v: string) {
    this._labelArea.innerText = v;
  }

  // TODO: remove?
  private _isActive: boolean = true;
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

}

/**
 * @class TrackHeader
 */
export class TrackHeader extends AbstractElement {

  constructor() {
    super();
    this.element = createDiv();
    this.render(this._state);
  }

  private _state: TrackHeaderState = cloneObj(initialState);
  private _headers: HeaderComponent[] = []

  // private _clearContainer() {
  //   while (this.container.lastChild) {
  //     this.container.removeChild(this.container.lastChild);
  //   }
  // }

  render(newState: TrackHeaderState) {
    newState = Object.assign({}, defaultState, newState);
    // console.log('header newState', newState);
    const paramDiff = shallowDiff(this._state, newState);
    const trackDiff = arrayItemSimpleDiff(this._state.tracks, newState.tracks, TRACK_HEADER_PROP_KEY)

    this._state = newState;

    trackDiff.forEach( diff => {
      switch (diff.kind) {
        case "new":
          var newHeader = (diff.value['muted'] != null) ? new HeaderComponent() : new HeaderComponent(false);
          newHeader.text = diff.value[TRACK_HEADER_PROP_LABEL];
          newHeader.height = newState.trackHeight;
          newHeader.key = diff.value[TRACK_HEADER_PROP_KEY];

          newHeader.appendTo(this.element);
          this._headers.push(newHeader);
          break;

        case "edit":
          // console.log('header edit', diff);
          const editedProp = diff.value[0];
          const newVal = diff.value[1];
          this._headers.some((header) => {
            if (header.key === diff.key) {
              switch (editedProp) {
                case TRACK_HEADER_PROP_LABEL:
                  header.text = newVal;
                  break;
              }
              return true;
            };
          });
          break;

        case "remove":
          // console.log('header removing', diff);
          this._headers.some((header, i) => {
            if (header.key === diff.key) {
              this._headers.splice(i, 1);
              header.remove();
              return true;
            };
          });
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

}