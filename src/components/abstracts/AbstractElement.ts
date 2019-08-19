import EventEmitter from 'wolfy87-eventemitter';

/**
 * HTML / SVG wrapper class
 */
export abstract class AbstractElement extends EventEmitter {

  element: HTMLElement | SVGElement

  get classList() { return this.element.classList; }
  get parent() { return this.element.parentElement; }

  appendTo(parent: SVGElement | HTMLElement) {
    parent.appendChild(this.element);
    this.emit('append');
    return this;
  }

  remove() {
    this.parent.removeChild(this.element);
    this.emit('removed');
    return this;
  }
}