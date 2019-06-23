const DEFAULT_RESOLUTION = 1920;
const TRACK_DEFAULT_HEIGHT = 60;

export const NOTE_WIDTH = 8;
export const NOTE_ID_KEY = "__piano_uid__";
export const CHART_PADDING = {
  left: 30,
  top: 30,
};
export const TRACK_WIDTH = 500;
export const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
export const TRACK_MODEL_PROPERTIES = [
  'resolution',
  'barWidth',
  'barNum',
  'trackHeight',
  'currentTick',
  'divNum',
  'notes',
  'tracks',
];
export const TRACK_DEFAULT_STATE = Object.freeze({
  resolution: DEFAULT_RESOLUTION,
  barNum: 1,
  barWidth: 80,
  trackHeight: TRACK_DEFAULT_HEIGHT,
  currentTick: 0,
  divNum: 4,
  notes: [],
  tracks: []
})
export const MARKER_COLOR = "rgb(255, 50, 5)";

export interface iNoteParam {
  trackId: number
  tick: number // change later
  duration?: number
  fill?: string
  extendable?: boolean|string
  selected?: boolean
}