export class TrackModel {
  private _listeners;
  private _data;
  private _serialId = 0;

  constructor(data) {
    this._listeners = [];
    this._data = data;
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
      if (key === 'notes') {
        data[key].forEach(note => {
          note._uid = this._serialId++;
        });
      }
    });
    // console.table(this._data)
  }

  $set(target, indexOrKey, val) {
    target[indexOrKey] = val;
    // console.log(this._data);
    this.dispatchChange();
  }

  getData():object { return JSON.parse(JSON.stringify(this._data)); }

  addNote(props) {
    props._uid = this._serialId++;
    this._data.notes.push(props);
    this.dispatchChange();
  }
  // removeNote(index) {
  //   this._data.notes.splice(index, 1);
  //   console.log(this._data.notes);

  //   this.dispatchChange();
  // }
  // removeNotes(noteIndices) {
  //   noteIndices.forEach(index => {
  //     this._data.notes[index] = null;
  //   });
  //   this._data.notes = this._data.notes.filter((note)=> {
  //     return (note != null)
  //   })
  //   this.dispatchChange();
  // }

  removeNoteById(id) {
    this._data.notes = this._data.notes.filter((note) => {
      return (note._uid != id)
    })
    // console.table(this._data.notes);
    this.dispatchChange();
  }

  setNote(index:number, prop:string, val:any):void {
    this.$set(this._data.notes[index], prop, val);
    // this.notes[index][prop] = val;
  }

  setAllNotes(cb) {
    this._data.notes.forEach(cb);
    this.dispatchChange();
  }

  dispatchChange() {
    this._listeners.forEach(listener => {
      listener();
    });
  }

  subscribe(listener) {
    this._listeners.push(listener)
  }
}