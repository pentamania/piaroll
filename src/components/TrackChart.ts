// import EventEmitter from "EventEmitter";
// import deef from "deep-diff";
import { SVG_NAMESPACE, NOTE_ID_KEY } from "../config";
import { NoteRect } from "./NoteRect";
import { BrushRect } from "./BrushRect";
import {setTrackBackground} from "../drawBackground";
import { cloneObj, shallowDiff, arrayItemSimpleDiff, testRectRect } from "../utils";
import { TrackModel } from "../TrackModel";
import { KeyState as globalKeyState } from "../KeyState";
const DEFAULT_NOTE_WIDTH = 16;
const SELECTION_MIN_THRESHOLD = 5;

interface noteParam {
  trackId: number
  tick: number // change
  duration?: number
  selected: boolean
}
interface State {
  barNum?: number
  barWidth?: number
  trackNum?: number
  trackHeight?: number
  currentTick?: number,
  notes: noteParam[]
}

const defaultState = {
  resolution: 1920,
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
  // private _chartBoundingRect // headerWidthを変えたりしてchartの位置が変わったときだけ更新する
  private _divSnapUnit: number
  private _xToTickFactor: number
  private _tickToXFactor: number
  // private _state = cloneObj(defaultState)
  private _state: State = { notes:[] }
  private _noteRects:NoteRect[] = []
  private _model: TrackModel
  private _currentSetX: number = 0;
  // private _brush: BrushRect
  isWriteMode: boolean = false
  // isWriteMode: boolean = true

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

    /* mouse/touch event */
    chartSvg.addEventListener('mousedown', (e)=> {
      // ノーツ選択状態を全解除
      this._model.setAllNotes((note)=> {
        note.selected = false;
      });
    });

    /* brush selection setting */
    const brush = new BrushRect();
    brush.append(this._svgLineLayer);
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let tempChartRect;
    const selectionRect = { x: 0, y: 0, width: 0, height: 0 };
    chartSvg.addEventListener('mousedown', (e) => {
      isDragging = true;
      const chartRect = tempChartRect = chartSvg.getBoundingClientRect();
      // const chartRect = e.target.getBoundingClientRect(); // なぜか値が不安定になるため使わない
      // const chartRect = this._chartBoundingRect;
      const x = e.clientX - chartRect.left;
      const y = e.clientY - chartRect.top;

      startX = x;
      startY = y;
      brush.x = x;
      brush.y = y;
      brush.width = 0;
      brush.height = 0;
      brush.visible = true;
    });

    chartSvg.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      // e.stopPropagation();

      const chartRect = tempChartRect;
      // const chartRect = chartSvg.getBoundingClientRect();
      // const chartRect = this._chartBoundingRect;
      const x = e.clientX - chartRect.left;
      const y = e.clientY - chartRect.top;
      const dx = x - startX;
      const dy = y - startY;

      if (dx < 0) {
        brush.x = x;
        brush.width = Math.abs(dx);
      } else {
        brush.x = startX;
        brush.width = dx;
      }

      // 始点よりマイナス側に移動
      if (dy < 0) {
        brush.y = y;
        brush.height = Math.abs(dy);
      } else {
        brush.y = startY;
        brush.height = dy;
      }
    })
    document.addEventListener('mouseup', (e) => {
      if (!isDragging) return;

      const chartRect = tempChartRect;
      // const chartRect = chartSvg.getBoundingClientRect();
      // const chartRect = this._chartBoundingRect;
      const x = e.clientX - chartRect.left;
      const y = e.clientY - chartRect.top;
      const dx = x - startX;
      const dy = y - startY;
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);

      if (adx < SELECTION_MIN_THRESHOLD && ady < SELECTION_MIN_THRESHOLD) {
        /* when move is small */
        if (this.isWriteMode) {
          // add note
          var noteX = this.snapToDiv(x);
          this._model.addNote({
            tick: this.xToTick(noteX),
            trackId: this.yToTrackId(y),
            selected: false,
          })
        } else {
          this._currentSetX = this.snapToDiv(x);
          console.log(this._currentSetX);
        }
      } else {
        if (dx < 0) {
          selectionRect.x = x;
          selectionRect.width = adx;
        } else {
          selectionRect.x = startX;
          selectionRect.width = adx;
        }
        if (dy < 0) {
          selectionRect.y = y;
          selectionRect.height = ady;
        } else {
          selectionRect.y = startY;
          selectionRect.height = ady;
        }

        /* select noteRect within range */
        this._noteRects.forEach((nRect) => {
          if (testRectRect(selectionRect, nRect)) {
            this._model.setNoteById(nRect.id, 'selected', true);
          }
        })
      }

      isDragging = false;
      brush.visible = false;
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
        } else if (e.key === 'd') {
          // 選択全解除
          e.preventDefault();
          this._model.setAllNotes((note) => {
            note.selected = false;
          });
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

    // 初期設定はどうする？
    this.render(cloneObj(defaultState));
  }

  append(parent) {
    parent.appendChild(this._chartSvg);
    // this._chartBoundingRect = this._chartSvg.getBoundingClientRect();
    return this;
  }

  /**
   * convert methods
   */
  tickToX(tick: number):number {
    // return tick / this._state.resolution * this._state.barWidth;
    return tick * this._tickToXFactor;
  }
  xToTick(x: number):number {
    // return x * this._state.resolution / this._state.barWidth;
    return x * this._xToTickFactor;
  }
  snapToDiv(x: number):number {
    // const unit = this._state.barWidth / this._state.divNum;
    const unit = this._divSnapUnit;
    return Math.floor(x/unit) * unit;
  }
  yToTrackId(y: number) {
    return Math.floor(y / this._state.trackHeight);
  }

  addNoteRect(noteParam) {
    const chartSvg = this._chartSvg
    const noteRect = new NoteRect();
    console.log(noteParam, noteParam[NOTE_ID_KEY]);

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
        // TODO:移動量は一つのnoteRectを基準にする
        // const deltaX = this.snapToDiv(noteRect.x) - noteRect.tempStartX
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
    let chartWidthUpdateFlag = false;
    let chartHeightUpdateFlag = false;
    let snapUnitRecalcFlag = false;
    let convertFactorRecalcFlag = false;
    let currentTickUpdateFlag = false;
    let noteRectHorizontalUpdateFlag = false;
    let noteRectVerticalUpdateFlag = false;
    newState = Object.assign({}, defaultState, newState);
    const paramDiffs = shallowDiff(this._state, newState)
    const noteDiffs = arrayItemSimpleDiff(this._state.notes, newState.notes, NOTE_ID_KEY)

    this._state = newState; // 先にセット
    // console.log(paramDiffs, noteDiffs);

    paramDiffs.forEach(diff => {
      const key = diff.key;
      if (key === "barNum" || key === "barWidth") {
        chartWidthUpdateFlag = true;
        if (key === "barWidth") {
          bgRedrawFlag = true;
          snapUnitRecalcFlag = true;
          convertFactorRecalcFlag = true;
          noteRectHorizontalUpdateFlag = true;
          currentTickUpdateFlag = true;
        }
      } else if (key === "trackNum" || key === "trackHeight") {
        chartHeightUpdateFlag = true;
        if (key === "trackHeight") {
          bgRedrawFlag = true;
          noteRectVerticalUpdateFlag = true
        }
      } else if (key === "currentTick") {
        currentTickUpdateFlag = true;
      } else if (key === "divNum") {
        bgRedrawFlag = true;
        snapUnitRecalcFlag = true;
      } else if (key === "resolution") {
        convertFactorRecalcFlag = true;
        noteRectHorizontalUpdateFlag = true;
        currentTickUpdateFlag = true;
      }
    });

    /* update cached parameters */
    if (snapUnitRecalcFlag) {
      this._divSnapUnit = newState.barWidth / newState.divNum;
    }
    if (convertFactorRecalcFlag) {
      this._xToTickFactor = newState.resolution / newState.barWidth;
      this._tickToXFactor = 1 / newState.resolution * newState.barWidth;
    }

    /* update views: rafを使う？ */
    if (chartWidthUpdateFlag) {
      this._chartWidth = newState.barWidth * newState.barNum;
      chartSvg.setAttribute('width', String(this._chartWidth));
    }
    if (chartHeightUpdateFlag) {
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
    if (currentTickUpdateFlag) {
      this._currentLineRect.setAttribute('x', String(this.tickToX(newState.currentTick)));
    }
    if (noteRectHorizontalUpdateFlag || noteRectVerticalUpdateFlag) {
      this._noteRects.forEach((noteRect) => {
        if (noteRectHorizontalUpdateFlag) {
          noteRect.x = this.tickToX(noteRect.tick);
          if (noteRect.duration != null) noteRect.width = this.tickToX(noteRect.duration);
        }
        if (noteRectVerticalUpdateFlag) {
          noteRect.y = noteRect.trackId * newState.trackHeight;
          noteRect.height = newState.trackHeight;
        }
      })
    }

    /* update notes */
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