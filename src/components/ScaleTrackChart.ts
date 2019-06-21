import {
  SVG_NAMESPACE,
  TRACK_DEFAULT_STATE as defaultState,
  MARKER_COLOR,
 } from "../config";
import { shallowDiff } from "../utils";
import { SvgText } from "./SvgText";
import { AbstractChart } from "./abstracts/AbstractChart";
import { App } from "../App";
const DEFAULT_SCALE_BACKGROUND_COLOR = "#645F8B";

// marker config
const MARKER_H = 7;
const MARKER_RAD = 9;
const POINTS = `-${MARKER_RAD},-${MARKER_H / 2} ${MARKER_RAD},-${MARKER_H / 2} 0,${MARKER_H}`

/**
 * @class ScaleChart
 * 目盛り領域
 */
export class ScaleTrackChart extends AbstractChart {

  private _measureTexts: SvgText[] = []
  private _state = { tracks: []}
  private _markerSvg: SVGPolygonElement
  private _app: App

  constructor(app) {
    super();
    this._app = app;

    // main chart
    const chartSvg = this._chartSvg = document.createElementNS(SVG_NAMESPACE, "svg");
    chartSvg.style.boxSizing = 'border-box';
    chartSvg.style.display = 'block';
    chartSvg.style.background = DEFAULT_SCALE_BACKGROUND_COLOR;
    chartSvg.style.borderBottom = 'solid 1px gray';
    chartSvg.style.cursor = 'pointer';

    // marker
    const marker = this._markerSvg = document.createElementNS(SVG_NAMESPACE, "polygon");
    marker.setAttribute('points', POINTS);
    marker.setAttribute('fill', MARKER_COLOR);
    chartSvg.appendChild(marker);

    // user event
    chartSvg.addEventListener('click', (e)=> {
      const chartRect = chartSvg.getBoundingClientRect();
      const x = e.clientX - chartRect.left;
      this._app.currentTick = this.xToTick(x)
    });
  }

  // resolution/barWidth/barNumが更新されたらupdate
  setMeasures(state) {
    // reset
    this._measureTexts.forEach(numLabel => {
      numLabel.remove();
    });

    for (let i = 1; i <= state.barNum; i++) {
      let numLabel = this._measureTexts.find((textElement) => {
        return textElement.parent === null;
      });
      if (!numLabel) {
        numLabel = new SvgText();
        this._measureTexts.push(numLabel);
      }
      numLabel.fontSize = state.trackHeight * 0.6;
      numLabel.x = i * state.barWidth;
      numLabel.text = String(i);
      numLabel.append(this._chartSvg);
    }
  }

  render(newState) {
    const chartSvg = this._chartSvg
    let chartWidthUpdateFlag = false;
    let measureTextUpdateFlag = false;
    let chartHeightUpdateFlag = false;
    let currentTickUpdateFlag = false;
    let convertFactorRecalcFlag = false;
    newState = Object.assign({}, defaultState, newState);

    shallowDiff(this._state, newState).forEach(diff => {
      const key = diff.key;
      if (key === "barNum" || key === "barWidth") {
        chartWidthUpdateFlag = true;
        measureTextUpdateFlag = true;
        if (key === "barWidth") {
          convertFactorRecalcFlag = true;
          currentTickUpdateFlag = true;
        }
      } else if (key === "trackHeight") {
        chartHeightUpdateFlag = true;
      } else if (key === "currentTick") {
        currentTickUpdateFlag = true;
      } else if (key === "resolution") {
        convertFactorRecalcFlag = true;
        currentTickUpdateFlag = true;
      }
    });

    /* update cached parameters */
    if (convertFactorRecalcFlag) {
      this._xToTickFactor = newState.resolution / newState.barWidth;
      this._tickToXFactor = 1 / newState.resolution * newState.barWidth;
    }

    /* update views */
    if (chartWidthUpdateFlag) {
      this._chartWidth = newState.barWidth * newState.barNum;
      chartSvg.setAttribute('width', String(this._chartWidth));
    }
    if (chartHeightUpdateFlag) {
      this._chartHeight = newState.trackHeight;
      chartSvg.setAttribute('height', String(this._chartHeight));
    }
    if (currentTickUpdateFlag) {
      this._markerSvg.style.transform = `translate(${this.tickToX(newState.currentTick)}px, ${this._chartHeight - MARKER_H}px)`;
    }
    if (measureTextUpdateFlag) {
      this.setMeasures(newState);
    }

  }
}