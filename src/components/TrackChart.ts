// import EventEmitter from "EventEmitter";
// import deef from "deep-diff";
import { SVG_NAMESPACE, NOTE_ID_KEY } from "../config";
import {NoteRect} from "./NoteRect";
import {setTrackBackground} from "../drawBackground";
import { cloneObj, shallowDiff, arrayItemSimpleDiff } from "../utils";
import { TrackModel } from "../TrackModel";
import { KeyState as globalKeyState } from "../KeyState";
const DEFAULT_NOTE_WIDTH = 16;
// interface Note {
//   tick: number
//   length: number
//   trackId: number
//   selected: boolean
// }
// interface State {
//   barNum: number
//   barWidth: number
//   trackNum: number
//   trackHeight: number
//   currentTick: number,
//   notes: Note[]
// }

const defaultState = {
  resolution: 192,
  barNum: 1,
  barWidth: 80,
  trackNum: 1,
  trackHeight: 60,
  currentTick: 0,
  divNum: 4,
  notes: [],
}

/**
 * @class TrackComponent
 */
export class TrackChart {
  private _chartSvg: SVGSVGElement
  private _svgNoteLayer: SVGGElement
  private _svgLineLayer: SVGGElement
  private _currentLineRect: SVGRectElement

  private _chartWidth: number = 0
  private _chartHeight: number = 0
  // private _state = cloneObj(defaultState)
  private _state = { notes:[] }
  private _noteRects:NoteRect[] = []
  private _model: TrackModel
  // isWriteMode: boolean = false
  isWriteMode: boolean = true

  set model(v: TrackModel) { this._model = v; }

  constructor() {
    // main
    var chartSvg = this._chartSvg = document.createElementNS(SVG_NAMESPACE, "svg");
    chartSvg.style.boxSizing = 'border-box';
    chartSvg.style.display = 'block';
    chartSvg.style.borderBottom = 'solid 1px gray';

    // svg layers
    this._svgNoteLayer = document.createElementNS(SVG_NAMESPACE, "g");
    chartSvg.appendChild(this._svgNoteLayer);
    this._svgLineLayer = document.createElementNS(SVG_NAMESPACE, "g");
    chartSvg.appendChild(this._svgLineLayer);

    // current line
    var line = this._currentLineRect = document.createElementNS(SVG_NAMESPACE, "rect");
    line.setAttribute('width', "2");
    line.setAttribute('height', "200");
    line.setAttribute('y', "0");
    line.setAttribute('fill', "red");
    this._svgLineLayer.appendChild(line);

    // mouse/touch event
    // mouseupにするとノーツ移動の最後とかに引っかかる
    chartSvg.addEventListener('mousedown', (e)=> {
      console.log('chart mousedown');
      // ノーツ選択状態を全解除
      this._model.setAllNotes((note)=> {
        note.selected = false;
      });

      if (this.isWriteMode) {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // add note
        var noteX = this.snapToDiv(x);
        this._model.addNote({
          tick: this.xToTick(noteX),
          trackId: this.yToTrackId(y),
          selected: false,
        })
      } else {

      }

      // todo: brushの設定
    });

    // key event: トラック増やすと厄介？
    document.addEventListener('keydown', (e) => {
      // console.log(e.key)
      if (e.ctrlKey) {
        if (e.key === 'c') {
          // コピー

        } else if (e.key === 'x') {
          // 切り取り

        } else if (e.key === 'v') {
          // 貼り付け
        }
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        // 選択したノーツを消去
        let removedIds = [];
        this._noteRects.forEach((rect) => {
          if (rect.selected) {
            // console.warn('bss remove indx', rect.id);
            removedIds.push(rect.id);
            // this._model.removeNoteById(rect.id); // 即実行だとthis._noteRectsがmutated
          };
        })
        this._model.removeNoteById(removedIds);
      }
    })

    this.render(cloneObj(defaultState));
  }

  append(parent) {
    parent.appendChild(this._chartSvg);
    return this;
  }

  /**
   * convert methods
   * TODO: cache calculation result if possible
   */
  tickToX(tick: number):number {
    // console.log("tickToX", tick / this._state.resolution * this._state.barWidth);
    // console.log("tickToX", tick, this._state.resolution, this._state.barWidth);
    return tick / this._state.resolution * this._state.barWidth;
  }
  xToTick(x: number):number {
    return x * this._state.resolution / this._state.barWidth;
  }
  snapToDiv(x: number):number {
    const unit = this._state.barWidth/this._state.divNum;
    return Math.floor(x/unit) * unit;
  }
  yToTrackId(y: number) {
    return Math.floor(y / this._state.trackHeight);
  }

