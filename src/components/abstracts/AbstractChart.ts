import EventEmitter from 'wolfy87-eventemitter';

export abstract class AbstractChart extends EventEmitter {

  protected _chartSvg: SVGSVGElement
  protected _chartWidth: number = 0
  protected _chartHeight: number = 0

  /**
   * tickToX
   * convert tick to real-x position
   * _tickToXFactor = (1 / resolution) * barWidth
   * so recalcutaion is required when resolution or barWidth is updated
   */
  protected _tickToXFactor: number
  tickToX(tick: number): number {
    // return tick / this._state.resolution * this._state.barWidth;
    return tick * this._tickToXFactor;
  }

  /**
   * xToTick
   * convert x position to tick
   * _xToTickFactor = resolution / barWidth
   * so recalcutaion is required when resolution or barWidth is updated
   */
  protected _xToTickFactor: number
  xToTick(x: number): number {
    // return x * this._state.resolution / this._state.barWidth;
    return x * this._xToTickFactor;
  }

  /**
   * append to specified element
   */
  appendTo(parent: SVGElement | HTMLElement) {
    parent.appendChild(this._chartSvg);
    return this;
  }

  /**
   * @virtual
   */
  abstract render(state): void;

}