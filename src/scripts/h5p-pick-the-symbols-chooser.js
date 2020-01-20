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

    // Build content
    this.content = document.createElement('div');
    this.content.classList.add('h5p-pick-the-symbol-chooser');

    params.symbols.forEach(symbol => {
      const button = document.createElement('button');
      button.classList.add('h5p-joubelui-button');
      button.innerHTML = symbol;
      button.addEventListener('click', () => {
        this.params.callbacks.click(button.innerHTML);
      });

      this.buttons.push(button);
      this.content.appendChild(button);
    });

    /**
     * Return the DOM for this class.
     *
     * @return {HTMLElement} DOM for this class.
     */
    this.getDOM = () => {
      return this.content;
    };

    this.activateButton = (symbol) => {
      this.buttons.forEach(button => {
        if (button.innerHTML === symbol) {
          button.classList.add('active');
        }
        else {
          button.classList.remove('active');
        }
      });
    };
  }
}
