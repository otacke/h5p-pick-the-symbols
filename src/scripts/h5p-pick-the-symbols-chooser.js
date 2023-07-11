import Util from './h5p-pick-the-symbols-util';

/** Class representing the content */
export default class PickTheSymbolsChooser {
  /**
   * @class
   * @param {object} params Parameters.
   * @param {object} [callbacks] Callbacks.
   */
  constructor(params = {}, callbacks = {}) {
    this.params = params;

    this.callbacks = Util.extend({
      onAddBlank: () => {},
      onPickSymbol: () => {},
      onRemoveBlank: () => {},
      onResize: () => {},
      onGetVerboseSymbol: () => {}
    }, callbacks);

    this.buttons = [];

    this.hasButtonAddBlank = false;
    this.hasButtonRemoveBlank = false;

    // Build content
    this.content = document.createElement('div');
    this.content.classList.add('h5p-pick-the-symbols-chooser');

    if (this.params.l10n.title) {
      const title = document.createElement('div');
      title.classList.add('h5p-pick-the-symbols-chooser-title');
      title.innerText = Util.htmlDecode(this.params.l10n.title);
      this.content.appendChild(title);
    }

    this.symbolButtonsContainer = document.createElement('div');
    this.symbolButtonsContainer.classList.add('h5p-pick-the-symbols-chooser-symbol-buttons');
    this.content.appendChild(this.symbolButtonsContainer);

    params.symbols.forEach((symbol) => {
      const button = document.createElement('button');
      button.classList.add('h5p-joubelui-button');
      button.classList.add('h5p-pick-the-symbols-chooser-symbol-buttons-button');
      button.innerHTML = symbol;
      button.setAttribute('title', this.params.l10n.addSymbol.replace(/@symbol/g, (symbol === '&nbsp;') ? this.callbacks.onGetVerboseSymbol(symbol) : symbol));
      button.setAttribute('aria-label', this.callbacks.onGetVerboseSymbol(symbol));
      button.addEventListener('click', () => {
        this.callbacks.onPickSymbol(button.innerHTML);
      });

      this.buttons.push(button);
      this.symbolButtonsContainer.appendChild(button);
    });

    this.blankButtonsContainer = document.createElement('div');
    this.blankButtonsContainer.classList.add('h5p-pick-the-symbols-chooser-blank-buttons');
    this.blankButtonsContainer.classList.add('h5p-pick-the-symbols-none');
    this.content.appendChild(this.blankButtonsContainer);

    // Button for removing current blank
    this.buttonRemoveBlank = document.createElement('button');
    this.buttonRemoveBlank.classList.add('h5p-joubelui-button');
    this.buttonRemoveBlank.classList.add('h5p-pick-the-symbols-chooser-blank-buttons-button');
    this.buttonRemoveBlank.classList.add('h5p-pick-the-symbols-remove-blank');
    this.buttonRemoveBlank.classList.add('h5p-pick-the-symbols-disabled');
    this.buttonRemoveBlank.innerHTML = this.params.l10n.removeBlank;
    this.buttonRemoveBlank.setAttribute('title', this.params.l10n.removeBlank);
    this.buttonRemoveBlank.addEventListener('click', () => {
      this.callbacks.onRemoveBlank();
    });
    this.blankButtonsContainer.appendChild(this.buttonRemoveBlank);

    // Button for adding current blank
    this.buttonAddBlank = document.createElement('button');
    this.buttonAddBlank.classList.add('h5p-joubelui-button');
    this.buttonAddBlank.classList.add('h5p-pick-the-symbols-chooser-blank-buttons-button');
    this.buttonAddBlank.classList.add('h5p-pick-the-symbols-add-blank');
    this.buttonAddBlank.classList.add('h5p-pick-the-symbols-disabled');
    this.buttonAddBlank.innerHTML = this.params.l10n.addBlank;
    this.buttonAddBlank.setAttribute('title', this.params.l10n.addBlank);
    this.buttonAddBlank.addEventListener('click', () => {
      this.callbacks.onAddBlank();
    });
    this.blankButtonsContainer.appendChild(this.buttonAddBlank);
  }

  /**
   * Return the DOM for this class.
   * @returns {HTMLElement} DOM for this class.
   */
  getDOM() {
    return this.content;
  }

