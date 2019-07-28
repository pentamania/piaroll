import { NOTE_ID_KEY, TRACK_MODEL_PROPERTIES, EVENT_ADD_NOTE, EVENT_REMOVE_NOTE, EVENT_EDIT_NOTE, NOTE_PROP_TRACK, DEFAULT_TRACK_ID, TRACK_PROP_NOTES, } from "./config";
import EventEmitter from 'wolfy87-eventemitter';
import { StrOrNum } from "./config";

/**
 * @class TrackModel
 * @param data {any}
 */
export class TrackModel extends EventEmitter {
  private _listeners;
  private _data;
  private _serialId = 0;

  constructor(data) {
    super();
    this._listeners = [];
    this._data = data;

    /* add accessor: defaultアクセサを用意？ */
    TRACK_MODEL_PROPERTIES.forEach((key)=> {
      Object.defineProperty(this, key, {
        get() { return data[key]; },
        set(v) {
          data[key] = v;
          this.dispatchChange();
        },
        enumerable: true,
        configurable: true
      })

      if (key === TRACK_PROP_NOTES && typeof data[key] === 'object') {
        /* add id to each note */
        data[key].forEach(note => {
          // note[NOTE_ID_KEY] = this._serialId++;
          Object.defineProperty(note, NOTE_ID_KEY, {
            value: this._serialId++,
            writable: false,
            enumerable: true, // getDataでクローンを渡す際に必要
            configurable: false
          });

          /* add default */
          if (note[NOTE_PROP_TRACK] == null)
            note[NOTE_PROP_TRACK] = DEFAULT_TRACK_ID;
        });
      }
    });
    // console.table(this._data)
  }

  $set(target, indexOrKey, val) {
    target[indexOrKey] = val;
    this.dispatchChange();
  }

  getData():object { return JSON.parse(JSON.stringify(this._data)); }

  addNote(props) {
    props[NOTE_ID_KEY] = this._serialId++;
    if (props[NOTE_PROP_TRACK] == null)
      props[NOTE_PROP_TRACK] = DEFAULT_TRACK_ID;
    this._data.notes.push(props);
    this.dispatchChange();
    this.emit(EVENT_ADD_NOTE, props);
  }

  removeNoteById(id: StrOrNum | StrOrNum[]) {
    const searchAndRemove = (id)=> {
      let removed: [];
      this._data.notes.some((note, i) => {
        if (note[NOTE_ID_KEY] === id) {
          removed = this._data.notes.splice(i, 1);
          return true;
        }
      });
      return removed;
    }
    let removedNotes = [];
    if (typeof id === 'object') {
      id.forEach(_id => {
        removedNotes = removedNotes.concat(searchAndRemove(_id));
      });
    } else {
      removedNotes = removedNotes.concat(searchAndRemove(id));
    }
    // console.table(this._data.notes);
    this.dispatchChange();
    this.emit(EVENT_REMOVE_NOTE, removedNotes);
  }

  // setNote(index:number, prop:string, val:any):void {
  //   this.$set(this._data.notes[index], prop, val);
  //   // this.notes[index][prop] = val;
  // }

  getNoteById(id: number) {
    return this._data.notes.find((note)=> {
      return note[NOTE_ID_KEY] === id;
    });
  }

  setNoteById(id: number, prop: string, val: any) {
    var target = this._data.notes.find((note)=> {
      return note[NOTE_ID_KEY] === id;
    });

    if (target && target[prop] !== val) {
      target[prop] = val;
      this.dispatchChange();
      this.emit(EVENT_EDIT_NOTE, target);
      // console.log(prop, target);
    }
  }

  setAllNotes(cb) {
    this._data.notes.forEach(cb);
    this.dispatchChange();
  }

  dispatchChange() {
    this._listeners.forEach(listener => {
      listener();
      // requestAnimationFrame(listener);
    });
  }

  subscribe(listener) {
    this._listeners.push(listener)
  }
}