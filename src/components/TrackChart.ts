import { EVENT_FAIL_NOTE_REMOVE, EVENT_POINT_START_CHART, iNoteParam, MARKER_COLOR, NOTE_ID_KEY, NOTE_PROP_LABEL, NOTE_PROP_REMOVABLE, NOTE_PROP_SHIFTABLE, NOTE_PROP_TRACK, SVG_NAMESPACE, TRACK_DEFAULT_STATE as defaultState, _EVENT_NOTERECT_REMOVED, NOTE_PROP_SELECTED, MARKER_LINE_DEFAULT_WIDTH, NOTE_PROP_DURATION, NOTE_PROP_START_TICK, TRACK_PROP_BAR_NUM, TRACK_PROP_BAR_WIDTH, TRACK_PROP_HEIGHT, TRACK_PROP_CURRENT, TRACK_PROP_DIV_NUM, TRACK_PROP_RESOLUTION, TrackBodyState, SELECTION_MIN_THRESHOLD, NOTE_DEFAULT_WIDTH, EVENT_SELECT_NOTE, NOTE_DRAGGING_THRESHOLD } from "../config";
import { setTrackBackground } from "../drawBackground";
import { KeyState as globalKeyState } from "../KeyState";
import { TrackModel } from "../TrackModel";
import { arrayItemSimpleDiff, cloneObj, shallowDiff, testRectRect } from "../utils";
import { AbstractChart } from "./abstracts/AbstractChart";
import { BrushRect } from "./BrushRect";
import { NoteRect } from "./NoteRect";
import { CSS_CLASS_TRACK_CHART, CSS_CLASS_TRACK_CURRENT_LINE, CSS_CLASS_TRACK_BRUSH_RECT, CSS_CLASS_NOTE_RECT } from "../cssSelectors";

/**
 * @class TrackComponent
 */
export class TrackChart extends AbstractChart {
  private _svgNoteLayer: SVGGElement
  private _svgLineLayer: SVGGElement
  // private _currentLineRect: SVGRectElement

  private _divSnapUnit: number
  private _state: TrackBodyState = { notes:[], tracks:[] }
  private _noteRects:NoteRect[] = []
  // private _currentX: number = 0
  private _currentSelectedTick: number = 0
  private _currentSelectedTrackId: number = 0;
  private _clipBoardNotes: iNoteParam[] = [];
  private _app
  isSnapping: boolean = true
  // private _chartBoundingRect // headerWidthを変えたりしてchartの位置が変わったときだけ更新する

  _isActive: boolean = false
  set active(v: boolean) {
    if  (v == false) {
      // clean clipboard adn clear selection
      this._clipBoardNotes.length = 0;
      this._noteRects.forEach((nRect) => nRect.selected = false);
      // this._model.setAllNotes((note) => note.selected = false);
    }
    this._isActive = v;
    // console.log('set active', v);
  }
  private _model: TrackModel
  set model(v: TrackModel) { this._model = v; }

  get maxTrackId() { return this._state.tracks.length - 1; }

  /**
   * constructor
   */
  constructor(app) {
    super();
    this._app = app;

    // main
    var chartSvg = this._chartSvg = document.createElementNS(SVG_NAMESPACE, "svg");
    chartSvg.style.boxSizing = 'border-box';
    chartSvg.style.display = 'block';
    chartSvg.style.borderBottom = 'solid 1px gray';
    chartSvg.setAttribute('class', `${CSS_CLASS_TRACK_CHART}`);

    // svg layers
    this._svgNoteLayer = document.createElementNS(SVG_NAMESPACE, "g");
    chartSvg.appendChild(this._svgNoteLayer);
    this._svgLineLayer = document.createElementNS(SVG_NAMESPACE, "g");
    chartSvg.appendChild(this._svgLineLayer);

    // // current line
    // var line = this._currentLineRect = document.createElementNS(SVG_NAMESPACE, "rect");
    // line.setAttribute('width', String(MARKER_LINE_DEFAULT_WIDTH));
    // line.setAttribute('fill', MARKER_COLOR);
    // chartSvg.setAttribute('class', `${CSS_CLASS_TRACK_CURRENT_LINE}`);
    // this._svgLineLayer.appendChild(line);

    // activation event
    chartSvg.addEventListener('mousedown', ()=> {
      if (!this._isActive) this._app.setActiveChart(this);
    }, true);

    this._setupBrushSelection();
    this._setupKeyboardEvent();

    // 初期設定はどうする？
    this.render(cloneObj(defaultState));
  }

