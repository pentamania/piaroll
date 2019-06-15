export function createDiv() {
  return document.createElement('div')
}
export function cloneObj(obj) {
  return JSON.parse(JSON.stringify(obj));
};