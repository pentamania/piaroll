const _keyState = {
  shiftKey: false,
  altKey: false,
  ctrlKey: false,
};

const handler = (e)=> {
  Object.keys(_keyState).forEach((key)=> {
    if (e[key] != null) {
      _keyState[key] = e[key];
    }
  })
}

document.addEventListener('keydown', handler);
document.addEventListener('keyup', handler);

export const KeyState = _keyState;