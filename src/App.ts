import { TrackChart } from "./components/TrackChart";
import { TrackHeader } from "./components/TrackHeader";
import { TrackModel } from "./TrackModel";
import { createDiv } from "./utils";
const SCROLL_BAR_SIZE = 17;

interface AppParam {
  root: string
  width: number
  headerWidth: number
  trackHeight: number
  hideHorizontalScrollBar: boolean
}

/**
 * @class App
 */
export class App {
  public root: HTMLElement
  headerContainer: HTMLElement
  chartContainer: HTMLElement
  chartInner: HTMLDivElement
  private _headerWidth = 0;
  // private _trackModels = {}
  private _trackModels = []

  constructor(params: AppParam) {
    if (params.root != null) {
      this.root = document.querySelector(params.root);
    } else {
      this.root = createDiv();
    }
    // this._trackHeight = params.trackHeight;
    // this._headerWidth = params.headerWidth;
    // const cssLeft = this._headerWidth + "px";

    // app-wrapper
    const wrapper = createDiv();
    wrapper.style.width = params.width + "px";
    wrapper.style.background = "gray";
    this.root.appendChild(wrapper);

    // track-wrapper
    const trackWrapper = createDiv();
    trackWrapper.style.display = "flex";
    // trackWrapper.style.background = "limegreen"; // チャート長さが足りないときの背景色
    // trackWrapper.style.width = params.width + "px"; // チャート長さが足りないときは？
    trackWrapper.style.position = "relative";
    wrapper.appendChild(trackWrapper);

    // header
    const headerContainer = this.headerContainer = createDiv();
    // headerContainer.style.width = cssLeft;
    headerContainer.style.margin = "0px";
    headerContainer.style.padding = "0px";
    headerContainer.style.textAlign = "center";
    trackWrapper.appendChild(this.headerContainer)

    // chart
    const chartContainer = this.chartContainer = createDiv();
    chartContainer.style.position = "absolute";
    // chartContainer.style.left = cssLeft;
    // chartContainer.style.width = `calc(100% - ${cssLeft})`;
    if (params.hideHorizontalScrollBar) chartContainer.style.overflow = "hidden"; // hide h-scroll bar
    trackWrapper.appendChild(chartContainer);

    // chart-inner：svgをwrapし、スクロールを行う
    const chartInner = this.chartInner = createDiv();
    chartInner.style.overflowX = "scroll";
    chartInner.style.overflowY = "hidden"; // hide scroll bar
    chartInner.style.width = `calc(100% + ${SCROLL_BAR_SIZE}px)`; // hide v-scroll bar
    chartContainer.appendChild(chartInner);


    if (!params.hideHorizontalScrollBar) {
      // 水平ScrollBarエリア用に領域確保
      const scrollBarContainer = document.createElement("div");
      scrollBarContainer.style.width = "100%";
      scrollBarContainer.style.height = `${SCROLL_BAR_SIZE}px`;
      scrollBarContainer.style.background = "yellow";
      wrapper.appendChild(scrollBarContainer);
    }

    // init
    this.headerWidth = params.headerWidth;
  }

  set barWidth(v: number) {
    this._trackModels.forEach((tm)=> {
      tm.barWidth = v;
    });
  }

  set headerWidth(v: number) {
    this._headerWidth = v;
    const cssLeft = this._headerWidth + "px";
    this.headerContainer.style.width = cssLeft;
    this.chartContainer.style.left = cssLeft;
    this.chartContainer.style.width = `calc(100% - ${cssLeft})`;
  }

  /**
   * Add Note-track
   * @param data
   * @param key
   * @returns {TrackModel}
   */
  addTrack(data) {
    /* Model:　変化したらrenderを発火 */
    const trackModel = new TrackModel(data);
    const dataClone = trackModel.getData();

    // header
    const headerGroup = new TrackHeader().append(this.headerContainer);
    headerGroup.render(dataClone);

    // note-chart
    var chart = new TrackChart().append(this.chartInner);
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

    this._trackModels.push(trackModel);

    return trackModel;
  }

  /**
   * scaleTrack
   */
  addScaleTrack() {

  }
}
