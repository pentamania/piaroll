import deef from "deep-diff";
import { createDiv } from "../utils";

/**
 * @class TrackHeader
 */
export class TrackHeader {
  private _state = {
    trackNum: 1,
    trackHeight: 60,
  };
  container: HTMLDivElement

  constructor() {
    this.container = createDiv();
    this.render(this._state);
  }

  private _clearContainer() {
    while (this.container.lastChild) {
      this.container.removeChild(this.container.lastChild);
    }
  }

  render(newState) {
    let redrawFlag = false;
    const diff = deef(this._state, newState);

    if (diff != null) {
      diff.forEach( (d)=> {
        const key = d.path[0];
        if (key === "trackNum" || key === "trackHeight") {
          redrawFlag = true;
        }
      });
    }
    if (redrawFlag) {
      // TODO:差分変換にする？
      this._clearContainer();
      for (let i = 0; i < newState.trackNum; i++) {
        const li = document.createElement('div');
        li.style.width = "100%";
        li.style.height = newState.trackHeight + "px";
        li.style.lineHeight = newState.trackHeight + "px";
        li.style.boxSizing = 'border-box';
        // li.style.textAlign = "center";

        li.style.borderBottom = "1px solid gray";
        li.style.borderTop = "1px solid gray";
        li.style.background = "#6B6B70";

        li.innerText = "Track " + i;
        this.container.appendChild(li);
      }
    }
  }

  append(parent) {
    parent.appendChild(this.container);
    return this;
  }
}