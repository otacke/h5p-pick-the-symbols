import Overlay from './h5p-pick-the-symbols-overlay';
import PickTheSymbolsBlank from './h5p-pick-the-symbols-blank';
import PickTheSymbolsChooser from './h5p-pick-the-symbols-chooser';

/** Class representing the content */
export default class PickTheSymbolsContent {
  /**
   * @constructor
   *
   * @param {object} params Parameters.
   * @param {string} params.taskDescription Task description text.
   * @param {string} params.text Text to parse.
   * @param {string} params.symbols Symbols to replace and pick from.
   * @param {string} params.colorBackground Background color of blanks.
   */
  constructor(params) {
    // Space can't be a symbol
    params.symbols = params.symbols.replace(/ /g, '');
    params.text = params.text
      .replace(/ &nbsp;/g, ' ')  // CKeditor creates &nbsp; for multiple blanks
      .replace(/[ ]{2,}/g, ' '); // Only keep one blank between words

    this.blanks = [];

    // DOM nodes need to be created first
    this.textTemplate = PickTheSymbolsContent.createTextTemplate(
      [...params.text],
      [...params.symbols]
    );

    // DOM
    this.content = document.createElement('div');
    this.content.classList.add('h5p-pick-the-symbols-content');

    // Task description
    const taskDescription = document.createElement('div');
    taskDescription.classList.add('h5p-pick-the-symbols-task-description');
    taskDescription.innerHTML = params.taskDescription;
    this.content.appendChild(taskDescription);

    // Ruler
    const ruler = document.createElement('div');
    ruler.classList.add('h5p-pick-the-symbols-ruler');
    this.content.appendChild(ruler);

    // Textfield
    this.textfield = document.createElement('div');
    this.textfield.innerHTML = this.textTemplate;
    this.textfield.classList.add('h5p-pick-the-symbols-text');
    this.content.appendChild(this.textfield);

    // Overlay
    this.chooser = new PickTheSymbolsChooser({
      symbols: ['&nbsp;', ...params.symbols],
      callbacks: {
        click: (symbol) => {
          this.handleClickChooser(symbol);
        }
      }
    });

    this.overlay = new Overlay({
      content: this.chooser.getDOM(),
      position: {
        horizontal: 'left',
        noOverflowX: true
      }
    });
    this.content.appendChild(this.overlay.getDOM());

    // Replace placeholders with blanks objects
    const placeholders = this.content.querySelectorAll('.h5p-pick-the-symbols-placeholder');
    placeholders.forEach((placeholder, index) => {
      const blank = new PickTheSymbolsBlank({
        id: index,
        callbacks: {
          openOverlay: (id) => {
            this.handleOpenOverlay(id);
          },
          closeOverlay: () => {
            this.handleCloseOverlay();
          }
        },
        color: params.colorBackground,
        options: params.symbols,
        solution: placeholder.dataset.solution
      });

      this.blanks.push(blank);
      placeholder.parentNode.replaceChild(blank.getDOM(), placeholder);
    });

    /**
     * Return the DOM for this class.
     *
     * @return {HTMLElement} DOM for this class.
     */
    this.getDOM = () => {
      return this.content;
    };

    this.handleOpenOverlay = (id) => {
      this.currentBlank = id;
      this.chooser.activateButton(this.blanks[id].getAnswer());
      this.overlay.moveTo(this.blanks[id].getDOM());
      this.overlay.show();
    };

    this.handleCloseOverlay = () => {
      this.overlay.hide();
    };

    this.handleClickChooser = (symbol) => {
      this.blanks[this.currentBlank].setAnswer(symbol);
      this.overlay.hide();
    };
  }

  /**
   * Initialize blanks and text.
   * @param {string[]} chars Characters of text.
   * @param {string[]} symbols Symbols to replace.
   * @return {object} Blanks and HTML text to display.
   */
  static createTextTemplate(chars, symbols) {
    if (!chars || !symbols) {
      return;
    }

    // We only want one placeholder between words
    chars = chars.reduce( (prev, curr) => {
      if (curr === ' ' && symbols.indexOf(prev.slice(-1)) !== -1) {
        return `${prev}\u200C`;
      }
      else if (symbols.indexOf(curr) !== -1 && prev.slice(-1) === ' ') {
        return `${prev.slice(0, -1)}\u200C${curr}`;
      }
      else {
        return `${prev}${curr}`;
      }
    }, '');

    // We could end up with <p></p> later that wouldn't have height
    chars = chars.replace(/&nbsp;/g, '\u200C');
    chars = [...chars];

    let htmlMode = false;

    for (let i = 0; i < chars.length; i++) {

      // Skip HTML tags, so they won't be touched by replacement procedure
      if (!htmlMode && chars[i] === '<') {
        htmlMode = true;
        continue;
      }
      else if (htmlMode && chars[i] === '>') {
        htmlMode = false;
        continue;
      }
      else if (htmlMode) {
        continue;
      }

      // Skip regular characters
      if (chars[i] !== ' ' && symbols.indexOf(chars[i]) === -1) {
        continue;
      }

      // Add placeholder
      chars[i] = `<span class="h5p-pick-the-symbols-placeholder" data-solution="${chars[i]}"></span>`;
    }

    return chars.join('');
  }
}
