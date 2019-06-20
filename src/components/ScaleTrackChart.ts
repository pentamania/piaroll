import {
  SVG_NAMESPACE,
  TRACK_DEFAULT_STATE as defaultState,
  MARKER_COLOR,
 } from "../config";
import { shallowDiff } from "../utils";
import { SvgText } from "./SvgText";
import { AbstractChart } from "./abstracts/AbstractChart";
const DEFAULT_SCALE_BACKGROUND_COLOR = "#645F8B";

// marker config
const markerH = 6;
const markerRad = 10;
const points = `-${markerRad},-${markerH / 2} ${markerRad},-${markerH / 2} 0,${markerH}`

/**
 * @class ScaleChart
 * 目盛り領域
 */
export class ScaleTrackChart extends AbstractChart {

  private _measureTexts: SvgText[] = []
  private _state = { tracks: []}
  private _markerSvg: SVGPolygonElement

  constructor() {
    super();

    // main chart
    const chartSvg = this._chartSvg = document.createElementNS(SVG_NAMESPACE, "svg");
    chartSvg.style.boxSizing = 'border-box';
    chartSvg.style.display = 'block';
    chartSvg.style.background = DEFAULT_SCALE_BACKGROUND_COLOR;
    chartSvg.style.borderBottom = 'solid 1px gray';

    // marker
    const marker = this._markerSvg = document.createElementNS(SVG_NAMESPACE, "polygon");
    marker.setAttribute('points', points);
    marker.setAttribute('fill', MARKER_COLOR);
    chartSvg.appendChild(marker);

    chartSvg.addEventListener('click', (e)=> {
      // TODO: set currentTick via app
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
      this._markerSvg.style.transform = `translate(${this.tickToX(newState.currentTick)}px, ${this._chartHeight - markerH}px)`;
    }
    if (measureTextUpdateFlag) {
      this.setMeasures(newState);
    }

  }
}