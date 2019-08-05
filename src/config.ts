// general const
const DEFAULT_RESOLUTION = 1920;
export const TRACK_DEFAULT_HEIGHT = 60;
export const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

// app const
export interface AppParam {
  root: string
  width: number
  headerWidth: number
  trackHeight: number
  hideHorizontalScrollBar: boolean
}

// Note/NoteRect const
export const DEFAULT_TRACK_ID = 0;
export const NOTE_ID_KEY = "__piano_uid__";
export const NOTE_PROP_START_TICK = 'tick';
export const NOTE_PROP_TRACK = 'trackId';
export const NOTE_PROP_DURATION = 'duration';
export const NOTE_PROP_LABEL = 'label';
export const NOTE_PROP_SELECTED = 'selected';
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
// note-rect style
export const NOTE_DEFAULT_WIDTH = 16;
export const NOTE_RECT_DEFAULT_FILL = "#FE7A8E";
export const NOTE_RECT_STROKE_WIDTH = 2;
export const NOTE_RECT_ACTIVE_STROKE_STYLE = "#FFF";
export const EXTENSION_RECT_WIDTH = 4;
export const EXTENSTION_RECT_FILL = "#ce3939";
export const NOTE_RECT_INPUT_ELEMENT_WIDTH = 36;
export const NOTE_RECT_INPUT_ELEMENT_HEIGHT = 16;
export const NOTE_RECT_INPUT_ELEMENT_LEFT = 4;

// chart/track const
export const SELECTION_MIN_THRESHOLD = 4;
export const NOTE_DRAGGING_THRESHOLD = 2;
export const TRACK_PROP_RESOLUTION = 'resolution';
export const TRACK_PROP_BAR_NUM = 'barNum';
export const TRACK_PROP_BAR_WIDTH = 'barWidth';
export const TRACK_PROP_HEIGHT = 'trackHeight';
export const TRACK_PROP_CURRENT = 'currentTick';
export const TRACK_PROP_DIV_NUM = 'divNum';
export const TRACK_PROP_NOTES = 'notes';
export const TRACK_PROP_TRACKS = 'tracks';
export const TRACK_MODEL_PROPERTIES = Object.freeze([
  TRACK_PROP_RESOLUTION,
  TRACK_PROP_BAR_NUM,
  TRACK_PROP_BAR_WIDTH,
  TRACK_PROP_HEIGHT,
  TRACK_PROP_CURRENT,
  TRACK_PROP_DIV_NUM,
  TRACK_PROP_NOTES,
  TRACK_PROP_TRACKS,
]);
export const TRACK_DEFAULT_STATE = Object.freeze({
  resolution: DEFAULT_RESOLUTION,
  barNum: 1,
  barWidth: 80,
  trackHeight: TRACK_DEFAULT_HEIGHT,
  currentTick: 0,
  divNum: 4,
  notes: [],
  tracks: []
});
export interface TrackState {
  barNum?: number
  barWidth?: number
  // trackNum?: number
  trackHeight?: number
  currentTick?: number
  notes: iNoteParam[]
  tracks: []
}

// app style
export const SCROLL_BAR_SIZE = 17;

// track background style
export interface TrackBackgroundParams {
  width?: number
  height?: number
  oddBackgroundColor?: string
  evenBackgroundColor?: string
  divNum?: number
}
export const TRACK_DEFAULT_EVEN_COLOR = "#ACC0EA";
export const TRACK_DEFAULT_ODD_COLOR = "#4D6FA8";
export const TRACK_MAJOR_LINE_WIDTH = 3;
export const TRACK_MINOR_LINE_WIDTH = 1;
export const TRACK_MAJOR_LINE_COLOR = "#000";
export const TRACK_MINOR_LINE_COLOR = "#91A46A";
export const TRACK_DEFAULT_DIV_NUM = 4;
export const TRACK_DEFAULT_WIDTH = 120;
export const SCALE_TRACK_DEFAULT_BACKGROUND_COLOR = "#645F8B";

// marker style
const MARKER_RAD = 9;
export const MARKER_HEIGHT = 7;
export const MARKER_COLOR = "rgb(255, 50, 5)";
export const MARKER_PATH_POINTS = `-${MARKER_RAD},-${MARKER_HEIGHT / 2} ${MARKER_RAD},-${MARKER_HEIGHT / 2} 0,${MARKER_HEIGHT}`
export const MARKER_LINE_DEFAULT_WIDTH = 3;
export const HEADER_DEFAULT_STATE = Object.freeze({
  trackHeight: TRACK_DEFAULT_HEIGHT,
  tracks: []
});
export const BRUSH_DEFAULT_FILL = "rgba(255,255,255, 0.4)";

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

// event symbols
export const EVENT_POINT_START_CHART = 'pointchart';
export const EVENT_ADD_NOTE = 'addnote';
export const EVENT_EDIT_NOTE = 'editnote';
export const EVENT_REMOVE_NOTE = 'removenote';
export const EVENT_SELECT_NOTE = 'selectnote';
export const EVENT_FAIL_NOTE_REMOVE = 'failnoteremoval';
// export const EVENT_CHANGE_CURRENT = 'changecurrenttick';
export const _EVENT_NOTERECT_REMOVED = 'removed';

// other
export type StrOrNum = string | number;
