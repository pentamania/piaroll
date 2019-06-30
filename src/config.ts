// genearal const
const DEFAULT_RESOLUTION = 1920;
const TRACK_DEFAULT_HEIGHT = 60;

// Note/NoteRect const
export const NOTE_WIDTH = 8;
export const DEFAULT_TRACK_ID = 0;
export const NOTE_ID_KEY = "__piano_uid__";
export const NOTE_PROP_TRACK = 'trackId';
export const NOTE_PROP_LABEL = 'label';
export const NOTE_PROP_REMOVABLE = 'removable';
export const NOTE_PROP_SHIFTABLE = 'shiftable';
export interface iNoteParam {
  tick: number // change later?
  trackId?: number
  duration?: number
  fill?: string
  label?: string
  selected?: boolean
  extendable?: boolean|string
  removable?: boolean
  shiftable?: boolean
}

// chart/track const
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
export const HEADER_DEFAULT_STATE = Object.freeze({
  trackHeight: TRACK_DEFAULT_HEIGHT,
  tracks: []
})

// events
export const EVENT_POINT_START_CHART = 'onpointchart';
export const EVENT_ADD_NOTE = 'addnote';
export const EVENT_EDIT_NOTE = 'editnote';
export const EVENT_REMOVE_NOTE = 'removenote';
export const EVENT_FAIL_NOTE_REMOVE = 'failnoteremoval';