  /**
   * Resize.
   * @param {object} [params] Parameters.
   * @param {number} [params.maxWidth] Maximum width available.
   */
  resize(params = {}) {
    params.maxWidth = params.maxWidth || Infinity;

    // Get current button property values
    const buttonComputedStyle = window.getComputedStyle(this.buttons[0]);
    const buttonWidth = parseFloat(buttonComputedStyle.getPropertyValue('width'));
    const buttonMarginRight = parseFloat(buttonComputedStyle.getPropertyValue('margin-right'));

    // Compute number of buttons in row
    const maxButtonsFitting = Math.floor((params.maxWidth + buttonMarginRight) / (buttonWidth + buttonMarginRight));
    const maxButtonsInRow = Math.max(Math.min(this.buttons.length, maxButtonsFitting), 2); // At least two buttons

    // Fit content to number of buttons
    const maxWidth = maxButtonsInRow * buttonWidth + (maxButtonsInRow - 1) * buttonMarginRight;
    this.content.style.width = `${maxWidth}px`;

    this.buttons.forEach((button, index) => {
      button.classList.remove('h5p-pick-the-symbols-chooser-button-trailing');
      if ((index + 1) % maxButtonsInRow === 0) {
        button.classList.add('h5p-pick-the-symbols-chooser-button-trailing');
      }
    });

    this.resizeButtons(maxWidth);
  }

  /**
   * Toggle visibility of button for removing blank.
   * @param {boolean} state State.
   */
  toggleAddButtonAddBlank(state) {
    state = (typeof state === 'boolean') ? state : !this.hasButtonAddBlank;

    if (state) {
      this.buttonAddBlank.classList.remove('h5p-pick-the-symbols-disabled');
      this.buttonAddBlank.removeAttribute('disabled');
    }
    else {
      this.buttonAddBlank.classList.add('h5p-pick-the-symbols-disabled');
      this.buttonAddBlank.setAttribute('disabled', true);
    }
  }

  /**
   * Toggle visibility of button for removing blank.
   * @param {boolean} state State.
   */
  toggleAddButtonRemoveBlank(state) {
    state = (typeof state === 'boolean') ? state : !this.hasButtonRemoveBlank;

    if (state) {
      this.buttonRemoveBlank.classList.remove('h5p-pick-the-symbols-disabled');
      this.buttonRemoveBlank.removeAttribute('disabled');
    }
    else {
      this.buttonRemoveBlank.classList.add('h5p-pick-the-symbols-disabled');
      this.buttonRemoveBlank.setAttribute('disabled', true);
    }
  }

  /**
   * Toggle blank buttons container visibility
   * @param {boolean} state State.
   */
  toggleBlankButtonsContainer(state) {
    state = (typeof state === 'boolean') ? state : !this.hasBlankButtonsContainer;

    if (state) {
      this.blankButtonsContainer.classList.remove('h5p-pick-the-symbols-none');
    }
    else {
      this.blankButtonsContainer.classList.add('h5p-pick-the-symbols-none');
    }
  }

  /**
   * Activate buttons that contain a symbol.
   * @param {string} symbol Symbol.
   */
  activateButton(symbol) {
    this.buttons.forEach((button) => {
      if (button.innerHTML === symbol) {
        button.focus();
      }
    });
  }

  /**
   * Resize blank buttons to fit container.
   * @param {number} containerWidth Container width to fit in.
   */
  resizeButtons(containerWidth) {
    this.buttonRemoveBlankWidths = this.buttonRemoveBlankWidths || this.computeButtonWidths(this.buttonRemoveBlank);
    this.buttonAddBlankWidths = this.buttonAddBlankWidths || this.computeButtonWidths(this.buttonAddBlank);

    if (this.buttonRemoveBlankWidths.max + this.buttonAddBlankWidths.max < containerWidth) {
      this.untruncate(this.buttonRemoveBlank);
      this.untruncate(this.buttonAddBlank);
    }
    else {
      this.truncate(this.buttonRemoveBlank);
      this.truncate(this.buttonAddBlank);
    }
  }

  /**
   * Truncate a button.
   * @param {HTMLButtonElement} button Button HTMLElement.
   */
  truncate(button) {
    button.classList.add('truncated');
    button.innerHTML = '';
  }

  /**
   * Untruncate a button.
   * @param {HTMLButtonElement} button Button HTMLElement.
   */
  untruncate(button) {
    button.classList.remove('truncated');
    button.innerHTML = button.getAttribute('title'); // Duplicate for a11y
  }

  /**
   * Compute min and max width of a blank button.
   * @param {HTMLButtonElement} button Button HTMLElement.
   * @returns {object} MinWidth and MaxWidth.
   */
  computeButtonWidths(button) {
    const widths = { min: 0, max: 0 };
    const wasTruncated = button.classList.contains('truncated');

    button.classList.add('truncated');
    widths.min = this.getComputedWidth(button);

    button.classList.remove('truncated');
    widths.max = this.getComputedWidth(button);

    if (wasTruncated) {
      button.classList.add('truncated');
    }

    return widths;
  }

  /**
   * Get computed width of an element.
   * @param {HTMLElement} element Element.
   * @returns {number} Width.
   */
  getComputedWidth(element) {
    const style = window.getComputedStyle(element);
    const border = parseFloat(style.getPropertyValue('border-left')) + parseFloat(style.getPropertyValue('border-right'));
    const margin = parseFloat(style.getPropertyValue('margin-left')) + parseFloat(style.getPropertyValue('margin-right'));
    const width = parseFloat(style.getPropertyValue('width'));

    return width + margin + border;
  }
}