  addNoteRect(noteParam) {
    const chartSvg = this._chartSvg
    const noteRect = new NoteRect();
    // console.log(noteParam, noteParam[NOTE_ID_KEY]);

    /* noteRect setup */
    noteRect.id = noteParam[NOTE_ID_KEY];
    noteRect.x = this.tickToX(noteParam.tick);
    noteRect.tick = noteParam.tick;
    noteRect.width = DEFAULT_NOTE_WIDTH;
    if (noteParam.duration) {
      noteRect.width = this.tickToX(noteParam.duration);
      noteRect.duration = noteParam.duration;
    }
    noteRect.y = noteParam.trackId * this._state.trackHeight;
    noteRect.trackId = noteParam.trackId;
    noteRect.height = this._state.trackHeight;

    /* note move by drag */
    let moveStartX = 0;
    let moveStartY = 0;
    const onDragStart = (e) => {
      e.stopPropagation(); // chart自体のイベント発火を止める

      if (!noteRect.selected) {
        // shiftキー押しで連続選択できるように
        if (!globalKeyState.shiftKey) {
          this._model.setAllNotes((note) => {
            note.selected = false;
          });
        }
        // ノーツ選択状態にする
        this._model.setNoteById(noteParam[NOTE_ID_KEY], "selected", true);
      }
      // else {
      //   this._model.setNoteById(noteParam[NOTE_ID_KEY], "selected", false);
      // }

      moveStartX = e.clientX;
      moveStartY = e.clientY;
      // 以下だと初期位置が更新されないことがある
      // if (noteRect.selected) {
      //   noteRect.tempStartX = noteRect.x;
      //   noteRect.tempStartY = noteRect.y;
      // }
      this._noteRects.forEach((nRect) => {
        if (nRect.selected) {
          nRect.tempStartX = nRect.x;
          nRect.tempStartY = nRect.y;
        }
      })
    }
    const onDragMove = (e) => {
      if (!moveStartX) return;
      e.stopPropagation();

      // x-axis move
      const deltaX = e.clientX - moveStartX;
      const xMovingRects = [];
      const noteXExceedingRangeExists = this._noteRects.some((nRect, i) => {
        if (nRect.selected && nRect.tempStartX != null) {
          const dest = nRect.tempStartX + deltaX;
          if (dest < 0 || this._chartWidth - nRect.width < dest) return true;
          xMovingRects.push({
            index: i,
            dest: dest,
          })
        }
      });
      if (!noteXExceedingRangeExists) {
        xMovingRects.forEach((d)=> {
          const targetNoteRect = this._noteRects[d.index];
          targetNoteRect.x = this.snapToDiv(d.dest);
        });
      }

      // y-axis move
      const deltaY = e.clientY - moveStartY;
      const yMovingRects = [];
      const noteYExceedingRangeExists = this._noteRects.some((nRect, i) => {
        if (nRect.selected && nRect.tempStartY != null) {
          const dest = nRect.tempStartY + deltaY;
          if (dest < 0 || this._chartHeight - this._state.trackHeight < dest) return true;
          yMovingRects.push({
            index: i,
            dest: dest,
          })
        }
      });
      if (!noteYExceedingRangeExists) {
        yMovingRects.forEach((d) => {
          const targetNoteRect = this._noteRects[d.index];
          targetNoteRect.y = this.yToTrackId(d.dest) * this._state.trackHeight;
        });
      }
    }
    const onDragEnd = (e) => {
      if (!moveStartX) return;
      e.stopPropagation();

      // 変更を通知
      this._noteRects.forEach((nRect) => {
        if (nRect.selected) {
          this._model.setNoteById(nRect.id, "tick", this.xToTick(nRect.x));
          this._model.setNoteById(nRect.id, "trackId", this.yToTrackId(nRect.y));
        }
      })
      moveStartX = 0; // reset
    }
    noteRect.addEventListener('mousedown', onDragStart);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);

    /* drag hitbox and extend note */
    let dragStartX = 0;
    let startWidth = 0;
    const onStartNoteExtend = (e) => {
      e.stopPropagation(); // chart自体のイベント発火を止める
      dragStartX = e.clientX;
      startWidth = noteRect.width;
    }
    const onMoveNoteExtend = (e) => {
      if (!dragStartX) return;
      e.stopPropagation();
      let destWidth = startWidth + (e.clientX - dragStartX);
      destWidth = this.snapToDiv(destWidth);
      if (destWidth < DEFAULT_NOTE_WIDTH) return;
      noteRect.width = destWidth;
    }
    const onEndNoteExtend = (e) => {
      if (!dragStartX) return;
      e.stopPropagation();
      const duration = this.xToTick(noteRect.width);
      noteRect.duration = duration;
      // this._model.setNote(index, "duration", duration);
      this._model.setNoteById(noteRect.id, "duration", duration); // notify change
      dragStartX = 0; // reset
    }
    noteRect.hitBoxElement.addEventListener('mousedown', onStartNoteExtend);
    chartSvg.addEventListener('mousemove', onMoveNoteExtend);
    chartSvg.addEventListener('mouseup', onEndNoteExtend);

