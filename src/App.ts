import EventEmitter from 'wolfy87-eventemitter';
import { TrackChart } from "./components/TrackChart";
import { ScaleTrackChart } from "./components/ScaleTrackChart";
import { TrackHeader } from "./components/TrackHeader";
import { TrackModel } from "./TrackModel";
import { createDiv } from "./utils";
import { EVENT_ADD_NOTE, SCROLL_BAR_SIZE, AppParam, DEFAULT_RESOLUTION, TRACK_DEFAULT_BAR_WIDTH, TRACK_PROP_RESOLUTION, TRACK_PROP_BAR_WIDTH } from './config';
import { CSS_CLASS_APP_WRAPPER, CSS_CLASS_APP_TRACK_WRAPPER, CSS_CLASS_APP_SCROLL_BAR } from './cssSelectors';
import { CursorLine } from './components/CursorLine';

/**
 * @class App
 */
export class App extends EventEmitter {
  public root: HTMLElement
  headerContainer: HTMLElement
  chartContainer: HTMLElement
  chartInner: HTMLDivElement

  // private _trackModels = {}
  private _trackModels = []
  private _trackCharts: TrackChart[] = []
  private _cursorLine: CursorLine

  private _headerWidth = 0
  set headerWidth(v: number) {
    this._headerWidth = v;
    const cssLeft = this._headerWidth + "px";
    this.headerContainer.style.width = cssLeft;
    this.chartContainer.style.left = cssLeft;
    this.chartContainer.style.width = `calc(100% - ${cssLeft})`;
  }

  private _resolution: number = DEFAULT_RESOLUTION
  get resolution() { return this._resolution; }
  set resolution(v: number) {
    this._resolution = v;
    this._tickToXFactor = 1 / this._resolution * this._barWidth;
    this._trackModels.forEach((tm) => {
      // TODO: resolutionだけはappを通してのみ、変更可能にする？
      tm.resolution = v;
    });
  }

  private _barWidth: number = TRACK_DEFAULT_BAR_WIDTH
  get barWidth() { return this._barWidth; }
  set barWidth(v: number) {
    this._barWidth = v;
    this._tickToXFactor = 1 / this._resolution * this._barWidth;
    this._trackModels.forEach((tm) => {
      tm.barWidth = v;
    });
  }

  set barNum(v: number) {
    this._trackModels.forEach((tm) => {
      tm.barNum = v;
    });
  }

  set divNum(v: number) {
    this._trackModels.forEach((tm) => {
      tm.divNum = v;
    });
  }

  set currentTick(tick: number) {
    // console.log('tick', tick);
    this._cursorLine.x = this._tickToX(tick);
    // this._trackModels.forEach((tm) => {
    //   tm.currentTick = tick;
    // });
  }

  /**
   * convert tick to real-x
   * cache factor
   */
  private _tickToXFactor: number
  private _tickToX(tick: number): number {
    // return tick / this._resolution * this._barWidth;
    return tick * this._tickToXFactor;
  }

