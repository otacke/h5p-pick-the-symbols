import Overlay from './h5p-pick-the-symbols-overlay';
import PickTheSymbolsBlankGroup from './h5p-pick-the-symbols-blank-group';
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

    this.blankGroups = [];
    this.nextBlankId = 0;
    this.answerGiven = false;

    // DOM nodes need to be created first
    const textDeconstructed = PickTheSymbolsContent.deconstructText(params.text, params.symbols);

    const textTemplate = textDeconstructed.sentence;
    const textBlankGroups = textDeconstructed.blanks;

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
    this.textfield.innerHTML = textTemplate;
    this.textfield.classList.add('h5p-pick-the-symbols-text');
    this.textContainer.appendChild(this.textfield);

    // Overlay
    this.chooser = new PickTheSymbolsChooser({
      symbols: ['&nbsp;', ...params.symbols],
      l10n: {
        addBlank: 'Add new blank',
        addSymbol: 'Fill blank with @symbol',
        blank: 'blank',
        removeBlank: 'Remove blank'
      },
      callbacks: {
        onPickSymbol: (symbol) => {
          this.handleChooserPickSymbol(symbol);
        },
        onAddBlank: () => {
          this.handleChooserAddBlank();
        },
        onRemoveBlank: () => {
          this.handleChooserRemoveBlank();
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

    // Replace placeholders with blank group objects
    const placeholders = this.content.querySelectorAll('.h5p-pick-the-symbols-placeholder');
    placeholders.forEach((placeholder, index) => {

      // New Blank Group
      const blankGroup = new PickTheSymbolsBlankGroup({
        callbacks: {
          onOpenOverlay: (blankGroup, blank) => {
            this.handleOpenOverlay(blankGroup, blank);
          }
        },
        colorBackground: params.colorBackground,
        solution: textBlankGroups[index]
      });
      this.blankGroups.push(blankGroup);

      // Add initial blank to blank group
      blankGroup.addBlank({id: this.nextBlankId});
      this.nextBlankId++;

      placeholder.parentNode.replaceChild(blankGroup.getDOM(), placeholder);
    });

    /**
     * Return the DOM for this class.
     *
     * @return {HTMLElement} DOM for this class.
     */
    this.getDOM = () => {
      return this.content;
    };

    this.handleOpenOverlay = (blankGroup, blank) => {
      if (!this.enabled) {
        return;
      }

      this.currentBlankGroup = blankGroup;
      this.currentBlank = blank;

      this.chooser.activateButton(blank.getAnswer());
      this.overlay.moveTo(blank.getBlankDOM());
      this.overlay.show();
    };

    this.handleCloseOverlay = () => {
      this.overlay.hide();
    };

    /**
     * Handle click on chooser option.
     * @param {string} symbol Symbol that was clicked.
     */
    this.handleChooserPickSymbol = (symbol) => {
      this.currentBlank.setAnswer(symbol);

      this.handleCloseOverlay();
      this.answerGiven = true;
    };

    /**
     * Handle click on chooser option.
     * @param {string} symbol Symbol that was clicked.
     */
    this.handleChooserAddBlank = () => {
      if (this.currentBlankGroup.getBlank() === this.currentBlank) {
        this.currentBlankGroup.addBlank({id: this.nextBlankId});
        this.nextBlankId++;
      }
    };

    /**
     * Handle click on chooser option.
     * @param {string} symbol Symbol that was clicked.
     */
    this.handleChooserRemoveBlank = () => {
      if (this.currentBlankGroup.getBlank() === this.currentBlank) {
        this.currentBlankGroup.removeBlank();
      }
    };

    /**
     * Mark visual state of blanks.
     * @param {object} [params={}] Parameters.
     * @param {boolean} [params.highlight] If true, mark state, else reset.
     * @param {boolean} [params.answer] If true, show answer, else hide.
     */
    this.showSolutions = (params = {}) => {
      this.blankGroups.forEach(blankGroup => {
        blankGroup.showSolutions(params);
      });
    };

    /**
     * Reset blanks.
     */
    this.reset = () => {
      this.toggleEnabled(true);

      this.blankGroups.forEach(blankGroup => {
        blankGroup.reset();
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
    this.getMaxScore = () => this.blankGroups.reduce((score, blankGroup) => score + blankGroup.getMaxScore(), 0);

    /**
     * Get current score.
     * @return {number} Current score.
     */
    this.getScore = () => {
      const score = this.blankGroups.reduce((score, blankGroup) => score + blankGroup.getScore(), 0);
      return Math.max(0, score);
    };
  }

  /**
   * Initialize blanks and text.
   * @param {string} text Characters of text.
   * @param {string[]} symbols Symbols to replace.
   * @return {object} Blanks and HTML text to display.
   */
  static deconstructText(text, symbols) {
    if (!text || !symbols) {
      return;
    }
    symbols = [...symbols];

    text = text
      .replace(/&nbsp;/g, ' ')                 // CKeditor creates &nbsp;s
      .replace(/[ ]{2,}/g, ' ')                // Only keep one blank between words
      .replace(/<p> <\/p>/g, '<p>\u200C</p>'); // Prevent blanks in empty paragraphs

    const placeholder = `<span class="h5p-pick-the-symbols-placeholder"></span>`;
    const chars = [...text];

    let htmlMode = false;
    let currentBlank = '';
    let output = '';
    const blanks = [];

    for (let i = 0; i < chars.length; i++) {

      // Skip HTML tags, so they won't be touched by replacement procedure
      if (currentBlank === '' && !htmlMode && chars[i] === '<') {
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

        // Check if was last symbol
        if (i === chars.length - 1) {
          blanks.push(currentBlank);
          output = `${output}${placeholder}`;
        }
        continue;
      }

      output = output + chars[i];
    }

    return {sentence: output, blanks: blanks};
  }
}
