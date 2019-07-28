import { TrackBackgroundParams, TRACK_DEFAULT_EVEN_COLOR, TRACK_MAJOR_LINE_COLOR, TRACK_MINOR_LINE_COLOR, TRACK_DEFAULT_DIV_NUM, TRACK_DEFAULT_ODD_COLOR, TRACK_DEFAULT_HEIGHT, TRACK_DEFAULT_WIDTH, TRACK_MAJOR_LINE_WIDTH, TRACK_MINOR_LINE_WIDTH } from "./config";
const DEFAULT_PARAMS = {
  width: TRACK_DEFAULT_WIDTH,
  height: TRACK_DEFAULT_HEIGHT,
  evenBackgroundColor: TRACK_DEFAULT_EVEN_COLOR,
  oddBackgroundColor: TRACK_DEFAULT_ODD_COLOR,
  majorLineColor: TRACK_MAJOR_LINE_COLOR,
  minorLineColor: TRACK_MINOR_LINE_COLOR,
  divNum: TRACK_DEFAULT_DIV_NUM,
};
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

/**
 * @param {Element} trackElement
 * @returns void
 */
export function setTrackBackground(
  targetElement: SVGElement|HTMLElement,
  params: TrackBackgroundParams
):void {
  params = Object.assign({}, DEFAULT_PARAMS, params);
  canvas.width = params.width;
  canvas.height = params.height * 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // トラック背景色
  for (var i = 0; i < 2; i++) {
    ctx.fillStyle = (i%2 === 0) ? params.evenBackgroundColor : params.oddBackgroundColor;
    ctx.fillRect(0, i*params.height, canvas.width, params.height);
  }

  // ラインの描画
  const divNum = params.divNum;
  const tickWidth = params.width / divNum;
  for (var i = 0; i <= divNum; i++) {
    const isMajor = (i%divNum === 0);
    ctx.lineWidth = (isMajor) ? TRACK_MAJOR_LINE_WIDTH : TRACK_MINOR_LINE_WIDTH;
    ctx.strokeStyle = (isMajor) ? TRACK_MAJOR_LINE_COLOR : TRACK_MINOR_LINE_COLOR;
    ctx.beginPath();
    ctx.moveTo(i*tickWidth, 0);
    ctx.lineTo(i*tickWidth, canvas.height);
    ctx.stroke();
  }
  targetElement.style.background = `url('${canvas.toDataURL()}')`;
  // document.appendChild(canvas)
}