  /**
   * @private
   * setup brush rect selection feature
   * used in constructor
   * @returns [void]
   */
  private _setupBrushSelection() {
    const chartSvg = this._chartSvg;
    const brush = new BrushRect();
    brush.appendTo(this._svgLineLayer);
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let tempChartRect: DOMRect | ClientRect;
    const selectionRect = { x: 0, y: 0, width: 0, height: 0 };

    chartSvg.addEventListener('mousedown', (e) => {
      // e.preventDefault(); // this will bother noteRect input area

      // clear all note-selection
      // this._model.setAllNotes((note) => note.selected = false);
      this._noteRects.forEach((nRect) => nRect.selected = false );

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
      brush.classList.add(CSS_CLASS_TRACK_BRUSH_RECT);
    });

    chartSvg.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      // e.stopPropagation();

      const chartRect = tempChartRect;
      // const chartRect = chartSvg.getBoundingClientRect();
      // const chartRect = this._chartBoundingRect;
      const x = e.clientX - chartRect.left;
      const y = e.clientY - chartRect.top;
      const dx = x - startX;
      const dy = y - startY;

      // switch brush x/width by pointing position
      if (dx < 0) {
        brush.x = x;
        brush.width = Math.abs(dx);
      } else {
        brush.x = startX;
        brush.width = dx;
      }

      // switch brush y/height by pointing position
      if (dy < 0) {
        brush.y = y;
        brush.height = Math.abs(dy);
      } else {
        brush.y = startY;
        brush.height = dy;
      }
    });
    document.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      e.preventDefault();

      const chartRect = tempChartRect;
      // const chartRect = chartSvg.getBoundingClientRect();
      // const chartRect = this._chartBoundingRect;
      const x = e.clientX - chartRect.left;
      const y = e.clientY - chartRect.top;
      const dx = x - startX;
      const dy = y - startY;
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);

      /* when move delta is small */
      if (adx < SELECTION_MIN_THRESHOLD && ady < SELECTION_MIN_THRESHOLD) {

        /* emit pointing event */
        const setX = (this.isSnapping) ? this._snapToDiv(x) : x;
        this._model.emit(EVENT_POINT_START_CHART, {
          x: setX,
          tick: this.xToTick(setX),
          trackId: this._yToTrackId(y),
        });

        /* memorize selected position */
        this._currentSelectedTick = this.xToTick(this._snapToDiv(x));
        this._currentSelectedTrackId = this._yToTrackId(y);
        // console.log(this._currentSelectedTick, this._currentSelectedTrackId);
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

        /* select noteRect within brush range */
        this._noteRects.forEach((nRect) => {
          if (testRectRect(selectionRect, nRect)) {
            nRect.selected = true;
            // this._model.setNoteById(nRect.id, NOTE_PROP_SELECTED, true);
          }
        });
      }

      isDragging = false;
      brush.visible = false;
    });
  }

  /**
   * enable keyboard events
   * should only work when the track is active
   */
  private _setupKeyboardEvent() {
    // find and return cloned specified note
    const copyNote = (noteRect: NoteRect) => {
      const copiedNote = this._state.notes.find((note) => {
        return note[NOTE_ID_KEY] === noteRect.id;
      });
      return cloneObj(copiedNote);
    };

    document.addEventListener('keydown', (e) => {
      if (!this._isActive) return;

      if (e.ctrlKey) {
        if (e.key === 'c') {
          /* copy */
          this._clipBoardNotes.length = 0; // clear
          this._noteRects.forEach((nr) => {
            if (nr.selected) {
              this._clipBoardNotes.push(copyNote(nr));
            }
          })
        } else if (e.key === 'x') {
          /* cut */
          this._clipBoardNotes.length = 0; // clear
          const removed = [];
          this._noteRects.forEach((nr) => {
            if (nr.selected) {
              this._clipBoardNotes.push(copyNote(nr));
              removed.push(nr.id);
            }
          })
          this._model.removeNoteById(removed);
        } else if (e.key === 'v') {
          /* paste */
          if (!this._clipBoardNotes.length) return;
          // tick最小ノートが基準
          const cloneNotes = cloneObj(this._clipBoardNotes);
          const standard = cloneNotes.reduce((a, b) => {
            return a.tick < b.tick ? a : b;
          });
          // console.log("star", standard);
          const standardTrackId = standard[NOTE_PROP_TRACK];
          const standardTick = standard.tick;
          cloneNotes.forEach((noteParam) => {
            if (noteParam === standard) {
              noteParam.tick = this._currentSelectedTick;
              noteParam[NOTE_PROP_TRACK] = this._currentSelectedTrackId;
            } else {
              noteParam.tick += this._currentSelectedTick - standardTick;
              noteParam[NOTE_PROP_TRACK] = this._currentSelectedTrackId - (standardTrackId - noteParam[NOTE_PROP_TRACK]);
            };
            noteParam.selected = true;
            if (0 <= noteParam[NOTE_PROP_TRACK] && noteParam[NOTE_PROP_TRACK] <= this.maxTrackId) {
              this._model.addNote(noteParam)
            }
          });
        } else if (e.key === 'd') {
          // 選択全解除
          e.preventDefault();
          // this._model.setAllNotes((note) => note.selected = false);
          this._noteRects.forEach((nRect) => nRect.selected = false);
        }
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        // 選択したノーツを消去:
        // 配列操作を伴うため、一度に行う
        let removedIds = [];
        const model = this._model;
        this._noteRects.forEach((rect) => {
          if (rect.selected) {
            if (rect.removable) {
              // console.warn('bss remove indx', rect.id);
              removedIds.push(rect.id);
            } else {
              model.emit(EVENT_FAIL_NOTE_REMOVE, model.getNoteById(rect.id));
            }
          };
        })
        model.removeNoteById(removedIds);
      }
    });
  }

  /**
   * convert x to snappable value
   * @param x
   */
  private _snapToDiv(x: number):number {
    // const unit = this._state.barWidth / this._state.divNum;
    const unit = this._divSnapUnit;
    return Math.round(x / unit) * unit;
  }

  /**
   * convert y to trackId
   * @param x
   */
  private _yToTrackId(y: number) {
    return Math.floor(y / this._state.trackHeight);
  }

  /**
   * ノーツを追加する
   * クリック・ドラッグ時の振る舞いなども設定
   * @param noteParam
   */
  addNoteRect(noteParam: iNoteParam) {
    const chartSvg = this._chartSvg
    // console.log(noteParam, noteParam[NOTE_ID_KEY]);

    /* noteRect init-setup */
    const noteRect = new NoteRect(
      noteParam.fill,
      noteParam.extendable,
      noteParam[NOTE_PROP_REMOVABLE],
      noteParam[NOTE_PROP_SHIFTABLE]
    );
    noteRect.id = noteParam[NOTE_ID_KEY];
    noteRect.x = this.tickToX(noteParam.tick);
    noteRect.tick = noteParam.tick;
    noteRect.width = NOTE_DEFAULT_WIDTH;
    if (noteParam.duration) {
      noteRect.width = this.tickToX(noteParam.duration);
      noteRect.duration = noteParam.duration;
    }
    if (noteParam[NOTE_PROP_LABEL] != null) {
      noteRect.inputValue = noteParam[NOTE_PROP_LABEL];
      const inputLabelEventHandler = (e) => {
        // console.log('changed', e.target.value);
        this._model.setNoteById(noteParam[NOTE_ID_KEY], NOTE_PROP_LABEL, e.target.value)
      };
      noteRect.inputElement.addEventListener('input', inputLabelEventHandler);
      noteRect.once(_EVENT_NOTERECT_REMOVED, () => {
        noteRect.inputElement.removeEventListener('input', inputLabelEventHandler);
      });
    }
    noteRect.y = noteParam[NOTE_PROP_TRACK] * this._state.trackHeight;
    noteRect.trackId = noteParam[NOTE_PROP_TRACK];
    noteRect.height = this._state.trackHeight;
    noteRect.classList = [
      `${CSS_CLASS_NOTE_RECT}`,
      `${CSS_CLASS_NOTE_RECT}-${noteRect.id}`
    ];
    if (noteParam.image != null) {
      noteRect.image = noteParam.image;
    }

    /**
     * set note dragging feature
     */
    let moveStartX = 0;
    let moveStartY = 0;
    let chartRect: ClientRect | DOMRect;
    const onDragStart = (e) => {
      e.preventDefault(); // for smooth move
      e.stopPropagation(); // prevent propagation to chart event
      chartRect = chartSvg.getBoundingClientRect();

      if (!noteRect.selected) {
        // shiftキー押しで連続選択できるように
        if (!globalKeyState.shiftKey) {
          /* clear all selection if shift key is not pressed */
          // this._model.setAllNotes((note) => note.selected = false);
          this._noteRects.forEach((nRect) => nRect.selected = false);
        }
        // this._model.setNoteById(noteParam[NOTE_ID_KEY], NOTE_PROP_SELECTED, true);
        noteRect.selected = true;
      }

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
      });

      // emit select event
      this._model.emit(EVENT_SELECT_NOTE, this._model.getNoteById(noteRect.id));
    }

    const onDragMove = (e) => {
      if (!moveStartX) return;
      e.preventDefault(); // for smooth move
      e.stopPropagation();

      /* x-axis move */
      const pointerDeltaX = e.clientX - moveStartX;
      if (NOTE_DRAGGING_THRESHOLD < Math.abs(pointerDeltaX)) {
        const xMovingRects = [];
        const noteExceedingRangeXExists = this._noteRects.some((nRect, i) => {
          if (nRect.selected && nRect.tempStartX != null) {
            const dest = nRect.tempStartX + pointerDeltaX;
            if (dest < 0 || this._chartWidth - nRect.width < dest) return true;
            xMovingRects.push({
              index: i,
              // dest: dest,
            })
          }
        });
        if (!noteExceedingRangeXExists) {
          /* use current noteRect as standard */
          const standardNoteDestX = noteRect.tempStartX + pointerDeltaX;
          const standardNoteActualDestX = (this.isSnapping) ? this._snapToDiv(standardNoteDestX) : standardNoteDestX;
          // noteRect.x = (this.isSnapping) ? this.snapToDiv(standardNoteDestX) : standardNoteDestX;
          const standardNoteDeltaX = standardNoteActualDestX - noteRect.tempStartX;
          xMovingRects.forEach((d)=> {
            const targetNoteRect = this._noteRects[d.index];
            if (!targetNoteRect.shiftable) return;
            const distX = targetNoteRect.tempStartX + standardNoteDeltaX;
            // targetNoteRect.x = distX;
            this._model.setNoteById(targetNoteRect.id, NOTE_PROP_START_TICK, this.xToTick(distX));
          });
        }
      }

      /* y-axis move: depends on trackId  */
      const deltaY = e.clientY - moveStartY;
      if (NOTE_DRAGGING_THRESHOLD < Math.abs(deltaY)) {
        const pointerY = e.clientY - chartRect.top;
        const trackIdDelta = this._yToTrackId(pointerY) - noteRect.trackId;
        const yMovingRects = [];
        const noteExceedingRangeYExists = this._noteRects.some((nRect, i) => {
          if (nRect.selected && nRect.tempStartY != null) {
            const destId = nRect.trackId + trackIdDelta;
            if (destId < 0 || this.maxTrackId < destId) return true;
            // const dest = nRect.tempStartY + deltaY;
            // if (dest < 0 || this._chartHeight - this._state.trackHeight < dest) return true;
            yMovingRects.push({
              index: i,
              // dest: dest,
            })
          }
        });
        if (!noteExceedingRangeYExists) {
          yMovingRects.forEach((d) => {
            const targetNoteRect = this._noteRects[d.index];
            if (!targetNoteRect.shiftable) return;
            // targetNoteRect.y = (targetNoteRect.trackId + trackIdDelta) * this._state.trackHeight;
            this._model.setNoteById(targetNoteRect.id, NOTE_PROP_TRACK, targetNoteRect.trackId + trackIdDelta);
          });
        }
      }
    }

    const onDragEnd = (e) => {
      if (!moveStartX) return;
      e.preventDefault(); // for smooth move
      e.stopPropagation();

      // 変更を通知
      this._noteRects.forEach((nRect) => {
        if (nRect.selected) {
          // this._model.setNoteById(nRect.id, "tick", this.xToTick(nRect.x));
          this._model.setNoteById(nRect.id, NOTE_PROP_TRACK, this._yToTrackId(nRect.y));
        }
      })
      moveStartX = 0; // reset
    }
    noteRect.addEventListener('mousedown', onDragStart, true);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);

    /**
     * setup extendable hitbox and extend note
     */
    let dragStartX = 0;
    let startWidth = 0;
    const onStartNoteExtend = (e) => {
      e.stopPropagation(); // chart自体のイベント発火を止める
      e.preventDefault(); // for smooth move
      dragStartX = e.clientX;
      startWidth = noteRect.width;
    }
    const onMoveNoteExtend = (e) => {
      if (!dragStartX) return;
      e.stopPropagation();
      e.preventDefault(); // for smooth move
      let destWidth = startWidth + (e.clientX - dragStartX);
      destWidth = this._snapToDiv(destWidth);
      if (destWidth <= 0) return;
      noteRect.width = destWidth;
    }
    const onEndNoteExtend = (e) => {
      if (!dragStartX) return;
      e.stopPropagation();
      e.preventDefault(); // for smooth move
      const duration = this.xToTick(noteRect.width);
      noteRect.duration = duration;
      this._model.setNoteById(noteRect.id, NOTE_PROP_DURATION, duration); // notify change
      dragStartX = 0; // reset
    }
    if (noteRect.extensionElement != null)
      noteRect.extensionElement.addEventListener('mousedown', onStartNoteExtend);
    chartSvg.addEventListener('mousemove', onMoveNoteExtend);
    chartSvg.addEventListener('mouseup', onEndNoteExtend);

    /**
     * free eventlisteners after removal
     */
    noteRect.once(_EVENT_NOTERECT_REMOVED, () => {
      noteRect.removeEventListener('mousedown', onDragStart);
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);

      if (noteRect.extensionElement != null)
        noteRect.extensionElement.removeEventListener('mousedown', onStartNoteExtend);
      // if (inputLabelEventHandler != null) noteRect.inputElement.removeEventListener('input', inputLabelEventHandler);
      chartSvg.removeEventListener('mousemove', onMoveNoteExtend);
      chartSvg.removeEventListener('mouseup', onEndNoteExtend);
    });

    // append to parent svg
    noteRect.appendTo(this._svgNoteLayer);
    this._noteRects.push(noteRect);
  }

  /**
   * Find noteRect by id and update its specified property value
   * @method
   * @param noteId
   * @param changedPropKey
   * @param changedPropValue
   */
  editNoteRect(
    noteId: number,
    changedPropKey: string,
    changedPropValue: any
  ) {
    const noteRect = this._noteRects.find((rect)=> {
      return rect.id === noteId;
    });

    switch (changedPropKey) {
      case NOTE_PROP_START_TICK:
        noteRect.x = this.tickToX(changedPropValue);
        noteRect.tick = changedPropValue;
        break;
      case NOTE_PROP_DURATION:
        if (changedPropValue != null) {
          noteRect.width = this.tickToX(changedPropValue);
          noteRect.duration = changedPropValue;
        } else {
          // null:prop削除
          noteRect.width = NOTE_DEFAULT_WIDTH;
          noteRect.duration = null;
        }
        break;
      case NOTE_PROP_TRACK:
        noteRect.y = changedPropValue * this._state.trackHeight;
        noteRect.trackId = changedPropValue;
        break;
      // case NOTE_PROP_SELECTED:
      //   noteRect.selected = changedPropValue;
      //   break;
    }
  }

  /**
   * remove note with specifed id
   * @method
   * @param noteId
   */
  removeNoteRect(noteId: number) {
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
    const trackDiffs = arrayItemSimpleDiff(this._state.tracks, newState.tracks, "key")

    this._state = newState; // 先にセット
    // console.log(paramDiffs, noteDiffs);

    // set rerender flags
    paramDiffs.forEach(diff => {
      const key = diff.key;
      if (key === TRACK_PROP_BAR_NUM || key === TRACK_PROP_BAR_WIDTH) {
        chartWidthUpdateFlag = true;
        if (key === TRACK_PROP_BAR_WIDTH) {
          bgRedrawFlag = true;
          snapUnitRecalcFlag = true;
          convertFactorRecalcFlag = true;
          noteRectHorizontalUpdateFlag = true;
          currentTickUpdateFlag = true;
        }
      } else if (key === TRACK_PROP_HEIGHT) {
        chartHeightUpdateFlag = true;
        if (key === TRACK_PROP_HEIGHT) {
          bgRedrawFlag = true;
          noteRectVerticalUpdateFlag = true
        }
      } else if (key === TRACK_PROP_CURRENT) {
        currentTickUpdateFlag = true;
      } else if (key === TRACK_PROP_DIV_NUM) {
        bgRedrawFlag = true;
        snapUnitRecalcFlag = true;
      } else if (key === TRACK_PROP_RESOLUTION) {
        convertFactorRecalcFlag = true;
        noteRectHorizontalUpdateFlag = true;
        currentTickUpdateFlag = true;
      }
    });

    /* trackNum change */
    trackDiffs.forEach((diff)=> {
      if (diff.kind === 'length') chartHeightUpdateFlag = true;
    })

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
      // this._chartHeight = newState.trackHeight * newState.trackNum;
      this._chartHeight = newState.trackHeight * newState.tracks.length;
      const chartHeightStr = String(this._chartHeight);
      chartSvg.setAttribute('height', chartHeightStr);
      // this._currentLineRect.setAttribute('height', chartHeightStr);
      this._app.updateHeight();
    }
    if (bgRedrawFlag) {
      setTrackBackground(chartSvg, {
        width: newState.barWidth,
        height: newState.trackHeight,
        divNum: newState.divNum,
      });
    }
    if (currentTickUpdateFlag) {
      // set x to where the rect is centerized
      // const x = this.tickToX(newState.currentTick) - Number(this._currentLineRect.getAttribute('width'))*0.5
      // this._currentLineRect.setAttribute('x', String(x));
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