  constructor(params: AppParam) {
    super();

    if (params.root != null) {
      this.root = document.querySelector(params.root);
    } else {
      this.root = createDiv();
    }
    // const cssLeft = this._headerWidth + "px";

    // app-wrapper
    const wrapper = createDiv();
    wrapper.style.width = params.width + "px";
    // wrapper.style.background = "gray"; // todo
    wrapper.className = CSS_CLASS_APP_WRAPPER;
    this.root.appendChild(wrapper);

    // track-wrapper
    const trackWrapper = createDiv();
    trackWrapper.style.display = "flex";
    // trackWrapper.style.background = "limegreen"; // チャート長さが足りないときの背景色
    // trackWrapper.style.width = params.width + "px"; // チャート長さが足りないときは？
    trackWrapper.style.position = "relative";
    trackWrapper.className = CSS_CLASS_APP_TRACK_WRAPPER;
    wrapper.appendChild(trackWrapper);

    // header-container
    const headerContainer = this.headerContainer = createDiv();
    // headerContainer.style.width = cssLeft;
    headerContainer.style.margin = "0px";
    headerContainer.style.padding = "0px";
    headerContainer.style.textAlign = "center";
    trackWrapper.appendChild(this.headerContainer)

    // chart-container
    const chartContainer = this.chartContainer = createDiv();
    chartContainer.style.position = "absolute";
    // chartContainer.style.left = cssLeft;
    // chartContainer.style.width = `calc(100% - ${cssLeft})`;
    if (params.hideHorizontalScrollBar) chartContainer.style.overflow = "hidden"; // hide h-scroll bar
    trackWrapper.appendChild(chartContainer);

    // chart-inner：svgをwrapし、スクロールを行う
    const chartInner = this.chartInner = createDiv();
    chartInner.style.position = "relative";
    chartInner.style.overflowX = "scroll";
    chartInner.style.overflowY = "hidden"; // hide scroll bar
    chartInner.style.width = `calc(100% + ${SCROLL_BAR_SIZE}px)`; // hide v-scroll bar
    chartContainer.appendChild(chartInner);

    // cursor Line
    this._cursorLine = new CursorLine();
    this._cursorLine.appendTo(chartInner);

    if (!params.hideHorizontalScrollBar) {
      // 水平ScrollBar用に領域確保
      const scrollBarContainer = document.createElement("div");
      scrollBarContainer.style.width = "100%";
      scrollBarContainer.style.height = `${SCROLL_BAR_SIZE}px`;
      // scrollBarContainer.style.background = "yellow";
      scrollBarContainer.className = CSS_CLASS_APP_SCROLL_BAR;
      wrapper.appendChild(scrollBarContainer);
    }

    // init
    this.headerWidth = params.headerWidth;
    this.barWidth = params.barWidth;
    this.resolution = params.resolution;
  }

  private _preprocessData($data) {
    $data[TRACK_PROP_RESOLUTION] = this._resolution;
    $data[TRACK_PROP_BAR_WIDTH] = this._barWidth;
    return $data;
  }

  /**
   * Create model, header, and chart with scale to app.
   * It can control current tick
   * @method addScaleTrack
   * @param data
   * @returns {TrackModel}
   */
  addScaleTrack(data): TrackModel {
    /* Model */
    const scaleTrackModel = new TrackModel(this._preprocessData(data));
    const dataClone = scaleTrackModel.getData();

    // header
    const headerGroup = new TrackHeader().appendTo(this.headerContainer);
    headerGroup.render(dataClone);

    // chart
    const chart = new ScaleTrackChart(this).appendTo(this.chartInner);
    chart.render(dataClone);
    chart.model = scaleTrackModel;

    scaleTrackModel.subscribe(function () {
      headerGroup.render(scaleTrackModel.getData());
      chart.render(scaleTrackModel.getData());
    });

    this._trackModels.push(scaleTrackModel);

    return scaleTrackModel;
  }

  /**
   * Add Note-track
   * @param data
   * @returns {TrackModel}
   */
  addTrack(data): TrackModel {
    /* Model */
    const trackModel = new TrackModel(this._preprocessData(data));
    const dataClone = trackModel.getData();

    // header
    const headerGroup = new TrackHeader().appendTo(this.headerContainer);
    headerGroup.render(dataClone);

    // chart
    const chart = new TrackChart(this).appendTo(this.chartInner);
    chart.render(dataClone);
    chart.model = trackModel;

    // subscribe: modelの値が変化したらrenderを発火
    trackModel.subscribe(function () {
      headerGroup.render(trackModel.getData());
      chart.render(trackModel.getData());

      // rafにすると判定できない
      // requestAnimationFrame(function() {
      //   console.log('start');
      //   chart.render(trackModel.getData());
      // })
    });

    this._trackCharts.push(chart);
    this._trackModels.push(trackModel);

    return trackModel;
  }

  setActiveChart(activeChart) {
    this._trackCharts.forEach(chart=> {
      chart.active = false;
    });
    activeChart.active = true;
  }

  /**
   * update whole chart-height according to trackHeight change
   */
  updateHeight() {
    const chartRect = this.chartInner.getBoundingClientRect();
    this._cursorLine.height = chartRect.height - SCROLL_BAR_SIZE;
  }

}