    noteRect.once('removed', (e) => {
      console.log('note removed!!!!');
      noteRect.removeEventListener('mousedown', onDragStart);
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);

      noteRect.hitBoxElement.removeEventListener('mousedown', onStartNoteExtend);
      chartSvg.removeEventListener('mousemove', onMoveNoteExtend);
      chartSvg.removeEventListener('mouseup', onEndNoteExtend);
    });

    // append
    noteRect.append(this._svgNoteLayer);
    this._noteRects.push(noteRect);
  }

  editNoteRect(noteId, changedPropKey: string, changedPropValue: any) {
    const noteRect = this._noteRects.find((rect)=> {
      return rect.id === noteId;
    });

    switch (changedPropKey) {
      case "tick": // TODO: change
        noteRect.x = this.tickToX(changedPropValue);
        noteRect.tick = changedPropValue;
        break;
      case "duration":
        if (changedPropValue != null) {
          noteRect.width = this.tickToX(changedPropValue);
          noteRect.duration = changedPropValue;
        } else {
          // prop削除
          noteRect.width = DEFAULT_NOTE_WIDTH;
          noteRect.duration = null;
        }
        break;
      case "trackId":
        noteRect.y = changedPropValue * this._state.trackHeight;
        noteRect.trackId = changedPropValue;
        break;
      case "selected":
        noteRect.selected = changedPropValue;
        break;
    }
  }

  removeNoteRect(noteId) {
    this._noteRects.some((rect, i) => {
      if (rect.id === noteId) {
        rect.remove();
        this._noteRects.splice(i, 1);
        return true;
      }
    });
  }

  /**
   * render html/svg
   * searches diffs
   * @private
   * @param {[type]} newState [description]
   */
  render(newState) {
    const chartSvg = this._chartSvg
    let bgRedrawFlag = false;
    let widthChangeFlag = false;
    let heightChangeFlag = false;
    newState = Object.assign({}, defaultState, newState);
    const paramDiffs = shallowDiff(this._state, newState)
    const noteDiffs = arrayItemSimpleDiff(this._state.notes, newState.notes, NOTE_ID_KEY)
    // console.log(paramDiffs, noteDiffs);
    this._state = newState; // 先にセット

    paramDiffs.forEach(diff => {
      const key = diff.key;
      const value = diff.value;
      if (key === "barNum" || key === "barWidth") {
        widthChangeFlag = true;
        if (key === "barWidth") {
          bgRedrawFlag = true;
          // noteRect.xの再設定、長さの再設定
          this._noteRects.forEach((noteRect) => {
            noteRect.x = this.tickToX(noteRect.tick);
            if (noteRect.duration != null) {
              noteRect.width = this.tickToX(noteRect.duration);
            }
          })
          // currentの位置更新
          this._currentLineRect.setAttribute('x', String(this.tickToX(newState.currentTick)));
        }
      } else if (key === "trackNum" || key === "trackHeight") {
        heightChangeFlag = true;
        if (key === "trackHeight") {
          bgRedrawFlag = true;
          // noteRectの縦サイズ変更
          this._noteRects.forEach((noteRect) => {
            noteRect.height = newState.trackHeight;
            noteRect.y = noteRect.trackId * newState.trackHeight;
          })
        }
      } else if (key === "currentTick") {
        this._currentLineRect.setAttribute('x', String(this.tickToX(value)));
      } else if (key === "divNum") {
        bgRedrawFlag = true;
      } else if (key === "resolution") {
        // @TODO: tickToXの計算をcache
      }
    });

    // ノーツ変化
    noteDiffs.forEach((diff)=> {
      switch (diff.kind) {
        case "new":
          this.addNoteRect(diff.value);
          break;
        case "edit":
          // this.editNoteRect(diff.key, diff.propKey, diff.propValue);
          this.editNoteRect(diff.key, diff.value[0], diff.value[1]);
          break;
        case "remove":
          this.removeNoteRect(diff.key);
          break;
      }
    });

    /* update chart */
    if (widthChangeFlag) {
      this._chartWidth = newState.barWidth * newState.barNum;
      chartSvg.setAttribute('width', String(this._chartWidth));
    }
    if (heightChangeFlag) {
      this._chartHeight = newState.trackHeight * newState.trackNum;
      const chartHeightStr = String(this._chartHeight);
      chartSvg.setAttribute('height', chartHeightStr);
      this._currentLineRect.setAttribute('height', chartHeightStr);
    }
    if (bgRedrawFlag) {
      setTrackBackground(chartSvg, {
        width: newState.barWidth,
        height: newState.trackHeight,
        divNum: newState.divNum,
      });
    }
  }
}

// // mixin EventEmitter methods
// Object.assign(TrackComponent.prototype, EventEmitter.prototype);


// /**
//  * @class ScaleTrackComponent
//  * 目盛り領域
//  */
// export class ScaleTrackComponent extends AbstractTrack {
//   constructor() {
//     super();
//   }
// }