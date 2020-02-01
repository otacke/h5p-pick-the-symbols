import Util from './h5p-pick-the-symbols-util';

/** Class representing the content */
export default class PickTheSymbolsChooser {
  /**
   * @constructor
   *
   * @param {object} params Parameters.
   */
  constructor(params) {
    this.params = Util.extend({
      callbacks: {
        click: () => {}
      }
    }, params);

    this.buttons = [];

    this.hasButtonAddBlank = false;
    this.hasButtonRemoveBlank = false;

    // Build content
    this.content = document.createElement('div');
    this.content.classList.add('h5p-pick-the-symbols-chooser');

    params.symbols.forEach(symbol => {
      const button = document.createElement('button');
      button.classList.add('h5p-joubelui-button');
      button.innerHTML = symbol;
      button.setAttribute('title', this.params.l10n.addSymbol.replace(/@symbol/g, symbol.replace('&nbsp;', this.params.l10n.space)));
      button.addEventListener('click', () => {
        this.params.callbacks.onPickSymbol(button.innerHTML);
      });

      this.buttons.push(button);
      this.content.appendChild(button);
    });

    this.buttonRemoveBlank = document.createElement('button');
    this.buttonRemoveBlank.classList.add('h5p-joubelui-button');
    this.buttonRemoveBlank.classList.add('h5p-pick-the-symbols-none');
    this.buttonRemoveBlank.innerHTML = '-';
    this.buttonRemoveBlank.setAttribute('title', this.params.l10n.removeBlank);
    this.buttonRemoveBlank.addEventListener('click', () => {
      this.params.callbacks.onRemoveBlank();
    });
    this.content.appendChild(this.buttonRemoveBlank);

    this.buttonAddBlank = document.createElement('button');
    this.buttonAddBlank.classList.add('h5p-joubelui-button');
    this.buttonAddBlank.classList.add('h5p-pick-the-symbols-none');
    this.buttonAddBlank.innerHTML = '+';
    this.buttonAddBlank.setAttribute('title', this.params.l10n.addBlank);
    this.buttonAddBlank.addEventListener('click', () => {
      this.params.callbacks.onAddBlank();
    });
    this.content.appendChild(this.buttonAddBlank);
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
      this.buttonAddBlank.classList.remove('h5p-pick-the-symbols-none');
    }
    else {
      this.buttonAddBlank.classList.add('h5p-pick-the-symbols-none');
    }
  }

  /**
   * Toggle visibility of button for removing blank.
   */
  toggleAddButtonRemoveBlank(state) {
    state = (typeof state === 'boolean') ? state : !this.hasButtonRemoveBlank;

    if (state) {
      this.buttonRemoveBlank.classList.remove('h5p-pick-the-symbols-none');
    }
    else {
      this.buttonRemoveBlank.classList.add('h5p-pick-the-symbols-none');
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
