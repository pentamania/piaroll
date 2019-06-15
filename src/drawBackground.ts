interface iParams {
  width?: number
  height?: number
  oddBackgroundColor?: string
  evenBackgroundColor?: string
  divNum?: number
  // tickWidth: number
}

const evenTrackBackgroundColor = "#ACC0EA";
const oddTrackBackgroundColor = "#4D6FA8";
const MAJOR_LINE_WIDTH = 3;
const MINOR_LINE_WIDTH = 1;
const MAJOR_LINE_COLOR = "#000";
const MINOR_LINE_COLOR = "#91A46A";

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const DEFAULT_PARAMS = {
  width: 120,
  height: 22,
  evenBackgroundColor: evenTrackBackgroundColor,
  oddBackgroundColor: oddTrackBackgroundColor,
  majorLineColor: MAJOR_LINE_COLOR,
  minorLineColor: MINOR_LINE_COLOR,
  divNum: 4,
};

/**
 * @param {Element} trackElement
 * @returns void
 */
export function setTrackBackground(targetElement:Element, params:iParams):void {
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
    ctx.lineWidth = (isMajor) ? MAJOR_LINE_WIDTH : MINOR_LINE_WIDTH;
    ctx.strokeStyle = (isMajor) ? MAJOR_LINE_COLOR : MINOR_LINE_COLOR;
    ctx.beginPath();
    ctx.moveTo(i*tickWidth, 0);
    ctx.lineTo(i*tickWidth, canvas.height);
    ctx.stroke();
  }
  targetElement.style.background = `url('${canvas.toDataURL()}')`;
  // document.appendChild(canvas)
}
