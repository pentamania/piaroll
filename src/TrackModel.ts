import { NOTE_ID_KEY } from "./config";

export class TrackModel {
  private _listeners;
  private _data;
  private _serialId = 0;

  constructor(data) {
    this._listeners = [];
    this._data = data;

    /* add accessor: defaultアクセサを用意？ */
    Object.keys(data).forEach((key)=> {
      Object.defineProperty(this, key, {
        get() { return data[key]; },
        set(v) {
          data[key] = v;
          this.dispatchChange();
        },
        enumerable: true,
        configurable: true
      })
      // add id to each note
      if (key === 'notes') {
        data[key].forEach(note => {
          // note[NOTE_ID_KEY] = this._serialId++;
          Object.defineProperty(note, NOTE_ID_KEY, {
            value: this._serialId++,
            writable: false,
            enumerable: true, // getDataでクローンを渡す際に必要
            configurable: false
          })

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
    this._data.notes.push(props);
    this.dispatchChange();
  }

  removeNoteById(id) {
    if (id.length) {
      id.forEach(_id => {
        this._data.notes = this._data.notes.filter((note) => {
          return (note[NOTE_ID_KEY] != _id)
        })
      });
    } else {
      this._data.notes = this._data.notes.filter((note) => {
        return (note[NOTE_ID_KEY] != id)
      })
    }
    // console.table(this._data.notes);
    this.dispatchChange();
  }

  // setNote(index:number, prop:string, val:any):void {
  //   this.$set(this._data.notes[index], prop, val);
  //   // this.notes[index][prop] = val;
  // }

  setNoteById(id: number, prop: string, val: any) {
    var target = this._data.notes.find((note)=> {
      return note[NOTE_ID_KEY] === id;
    });
    console.log(prop, target);

    if (target) {
      target[prop] = val;
      this.dispatchChange();
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