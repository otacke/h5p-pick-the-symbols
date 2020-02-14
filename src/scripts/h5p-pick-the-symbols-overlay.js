import Util from './h5p-pick-the-symbols-util';

/** Class representing the content */
export default class Overlay {
  /**
   * @constructor
   *
   * @param {object} params Parameters.
   * @param {HTMLElement} params.content Content to set.
   */
  constructor(params) {
    this.params = Util.extend({
      container: document.body,
      styleBase: 'h5p-pick-the-symbols-overlay'
    }, params);

    this.overlay = document.createElement('div');
    this.overlay.classList.add(`${this.params.styleBase}-outer-wrapper`);
    this.overlay.classList.add('h5p-pick-the-symbols-invisible');

    this.marker = document.createElement('div');
    this.marker.classList.add(`${this.params.styleBase}-marker`);
    this.overlay.appendChild(this.marker);

    this.content = document.createElement('div');
    this.content.classList.add(`${this.params.styleBase}-content`);
    this.content.appendChild(this.params.content);
    this.overlay.appendChild(this.content);
  }

  /**
   * Return the DOM for this class.
   *
   * @return {HTMLElement} DOM for this class.
   */
  getDOM() {
    return this.overlay;
  }

  /**
   * Get absolute coordinates for the overlay.
   *
   * @param {DOM} element Reference element to show overlay message for.
   * @param {DOM} overlay Overlay element.
   * @param {object} [position={}] Relative positioning of the overlay message.
   * @param {string} [position.horizontal=centered] [before|left|centered|right|after].
   * @param {string} [position.vertical=below] [above|top|centered|bottom|below].
   * @param {number} [position.offsetHorizontal=0] Extra horizontal offset.
   * @param {number} [position.offsetVertical=0] Extra vetical offset.
   * @param {boolean} [position.noOverflowLeft=false] True to prevent overflow left.
   * @param {boolean} [position.noOverflowRight=false] True to prevent overflow right.
   * @param {boolean} [position.noOverflowTop=false] True to prevent overflow top.
   * @param {boolean} [position.noOverflowBottom=false] True to prevent overflow bottom.
   * @param {boolean} [position.noOverflowX=false] True to prevent overflow left and right.
   * @param {boolean} [position.noOverflowY=false] True to prevent overflow top and bottom.
   * @return {object}
   */
  getOverlayCoordinates(element, overlay, position) {
    position = position || {};
    position.offsetHorizontal = position.offsetHorizontal || 0;
    position.offsetVertical = position.offsetVertical || 0;

    const overlayRect = overlay.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    let left = 0;
    let top = 0;

    // Compute horizontal position
    switch (position.horizontal) {
      case 'before':
        left = elementRect.left - overlayRect.width - position.offsetHorizontal;
        break;
      case 'after':
        left = elementRect.left + elementRect.width + position.offsetHorizontal;
        break;
      case 'left':
        left = elementRect.left + position.offsetHorizontal;
        break;
      case 'right':
        left = elementRect.left + elementRect.width - overlayRect.width - position.offsetHorizontal;
        break;
      case 'centered':
        left = elementRect.left + elementRect.width / 2 - overlayRect.width / 2 + position.offsetHorizontal;
        break;
      default:
        left = elementRect.left + elementRect.width / 2 - overlayRect.width / 2 + position.offsetHorizontal;
    }

    // Compute vertical position
    switch (position.vertical) {
      case 'above':
        top = elementRect.top - overlayRect.height - position.offsetVertical;
        break;
      case 'below':
        top = elementRect.top + elementRect.height + position.offsetVertical;
        break;
      case 'top':
        top = elementRect.top + position.offsetVertical;
        break;
      case 'bottom':
        top = elementRect.top + elementRect.height - overlayRect.height - position.offsetVertical;
        break;
      case 'centered':
        top = elementRect.top + elementRect.height / 2 - overlayRect.height / 2 + position.offsetVertical;
        break;
      default:
        top = elementRect.top + elementRect.height + position.offsetVertical;
    }

    // Prevent overflow
    const overflowElement = document.body;
    const bounds = overflowElement.getBoundingClientRect();
    if ((position.noOverflowLeft || position.noOverflowX) && (left < bounds.x)) {
      left = bounds.x;
    }
    if ((position.noOverflowRight || position.noOverflowX) && ((left + overlayRect.width) > (bounds.x + bounds.width))) {
      left = bounds.x + bounds.width - overlayRect.width;
    }
    if ((position.noOverflowTop || position.noOverflowY) && (top < bounds.y)) {
      top = bounds.y;
    }
    if ((position.noOverflowBottom || position.noOverflowY) && ((top + overlayRect.height) > (bounds.y + bounds.height))) {
      left = bounds.y + bounds.height - overlayRect.height;
    }

    return {left: left, top: top};
  }

  /**
   * Get coordinates for marker.
   * @param {HTMLElement} element Element to fix to.
   * @param {HTMLElement} marker Marker.
   * @param {number} [overlayOffset=0] Vertical offset.
   */
  getMarkerCoordinates(element, marker, overlayPosition = 0) {
    const elementRect = element.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();

    let left = - overlayPosition + elementRect.left + (elementRect.width - markerRect.width) / 2;
    let top = marker.style.top || 0;

    return {left: left, top: top};
  }

  /**
   * Visually attach to parent element.
   * @param {HTMLElement} element Element to attach to.
   * @return {object} Position.
   */
  moveTo(element) {
    // Content has to be set before getting the coordinates
    let coordinates = this.getOverlayCoordinates(element, this.overlay, this.params.position);
    this.overlay.style.left = Math.round(coordinates.left) + 'px';
    this.overlay.style.top = Math.round(coordinates.top) + 'px';

    coordinates = this.getMarkerCoordinates(element, this.marker, Math.round(coordinates.left));
    this.marker.style.left = Math.round(coordinates.left) + 'px';

    return {left: this.overlay.style.left, top: this.overlay.style.top};
  }

  /**
   * Set overlay content.
   * @param {HTMLElement} content Content to set.
   */
  setContent(content) {
    while (this.overlay.firstChild) {
      this.overlay.removeChild(this.overlay.firstChild);
    }
    this.overlay.appendChild(content);
  }

  /**
   * Show overlay.
   */
  show() {
    this.overlay.classList.remove('h5p-pick-the-symbols-invisible');
  }

  /**
   * Hide overlay.
   */
  hide() {
    this.overlay.classList.add('h5p-pick-the-symbols-invisible');
  }
}
