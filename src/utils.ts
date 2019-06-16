export function createDiv() {
  return document.createElement('div')
}

export function cloneObj(obj) {
  return JSON.parse(JSON.stringify(obj));
};

interface shDiff {
  kind: string // "new" "edit"
  key: string
  value: any
}
export function shallowDiff(lhs: object, rhs: object): shDiff[] {
  const changes = [];
  Object.keys(rhs).forEach((key) => {
    if (typeof rhs[key] === 'object') return; // object/arrayはスルー
    if (!lhs[key]) {
      // new prop
      changes.push({ kind: "new", key: key, value: rhs[key] })
    } else {
      if (rhs[key] !== lhs[key]) {
        changes.push({ kind: "edit", key: key, value: rhs[key] })
      }
    }
    // removeはいらない？
  });
  return changes;
}


interface itemDiff {
  kind: string // "remove" "new" "edit"
  key: any
  value?: any|any[]
  // propKey?: number
  // propValue?: number
}
/**
 * notesの差分を取得
 * @param lhs any[]
 * @param rhs any[]
 * @param idKeyProp string - The key prop to detect changes of items
 */
export function arrayItemSimpleDiff(lhs, rhs, idKeyProp): itemDiff[] {
  const changes = [];
  const rArrayClone = rhs.slice(0);
  lhs.forEach((lNote) => {
    const searchResult = rhs.find((rNote, j) => {
      // idKey対応するノートみつかる
      // console.log(idKeyProp, lNote[idKeyProp]);
      if (lNote[idKeyProp] === rNote[idKeyProp]) {
        // property差分をみつける
        const rhsNotePropsClone = cloneObj(rNote);
        Object.keys(lNote).forEach((noteProp) => {
          if (rNote[noteProp] != null) {
            /* prop exist */
            if (lNote[noteProp] !== rNote[noteProp]) {
              // console.log('prop edited', noteProp, rNote[noteProp]);
              // changes.push({ kind: "edit", key: lNote[idKeyProp], value: rNote })
              changes.push({
                kind: "edit",
                key: lNote[idKeyProp],
                value: [noteProp, rNote[noteProp]],
              });
            }
            delete rhsNotePropsClone[noteProp];
            // console.log("clone del", rhsNotePropsClone);
          } else {
            /* prop deleted */
            // console.log('prop delete', noteProp, rNote[noteProp]);
            // changes.push({ kind: "edit", key: lNote[idKeyProp], propKey: noteProp, propValue: undefined});
            changes.push({
              kind: "edit",
              key: lNote[idKeyProp],
              value: [noteProp, undefined],
            });
          }
        });

        // rhs残りprops => 新規追加されたprop
        Object.keys(rhsNotePropsClone).forEach((noteProp) => {
          if (rhsNotePropsClone[noteProp] === undefined) return;
          // console.log('prop new', noteProp, rhsNotePropsClone[noteProp]);
          /* prop new */
          changes.push({
            kind: "edit",
            key: lNote[idKeyProp],
            value: [noteProp, rhsNotePropsClone[noteProp]],
          });
          // changes.push({
          //   kind: "edit", key: lNote[idKeyProp], propKey: noteProp, propValue: rhsNotePropsClone[noteProp]
          // });
        });

        // 対応item見つかったので削除
        // rClone[j] = null;
        delete rArrayClone[j];
        return rNote;
      } // --対応itemがあった
    });
    /* key対応するitemが見つからなかった＝＝削除された */
    if (!searchResult) {
      // console.log("note removed", lNote);
      changes.push({ kind: "remove", key: lNote[idKeyProp] });
    }
  }); // --lhsループ

  /* 新規note */
  if (rArrayClone.length) {
    // console.log("new notes!!", rArrayClone);
    rArrayClone.forEach((leftNote) => {
      // console.log(leftNote[idKeyProp]);
      changes.push(
        { kind: "new", key: leftNote[idKeyProp], value: leftNote }
      )
    });
  }

  return changes;
};