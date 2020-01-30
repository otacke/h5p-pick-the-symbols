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
    this.params = params;

    // Space can't be a symbol
    params.symbols = params.symbols.replace(/ /g, '');
    params.text = params.text
      .replace(/ &nbsp;/g, ' ')  // CKeditor creates &nbsp; for multiple blanks
      .replace(/[ ]{2,}/g, ' '); // Only keep one blank between words

    this.blanks = [];
    this.nextBlankId = 0;
    this.answerGiven = false;

    // DOM nodes need to be created first
    const textTemplate = PickTheSymbolsContent.createTextTemplate(params.text, params.symbols);

    this.textTemplate = textTemplate.sentence;
    const textBlanks = textTemplate.blanks;

    this.enabled = true;

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

    // Text container
    this.textContainer = document.createElement('div');
    this.textContainer.classList.add('h5p-pick-the-symbols-text-container');
    this.content.appendChild(this.textContainer);

    // Textfield
    this.textfield = document.createElement('div');
    this.textfield.innerHTML = this.textTemplate;
    this.textfield.classList.add('h5p-pick-the-symbols-text');
    this.textContainer.appendChild(this.textfield);

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
        solution: textBlanks[index]
      });

      this.blanks.push(blank);
      this.nextBlankId++;

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
      if (!this.enabled) {
        return;
      }

      this.currentBlankId = id;
      this.chooser.activateButton(this.blanks[id].getAnswer());
      this.overlay.moveTo(this.blanks[id].getBlankDOM());
      this.overlay.show();
    };

    this.handleCloseOverlay = () => {
      this.overlay.hide();
    };

    this.handleClickChooser = (symbol) => {
      const currentBlank = this.blanks[this.currentBlankId];
      currentBlank.setAnswer(symbol);

      const blank = new PickTheSymbolsBlank({
        id: this.nextBlankId,
        callbacks: {
          openOverlay: (id) => {
            this.handleOpenOverlay(id);
          },
          closeOverlay: () => {
            this.handleCloseOverlay();
          }
        },
        color: this.params.colorBackground,
        options: this.params.symbols,
        solution: currentBlank.getTail()
      });

      this.blanks.push(blank);
      this.nextBlankId++;

      // TODO: Polyfill for ChildNode.after()
      currentBlank.getDOM().after(blank.getDOM());

      this.handleCloseOverlay();
      this.answerGiven = true;
    };

    /**
     * Mark visual state of blanks.
     * @param {object} [params={}] Parameters.
     * @param {boolean} [params.highlight] If true, mark state, else reset.
     * @param {boolean} [params.answer] If true, show answer, else hide.
     */
    this.showSolutions = (params = {}) => {
      this.blanks.forEach(blank => {
        blank.showSolution(params);
      });
    };

    /**
     * Reset blanks.
     */
    this.reset = () => {
      this.toggleEnabled(true);

      this.blanks.forEach(blank => {
        blank.reset();
      });
    };

    /**
     * Toggle enabled state.
     * @param {boolean} [state] If true, will be enabled, else false.
     */
    this.toggleEnabled = (state) => {
      state = (state === undefined) ? !this.enabled : state;

      if (state) {
        this.textContainer.classList.remove('h5p-pick-the-symbols-disabled');
      }
      else {
        this.textContainer.classList.add('h5p-pick-the-symbols-disabled');
      }

      this.enabled = state;
    };

    /**
     * Detect whether an answer has been given.
     * @return {boolean} True, if answer was given.
     */
    this.getAnswerGiven = () => this.answerGiven;

    /**
     * Get maximum score possible.
     * @return {number} Maximum score possible.
     */
    this.getMaxScore = () => this.blanks.filter(blank => blank.getSolution() !== ' ').length;

    /**
     * Get current score.
     * @return {number} Current score.
     */
    this.getScore = () => {
      const score = this.blanks.reduce((score, blank) => score + blank.getScore(), 0);

      return Math.max(0, score);
    };
  }

  /**
   * Initialize blanks and text.
   * @param {string} text Characters of text.
   * @param {string[]} symbols Symbols to replace.
   * @return {object} Blanks and HTML text to display.
   */
  static createTextTemplate(text, symbols) {
    if (!text || !symbols) {
      return;
    }
    symbols = [...symbols];

    text = text
      .replace(/ &nbsp;/g, ' ')      // CKeditor creates &nbsp; for multiple blanks
      .replace(/[ ]{2,}/g, ' ')      // Only keep one blank between words
      .replace(/&nbsp;/g, '\u200C'); // We could end up with <p></p> later that wouldn't have height

    const placeholder = `<span class="h5p-pick-the-symbols-placeholder"></span>`;
    const chars = [...text];

    let htmlMode = false;
    let currentBlank = '';
    let output = '';
    const blanks = [];

    for (let i = 0; i < chars.length; i++) {

      // Skip HTML tags, so they won't be touched by replacement procedure
      if (!htmlMode && chars[i] === '<') {
        htmlMode = true;
        output = output + chars[i];
        continue;
      }
      else if (htmlMode && chars[i] === '>') {
        htmlMode = false;
        output = output + chars[i];
        continue;
      }
      else if (htmlMode) {
        output = output + chars[i];
        continue;
      }

      if (currentBlank !== '' && chars[i] !== ' ' && symbols.indexOf(chars[i]) === -1) {
        blanks.push(currentBlank);
        output = `${output}${placeholder}${chars[i]}`;
        currentBlank = '';
        continue;
      }

      if (chars[i] === ' ' || symbols.indexOf(chars[i]) !== -1) {
        currentBlank += chars[i];
        continue;
      }

      output = output + chars[i];
    }

    return {sentence: output, blanks: blanks};
  }
}
