// import EventEmitter from "EventEmitter";
import deef from "deep-diff";
import {SVG_NAMESPACE} from "../config";
import {NoteRect} from "./NoteRect";
import {setTrackBackground} from "../drawBackground";
import { cloneObj } from "../utils";
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
  private _barWidth: number = 0
  // private _state = cloneObj(defaultState)
  private _state = {}
  private _noteRects = []
  private _model: TrackModel
  private _moveStartX: number
  private _isDragging: boolean = false
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
    this._svgNoteLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    chartSvg.appendChild(this._svgNoteLayer);
    this._svgLineLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    chartSvg.appendChild(this._svgLineLayer);

    // current line
    var line = this._currentLineRect = document.createElementNS(SVG_NAMESPACE, "rect");
    line.setAttribute('width', "2");
    line.setAttribute('height', "200");
    line.setAttribute('y', "0");
    line.setAttribute('fill', "red");
    this._svgLineLayer.appendChild(line);

    // mouse/touch event
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
      }

      // todo: brushの設定
    });

    // let moveDeltaX = 0;
    // document.addEventListener('mousemove', (e) => {
    //   if (!this._moveStartX) return;
    //   // console.log("draging");
    //   moveDeltaX = e.clientX - this._moveStartX;
    //   // console.log(moveDeltaX);
    //   this._noteRects.forEach((rect)=> {
    //     if (rect.selected) {
    //       rect.x = moveDeltaX
    //     }
    //   })
    // })
    // document.addEventListener('mouseup', (e) => {
    //   if (!this._moveStartX) return;
    //   this._moveStartX = 0;
    //   this._noteRects.forEach((rect) => {
    //     // rect.x += moveDeltaX
    //   })
    // })

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
        // let removedIndices = [];
        this._noteRects.forEach((rect) => {
          if (rect.selected) {
            console.warn('bss remove indx', rect.id);
            // removedIndices.push(rect.index);
            this._model.removeNoteById(rect.id);
          };
          // this._model.removeNotes(removedIndices);
        })
      }
    })

    this.render(cloneObj(defaultState));
  }

  append(parent) {
    parent.appendChild(this._chartSvg);
    return this;
  }

  /**
   * convert
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

  /**
   * render html/svg
   * searches diffs
   * @private
   * @param {[type]} newState [description]
   */
  render(newState) {
    const chartSvg = this._chartSvg
    let bgRedrawFlag = false;
    // let noteRerenderFlag = false;
    newState = Object.assign({}, defaultState, newState);
    const diff = deef(this._state, newState);
    console.log("diff", diff);

    if (diff != null) {
      diff.forEach(d => {
        const key = d.path[0];
        // const key = d.path.shift(); // 消すとトラブル
        // console.log(key);

        if (key === "barNum" || key === "barWidth") {
          bgRedrawFlag = true;
          if (key === "barWidth") {
            // noteRect.xの再設定、長さの再設定
            this._noteRects.forEach((noteRect)=> {
              noteRect.x = this.tickToX(noteRect.tick);
              if (noteRect.duration != null) {
                // console.log('rect width', noteRect.duration);
                noteRect.width = this.tickToX(noteRect.duration);
              }
            })
            // currentの位置修正
            this._currentLineRect.setAttribute('x', String(this.tickToX(newState.currentTick)));
          }
        } else if (key === "trackNum" || key === "trackHeight") {
          bgRedrawFlag = true;
          if (key === "trackHeight") {
            // noteRectの縦サイズ変更
            // Array.prototype.slice.call(chartSvg.childNodes).forEach((noteRect) => {
            this._noteRects.forEach((noteRect)=> {
              noteRect.height = newState.trackHeight;
              noteRect.y = noteRect.trackId * newState.trackHeight;
            })
          }
        } else if (key === "currentTick") {
          console.log('setting currenttick');
          this._currentLineRect.setAttribute('x', String(this.tickToX(d.rhs)));
        } else if (key === "notes") {
          // noteの再調整
          // console.log("new change", d);
          if (d.kind === 'A') {
            const index = d.index;
            /* new note */
            if (d.item.kind === "N") {
              const noteParam = d.item.rhs;
              const noteRect = new NoteRect();
              // noteRect.index = index;
              noteRect.id = noteParam._uid;
              noteRect.x = this.tickToX(noteParam.tick);
              noteRect.tick = noteParam.tick;
              noteRect.width = DEFAULT_NOTE_WIDTH;
              if (noteParam.duration) {
                noteRect.width = this.tickToX(noteParam.duration);
                noteRect.duration = noteParam.duration;
              }
              // TODO: trackIdに対応するトラックがない場合、追加しない？
              noteRect.y = noteParam.trackId * newState.trackHeight;
              noteRect.trackId = noteParam.trackId;
              noteRect.height = newState.trackHeight;

              /* set note move */
              let moveStartX = 0;
              const onDragStart = (e) => {
                e.stopPropagation(); // chart自体のイベント発火を止める
                if (!noteRect.selected) {
                  // ノーツ選択状態にする
                  if (!globalKeyState.shiftKey) {
                    this._model.setAllNotes((note) => {
                      note.selected = false;
                    });
                  }
                  this._model.setNote(index, "selected", true);
                }
                // this._moveStartX = e.clientX;
                moveStartX = e.clientX;
                this._noteRects.forEach((nRect) => {
                  if (nRect.selected) nRect.startX = nRect.x;
                })
              }
              noteRect.addEventListener('mousedown', onDragStart);
              document.addEventListener('mousemove', (e)=> {
                if (!moveStartX) return;
                e.stopPropagation();
                let deltaX = e.clientX - moveStartX;
                this._noteRects.forEach((nRect)=> {
                  if (nRect.selected) {
                    // TPDP: 移動を制限

                    // nRect.x = nRect.startX + deltaX;
                    nRect.x = this.snapToDiv(nRect.startX + deltaX);
                  }
                })
              });
              document.addEventListener('mouseup', (e) => {
                if (!moveStartX) return;
                e.stopPropagation();
                // this._noteRects.forEach((nRect) => {
                //   if (nRect.selected) {
                //     this._model.setNote(nRect.index, "tick", this.xToTick(nRect.x));
                //   }
                // })
                moveStartX = 0;
              });

              /* drag hitbox and extend note */
              let dragStartX = 0;
              let startWidth = 0;
              noteRect.hitBoxElement.addEventListener('mousedown', (e) => {
                e.stopPropagation(); // chart自体のイベント発火を止める
                dragStartX = e.clientX;
                startWidth = noteRect.width;
              });
              chartSvg.addEventListener('mousemove', (e) => {
                if (!dragStartX) return;
                e.stopPropagation();
                let destWidth = startWidth + (e.clientX - dragStartX);
                destWidth = this.snapToDiv(destWidth);
                if (destWidth < DEFAULT_NOTE_WIDTH) return;
                noteRect.width = destWidth;
              });
              chartSvg.addEventListener('mouseup', (e) => {
                if (!dragStartX) return;
                e.stopPropagation();
                const duration = this.xToTick(noteRect.width);
                noteRect.duration = duration;
                this._model.setNote(index, "duration", duration);
                dragStartX = 0; // reset
              });

              noteRect.once('removed', (e) => {
                // TODO: removeEventListenerでメモリ開放
                console.log('note removed!!!!');
              })
              noteRect.append(this._svgNoteLayer);
              this._noteRects[index] = noteRect; // FIXME 大丈夫？
            } else if (d.item.kind === "D") {

              /* delete note */
              console.log("deleted", d.item); // 配列入れ替わりで存在するアイテムが指定されてしまう
              const deletedNoteId = d.item.lhs._uid;
              // console.warn("note change and removed", deletedNoteId, typeof deletedNoteId)
              // newState.notes.forEach(note => {
              //   d.item
              // });

              this._noteRects.some((rect, i) => {
                if (rect.id === deletedNoteId) {
                  // throw rect
                  rect.remove();
                  this._noteRects.splice(i, 1);
                  return true;
                }
              });
              // this._noteRects = this._noteRects.filter((rect) => {
              //   return rect.id !== deletedNoteId
              // });
              // this._noteRects[index].remove();
            }
          } else if (d.kind === 'E') {
            /* note edit */
            console.log("note edit", d);
            const index = d.path[1];
            const notePropKey = d.path[2];
            // if (notePropKey === '_uid') return;
            // const noteProp = newState["notes"][index];
            // const noteRect = this._noteRects.find((rect)=> {
            //   return rect.id === noteProp._uid
            // });
            // if (!noteRect) return;
            const noteRect = this._noteRects[index];
            // console.log(noteRect);
            // noteRect.index = index;
            // console.log("nnotep", index, notePropKey);
            switch (notePropKey) {
              case "tick":
                noteRect.x = this.tickToX(d.rhs);
                noteRect.tick = d.rhs;
                break;
              case "duration":
                noteRect.width = this.tickToX(d.rhs);
                noteRect.duration = d.rhs;
                break;
              case "trackId":
                noteRect.y = d.rhs * newState.trackHeight;
                noteRect.trackId = d.rhs;
                break;
              case "_uid":
                noteRect.id = d.rhs;
                break;
              case "selected":
                noteRect.selected = d.rhs;
                break;
              default:
                break;
            }
          } else if (d.kind === 'D') {
            console.log('kind D: noteprop deleted', d);
            if (d.path[0] === 'notes') {
              /* delete note prop */
              const index = d.path[1];
              const noteRect = this._noteRects[index];
              const notePropKey = d.path[2];
              switch (notePropKey) {
                case "duration":
                  noteRect.width = DEFAULT_NOTE_WIDTH;
                  noteRect.duration = null;
                  break;
              }
            }

          }
        }
      }); // --diff foreach
    } // --diff

    if (bgRedrawFlag) {
      // svgリサイズ
      const chartHeight = String(newState.trackHeight * newState.trackNum);
      chartSvg.setAttribute('width', String(newState.barWidth * newState.barNum));
      chartSvg.setAttribute('height', chartHeight);
      this._currentLineRect.setAttribute('height', chartHeight);

      // 背景を再描画
      setTrackBackground(chartSvg, {
        width: newState.barWidth,
        height: newState.trackHeight,
        divNum: newState.divNum,
      });
    }

    this._state = newState;
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