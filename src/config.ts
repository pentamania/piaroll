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

// css classes
const CSS_NS = "piaroll";
export const CSS_CLASS_APP_WRAPPER = `${CSS_NS}-App_Wrapper`;
export const CSS_CLASS_APP_TRACK_WRAPPER = `${CSS_NS}-App_TrackWrapper`;
export const CSS_CLASS_APP_SCROLL_BAR = `${CSS_NS}-ScrollBarContainer`;
export const CSS_CLASS_SCALE_TRACK_CHART = `${CSS_NS}-ScaleTrackChart`;
export const CSS_CLASS_SCALE_TRACK_MARKER = `${CSS_NS}-ScaleTrackChart_TimeMarker`;
export const CSS_CLASS_SCALE_TRACK_NUMLABEL = `${CSS_NS}-ScaleTrackChart_NumberLabel`;
export const CSS_CLASS_TRACK_CHART = `${CSS_NS}-TrackChart`;
export const CSS_CLASS_TRACK_CURRENT_LINE = `${CSS_NS}-TrackChart_TimeMarkerLine`;
export const CSS_CLASS_TRACK_BRUSH_RECT = `${CSS_NS}-TrackChart_BrushRect`;
export const CSS_CLASS_NOTE_RECT = `${CSS_NS}-TrackChart_NoteRect`;
export const CSS_CLASS_NOTE_RECT_EXTENSION_RECT = `${CSS_NS}-TrackChart_NoteExtensionElement`;
export const CSS_CLASS_NOTE_RECT_INPUT_LABEL = `${CSS_NS}-TrackChart_NoteInputLabel`;
export const CSS_CLASS_TRACK_HEADER = `${CSS_NS}-TrackHeader`;
export const CSS_CLASS_TRACK_HEADER_LABEL = `${CSS_NS}-TrackHeader_Label`;
export const CSS_CLASS_TRACK_HEADER_BUTTON = `${CSS_NS}-TrackHeader_Button`;

// events
export const EVENT_POINT_START_CHART = 'onpointchart';
export const EVENT_ADD_NOTE = 'addnote';
export const EVENT_EDIT_NOTE = 'editnote';
export const EVENT_REMOVE_NOTE = 'removenote';
export const EVENT_FAIL_NOTE_REMOVE = 'failnoteremoval';

