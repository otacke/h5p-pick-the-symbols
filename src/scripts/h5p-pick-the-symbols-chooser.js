/** Class representing the content */
export default class PickTheSymbolsChooser {
  /**
   * @constructor
   *
   * @param {object} params Parameters.
   */
  constructor(params = {}) {
    this.params = params;

    this.callbacks = this.params.callbacks || {};
    this.callbacks.onAddBlank = this.callbacks.onAddBlank || (() => {});
    this.callbacks.onPickSymbol = this.callbacks.onPickSymbol || (() => {});
    this.callbacks.onRemoveBlank = this.callbacks.onRemoveBlank || (() => {});
    this.callbacks.onResize = this.callbacks.onResize || (() => {});

    this.buttons = [];

    this.hasButtonAddBlank = false;
    this.hasButtonRemoveBlank = false;

    // Build content
    this.content = document.createElement('div');
    this.content.classList.add('h5p-pick-the-symbols-chooser');

    this.symbolButtonsContainer = document.createElement('div');
    this.symbolButtonsContainer.classList.add('h5p-pick-the-symbols-chooser-symbol-buttons');
    this.content.appendChild(this.symbolButtonsContainer);

    params.symbols.forEach(symbol => {
      const button = document.createElement('button');
      button.classList.add('h5p-joubelui-button');
      button.innerHTML = symbol;
      button.setAttribute('title', this.params.l10n.addSymbol.replace(/@symbol/g, symbol.replace('&nbsp;', this.params.l10n.space)));
      button.addEventListener('click', () => {
        this.callbacks.onPickSymbol(button.innerHTML);
      });

      this.buttons.push(button);
      this.symbolButtonsContainer.appendChild(button);
    });

    // TODO: Handle this via params, not via toggling

    this.ruler = document.createElement('div');
    this.ruler.classList.add('h5p-pick-the-symbols-ruler');
    this.ruler.classList.add('h5p-pick-the-symbols-none');
    this.content.appendChild(this.ruler);

    this.blankButtonsContainer = document.createElement('div');
    this.blankButtonsContainer.classList.add('h5p-pick-the-symbols-chooser-blank-buttons');
    this.blankButtonsContainer.classList.add('h5p-pick-the-symbols-none');
    this.content.appendChild(this.blankButtonsContainer);

    // Button for removing current blank
    this.buttonRemoveBlank = document.createElement('button');
    this.buttonRemoveBlank.classList.add('h5p-joubelui-button');
    this.buttonRemoveBlank.classList.add('h5p-pick-the-symbols-remove-blank');
    this.buttonRemoveBlank.classList.add('h5p-pick-the-symbols-disabled');
    this.buttonRemoveBlank.innerHTML = '-';
    this.buttonRemoveBlank.setAttribute('title', this.params.l10n.removeBlank);
    this.buttonRemoveBlank.addEventListener('click', () => {
      this.callbacks.onRemoveBlank();
    });
    this.blankButtonsContainer.appendChild(this.buttonRemoveBlank);

    // Button for adding current blank
    this.buttonAddBlank = document.createElement('button');
    this.buttonAddBlank.classList.add('h5p-joubelui-button');
    this.buttonAddBlank.classList.add('h5p-pick-the-symbols-add-blank');
    this.buttonAddBlank.classList.add('h5p-pick-the-symbols-disabled');
    this.buttonAddBlank.innerHTML = '+';
    this.buttonAddBlank.setAttribute('title', this.params.l10n.addBlank);
    this.buttonAddBlank.addEventListener('click', () => {
      this.callbacks.onAddBlank();
    });
    this.blankButtonsContainer.appendChild(this.buttonAddBlank);
  }

  /**
   * Return the DOM for this class.
   *
   * @return {HTMLElement} DOM for this class.
   */
  getDOM() {
    return this.content;
  }

  /**
   * Toggle visibility of button for removing blank.
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
   */
  toggleBlankButtonsContainer(state) {
    state = (typeof state === 'boolean') ? state : !this.hasBlankButtonsContainer;

    if (state) {
      this.ruler.classList.remove('h5p-pick-the-symbols-none');
      this.blankButtonsContainer.classList.remove('h5p-pick-the-symbols-none');
    }
    else {
      this.ruler.classList.add('h5p-pick-the-symbols-none');
      this.blankButtonsContainer.classList.add('h5p-pick-the-symbols-none');
    }
  }

  activateButton(symbol) {
    this.buttons.forEach(button => {
      if (button.innerHTML === symbol) {
        button.classList.add('active');
      }
      else {
        button.classList.remove('active');
      }
    });
  }
}
