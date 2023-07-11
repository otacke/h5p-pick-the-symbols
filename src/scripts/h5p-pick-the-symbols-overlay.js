import Util from './h5p-pick-the-symbols-util';

/** Class representing the content */
export default class Overlay {
  /**
   * @class
   * @param {object} params Parameters.
   * @param {HTMLElement} params.content Content to set.
   * @param {object} callbacks Callbacks.
   */
  constructor(params, callbacks = {}) {
    this.params = Util.extend({
      container: document.body,
      styleBase: 'h5p-pick-the-symbols-overlay',
      position: {
        offsetHorizontal : 0,
        offsetVertical : 0
      }
    }, params);

    this.callbacks = callbacks;
    this.callbacks.onClose = callbacks.onClose || (() => {});

    this.isVisible = false;
    this.focusableElements = [];

    this.overlay = document.createElement('div');
    this.overlay.classList.add(`${this.params.styleBase}-outer-wrapper`);
    this.overlay.classList.add('h5p-pick-the-symbols-invisible');
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-label', this.params.l10n.title);
    this.overlay.setAttribute('aria-modal', 'true');

    this.marker = document.createElement('div');
    this.marker.classList.add(`${this.params.styleBase}-marker`);
    this.overlay.appendChild(this.marker);

    this.content = document.createElement('div');
    this.content.classList.add(`${this.params.styleBase}-content`);
    this.content.appendChild(this.params.content);
    this.overlay.appendChild(this.content);

    this.buttonClose = document.createElement('button');
    this.buttonClose.classList.add(`${this.params.styleBase}-button-close`);
    this.buttonClose.setAttribute('title', this.params.l10n.closeWindow);
    this.buttonClose.addEventListener('click', () => {
      this.callbacks.onClose();
    });
    this.overlay.appendChild(this.buttonClose);

    // Trap focus if overlay is visible
    document.addEventListener('focus', (event) => {
      if (!this.isVisible || this.focusableElements.length === 0) {
        return;
      }

      this.trapFocus(event);
    }, true);
  }

  /**
   * Return the DOM for this class.
   * @returns {HTMLElement} DOM for this class.
   */
  getDOM() {
    return this.overlay;
  }

  /**
   * Get absolute coordinates for the overlay.
   * @param {HTMLElement} element Reference element to show overlay message for.
   * @param {HTMLElement} overlay Overlay element.
   * @param {object} [position] Relative positioning of the overlay message.
   * @param {string} [position.horizontal] [before|left|centered|right|after].
   * @param {string} [position.vertical] [above|top|centered|bottom|below].
   * @param {number} [position.offsetHorizontal] Extra horizontal offset.
   * @param {number} [position.offsetVertical] Extra vetical offset.
   * @param {boolean} [position.noOverflowLeft] True to prevent overflow left.
   * @param {boolean} [position.noOverflowRight] True to prevent overflow right.
   * @param {boolean} [position.noOverflowTop] True to prevent overflow top.
   * @param {boolean} [position.noOverflowBottom] True to prevent overflow bottom.
   * @param {boolean} [position.noOverflowX] True to prevent overflow left and right.
   * @param {boolean} [position.noOverflowY] True to prevent overflow top and bottom.
   * @returns {object} Coordinates.
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

    return { left: left, top: top };
  }

  /**
   * Get coordinates for marker.
   * @param {HTMLElement} element Element to fix to.
   * @param {HTMLElement} marker Marker.
   * @param {number} [overlayPosition] Vertical offset.
   * @returns {object} Coordinates.
   */
  getMarkerCoordinates(element, marker, overlayPosition = 0) {
    const elementRect = element.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();

    let left = - overlayPosition + elementRect.left + (elementRect.width - markerRect.width) / 2;
    let top = marker.style.top || 0;

    return { left: left, top: top };
  }

  /**
   * Visually attach to parent element.
   * @param {HTMLElement} element Element to attach to.
   * @returns {object} Position.
   */
  moveTo(element) {
    // Content has to be set before getting the coordinates

    const closeButtonOffset = parseFloat(window.getComputedStyle(this.buttonClose).getPropertyValue('width')) +
      parseFloat(window.getComputedStyle(this.buttonClose).getPropertyValue('right'));

    let coordinates = this.getOverlayCoordinates(element, this.overlay, this.params.position);
    this.overlay.style.left = `${Math.round(coordinates.left - closeButtonOffset)}px`;
    this.overlay.style.top = `${Math.round(coordinates.top)}px`;

    coordinates = this.getMarkerCoordinates(element, this.marker, Math.round(coordinates.left));
    this.marker.style.left = `${Math.round(coordinates.left + closeButtonOffset)}px`;

    return { left: this.overlay.style.left, top: this.overlay.style.top };
  }

  /**
   * Set overlay content.
   * @param {HTMLElement} content Content to set.
   */
  setContent(content) {
    while (this.content.firstChild) {
      this.content.removeChild(this.content.firstChild);
    }
    this.content.appendChild(content);
  }

  /**
   * Trap focus in overlay.
   * @param {Event} event Focus event.
   */
  trapFocus(event) {
    if (this.isChild(event.target)) {
      this.currentFocusElement = event.target;
      return; // Focus is inside overlay
    }

    // Focus was either on first or last overlay element
    if (this.currentFocusElement === this.focusableElements[0]) {
      this.currentFocusElement = this.focusableElements[this.focusableElements.length - 1];
    }
    else {
      this.currentFocusElement = this.focusableElements[0];
    }
    this.currentFocusElement.focus();
  }

  /**
   * Check whether an HTML element is a child of the overlay.
   * @param {HTMLElement} element Element.
   * @returns {boolean} True, if element is a child.
   */
  isChild(element) {
    const parent = element.parentNode;

    if (!parent) {
      return false;
    }

    if (parent === this.overlay) {
      return true;
    }

    return this.isChild(parent);
  }

  /**
   * Update list of focusable elements.
   */
  updateFocusableElements() {
    this.focusableElements = []
      .slice.call(this.overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter((element) => element.getAttribute('disabled') !== 'true' && element.getAttribute('disabled') !== true);
  }

  /**
   * Show overlay.
   */
  show() {
    this.overlay.classList.remove('h5p-pick-the-symbols-invisible');

    this.updateFocusableElements();
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }

    this.isVisible = true;
  }

  /**
   * Hide overlay.
   */
  hide() {
    this.isVisible = false;
    this.overlay.classList.add('h5p-pick-the-symbols-invisible');
  }
}
