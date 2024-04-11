import Overlay from './h5p-pick-the-symbols-overlay.js';
import PickTheSymbolsBlank from './h5p-pick-the-symbols-blank.js';
import PickTheSymbolsBlankGroup from './h5p-pick-the-symbols-blank-group.js';
import PickTheSymbolsChooser from './h5p-pick-the-symbols-chooser.js';
import Util from './h5p-pick-the-symbols-util.js';

/** Class representing the content */
export default class PickTheSymbolsContent {
  /**
   * @class
   * @param {object} params Parameters.
   * @param {string} params.taskDescription Task description text.
   * @param {string} params.text Text to parse.
   * @param {string} params.symbols Symbols to replace and pick from.
   * @param {string} params.colorBackground Background color of blanks.
   * @param {object} [callbacks] Callbacks.
   */
  constructor(params, callbacks = {}) {
    this.params = params;

    this.callbacks = Util.extend({
      onInteracted: () => {},
      onResize: () => {}
    }, callbacks);

    this.verboseSymbolMapping = {
      '&nbsp;': this.params.a11y.space,
      '.': this.params.a11y.period,
      '!': this.params.a11y.exclamationPoint,
      '?': this.params.a11y.questionMark,
      ',': this.params.a11y.comma,
      '\'': this.params.a11y.singleQuote,
      '"': this.params.a11y.doubleQuote,
      ':': this.params.a11y.colon,
      ';': this.params.a11y.semicolon,
      '+': this.params.a11y.plus,
      '-': this.params.a11y.minus,
      '*': this.params.a11y.asterisk,
      '/': this.params.a11y.forwardSlash,
      '\\': this.params.a11y.backwardSlash,
      '~': this.params.a11y.tilde,
      '¡': this.params.a11y.invertedExclamationPoint,
      '¿': this.params.a11y.invertedQuestionMark,
      '#': this.params.a11y.poundSign,
      '(': this.params.a11y.leftParanthesis,
      ')': this.params.a11y.rightParanthesis,
      '^': this.params.a11y.caret,
      '_': this.params.a11y.underscore,
      '|': this.params.a11y.verticalBar,
      '‘': this.params.a11y.leftSingleQuotationMark,
      '‚': this.params.a11y.leftSingleLowQuotationMark,
      '’': this.params.a11y.rightSingleQuotationMark,
      '”': this.params.a11y.leftDoubleQuotationMark,
      '„': this.params.a11y.leftDoubleLowQuotationMark,
      '“': this.params.a11y.rightDoubleQuotationMark,
      '‹': this.params.a11y.leftSingleAngleBracket,
      '›': this.params.a11y.rightSingleAngleBracket,
      '«': this.params.a11y.leftDoubleAngleBracket,
      '»': this.params.a11y.rightDoubleAngleBracket,
      '{': this.params.a11y.leftBrace,
      '}': this.params.a11y.rightBrace,
      '[': this.params.a11y.leftBracket,
      ']': this.params.a11y.rightBracket,
      '§': this.params.a11y.section,
      '÷': this.params.a11y.dividedBy,
      '×': this.params.a11y.multipliedBy,
      '<': this.params.a11y.lessThan,
      '>': this.params.a11y.greaterThan
    };

    this.blankGroups = [];
    this.nextBlankId = 0;

    this.answerGiven = (this.params.previousState && this.params.previousState.filter((state) => {
      return state.length > 1 || (state.length === 1 && state[0] !== null);
    }).length > 0);
    this.overlayIsOpen = false;

    // DOM nodes need to be created first
    const textDeconstructed = PickTheSymbolsContent.deconstructText(params.text, params.symbols);

    this.textBlankGroups = textDeconstructed.blanks;
    this.placeholderTemplate = textDeconstructed.placeholder;

    // No need to add blanks for single characters
    this.textBlankGroups = this.textBlankGroups.map((group) => group.trim());

    // Check if there are "complicated" blanks
    this.onlySimpleBlanks = this.textBlankGroups.every((group) => group.length < 2);

    this.enabled = true;

    // DOM
    this.content = document.createElement('div');
    this.content.classList.add('h5p-pick-the-symbols-content');

    // Task description
    const taskDescription = document.createElement('div');
    taskDescription.classList.add('h5p-pick-the-symbols-task-description');
    taskDescription.innerHTML = params.taskDescription;
    this.content.appendChild(taskDescription);

    // Text container
    this.textContainer = document.createElement('div');
    this.textContainer.classList.add('h5p-pick-the-symbols-text-container');
    this.content.appendChild(this.textContainer);

    // Textfield
    this.textfield = document.createElement('div');
    this.textfield.innerHTML = textDeconstructed.sentence;
    this.textfield.classList.add('h5p-pick-the-symbols-text');
    this.textContainer.appendChild(this.textfield);

    // Overlay
    const symbols = ['&nbsp;'].concat(this.params.symbols.split(''));
    this.chooser = new PickTheSymbolsChooser(
      {
        symbols: symbols,
        l10n: {
          title: this.params.l10n.chooserTitle,
          addBlank: this.params.l10n.addBlank,
          addSymbol: this.params.l10n.addSymbol,
          removeBlank: this.params.l10n.removeBlank
        },
        a11y: this.params.a11y
      },
      {
        onPickSymbol: (symbol) => {
          this.handleChooserPickSymbol(symbol);
        },
        onAddBlank: () => {
          this.handleChooserAddBlank();
        },
        onRemoveBlank: () => {
          this.handleChooserRemoveBlank();
        },
        onGetVerboseSymbol: (symbol) => {
          return this.getVerboseSymbol(symbol);
        }
      }
    );

    this.overlay = new Overlay(
      {
        content: this.chooser.getDOM(),
        l10n: {
          title: this.params.l10n.chooserTitle,
          closeWindow: this.params.l10n.closeWindow
        },
        position: {
          horizontal: 'left',
          noOverflowX: true,
          offsetVertical: 5
        }
      },
      {
        onClose: () => {
          this.handleCloseOverlay();
        }
      }
    );
    this.content.appendChild(this.overlay.getDOM());

    // Close overlay on outside click (iframe window and 1st level parent)
    const topWindow = Util.getTopWindow(window, 1);
    topWindow.addEventListener('click', (event) => {
      this.handleCloseOverlayExternal(event);
    });
    window.addEventListener('click', (event) => {
      this.handleCloseOverlayExternal(event);
    });
    window.addEventListener('keydown', (event) => {
      this.handleCloseOverlayExternal(event);
    });

    // Need for buttons to add/remove blanks
    if (!this.onlySimpleBlanks && !this.params.showAllBlanks) {
      this.chooser.toggleBlankButtonsContainer(true);
    }

    // Polyfill for IE11
    if (typeof NodeList !== 'undefined' && NodeList.prototype && !NodeList.prototype.forEach) {
      NodeList.prototype.forEach = Array.prototype.forEach;
    }

    // Replace placeholders with blank group objects
    const placeholders = this.content.querySelectorAll('.h5p-pick-the-symbols-placeholder');
    placeholders.forEach((placeholder, index) => {

      // New Blank Group
      const blankGroup = new PickTheSymbolsBlankGroup(
        {
          colorBackground: params.colorBackground,
          slimBlanks: params.slimBlanks,
          solution: this.textBlankGroups[index],
          xAPIPlaceholder: this.params.xAPIPlaceholder,
          l10n: {
            title: this.params.l10n.blankButtonTitle
          }
        },
        {
          onOpenOverlay: (blankGroup, blank) => {
            this.handleOpenOverlay(blankGroup, blank);
          }
        }
      );
      this.blankGroups.push(blankGroup);

      if (this.params.showAllBlanks || params.previousState) {
        const config = {};
        if (params.previousState && params.previousState.length > index) {
          config.answer = params.previousState[index];
        }
        config.amount = (config.answer) ? params.previousState[index].length : this.textBlankGroups[index].length;
        blankGroup.addBlank(config);
      }
      else {
        // Add initial blank to blank group
        blankGroup.addBlank();
      }

      placeholder.parentNode.replaceChild(blankGroup.getDOM(), placeholder);
    });

    this.relabelBlanks();
  }

  /**
   * Return the DOM for this class.
   * @returns {HTMLElement} DOM for this class.
   */
  getDOM() {
    return this.content;
  }

  /**
   * Handle closing the overlay.
   * @param {PickTheSymbolsBlankGroup} blankGroup Calling blank group.
   * @param {PickTheSymbolsBlank} blank Calling blank.
   */
  handleOpenOverlay(blankGroup, blank) {
    if (!this.enabled) {
      return;
    }

    this.currentBlankGroup = blankGroup || this.currentBlankGroup;
    this.currentBlank = blank || this.currentBlank;

    if (!this.onlySimpleBlanks && !this.params.showAllBlanks) {
      const isFirstBlank = this.currentBlankGroup.getBlank(0) === this.currentBlank;
      const isLastBlank = this.currentBlankGroup.getBlank(Infinity) === this.currentBlank;
      this.chooser.toggleAddButtonRemoveBlank(isLastBlank && !isFirstBlank);
      this.chooser.toggleAddButtonAddBlank(isLastBlank);
    }

    this.overlay.show();
    this.overlayIsOpen = true;

    this.chooser.activateButton(blank.getAnswer());

    this.resize();
  }

  /**
   * Handle closing the overlay.
   * @param {object} [params] Parameters.
   * @param {boolean} [params.keepFocus] If true, don't set focus to current blank.
   */
  handleCloseOverlay(params = {}) {
    this.overlayIsOpen = false;
    this.overlay.hide();

    if (params.keepFocus !== true) {
      this.currentBlank.focus();
    }

    this.relabelBlanks();

    this.resize();
  }

  /**
   * Handle closing the overlay from outside click.
   * @param {Event} event Event.
   */
  handleCloseOverlayExternal(event) {
    if (!this.overlayIsOpen) {
      return;
    }

    // Close overlay on escape key
    if (event.type === 'keydown') {
      if (event.key === 'Escape') {
        this.handleCloseOverlay();
      }
      return;
    }

    let close = true;

    let target = event.target;
    while (target.parentNode) {
      if (
        target.classList.contains('h5p-pick-the-symbols-overlay-outer-wrapper') ||
        target.classList.contains('h5p-pick-the-symbols-blank-group')
      ) {
        close = false;
        break;
      }
      target = target.parentNode;
    }

    if (close) {
      this.handleCloseOverlay();
    }
  }

  /**
   * Handle click on chooser option.
   * @param {string} symbol Symbol that was clicked.
   */
  handleChooserPickSymbol(symbol) {
    this.currentBlank.setAnswer(symbol);

    this.handleCloseOverlay();
    this.answerGiven = true;

    this.callbacks.onInteracted();
  }

  /**
   * Add new Blank as requested by user.
   */
  handleChooserAddBlank() {
    if (this.currentBlankGroup.getBlank() === this.currentBlank) {
      this.currentBlankGroup.addBlank({
        provideDefaultSpace: true
      });
    }

    this.currentBlank = this.currentBlankGroup.getBlank();

    this.handleCloseOverlay();
  }

  /**
   * Remove blank as requested by user.
   */
  handleChooserRemoveBlank() {
    if (this.currentBlankGroup.getBlank() === this.currentBlank) {
      this.currentBlankGroup.removeBlank();
    }

    this.currentBlank = this.currentBlankGroup.getBlank();

    this.handleCloseOverlay();
  }

  /**
   * Resize content.
   * @param {object} params Parameters.
   * @param {boolean} [params.bubblingDown] If true, won't bubble up.
   */
  resize(params = {}) {
    if (this.overlayIsOpen) {
      // Resize chooser content to fit buttons
      const pos = this.overlay.moveTo(this.currentBlank.getBlankDOM());
      this.chooser.resize({
        maxWidth: this.content.offsetWidth - parseFloat(pos.left)
      });

      // Resize for overlay adjustments
      const computedStyle = window.getComputedStyle(this.overlay.getDOM());
      const overlayTop = parseFloat(computedStyle.getPropertyValue('top'));
      const overlayHeight = parseFloat(computedStyle.getPropertyValue('height'));

      if (this.content.offsetHeight < overlayTop + overlayHeight) {
        this.content.style.height = `${overlayTop + overlayHeight}px`;
      }
    }
    else {
      this.content.style.removeProperty('height');
    }

    if (!params.bubblingDown) {
      this.callbacks.onResize();
    }
  }

  /**
   * Mark visual state of blanks.
   * @param {object} [params] Parameters.
   * @param {boolean} [params.highlight] If true, mark state, else reset.
   * @param {boolean} [params.answer] If true, show answer, else hide.
   */
  showSolutions(params = {}) {
    if (params && params.score === false) {
      this.solutionShowing = true;
    }

    this.blankGroups.forEach((blankGroup) => {
      blankGroup.showSolutions(params);
    });
  }

  relabelBlanks(params = {}) {
    const total = this.blankGroups.reduce((result, current) => result + current.getLength(), 0);
    let counter = 1;

    this.blankGroups.forEach((group) => {
      group.blanks.forEach((blank) => {
        const position = `${counter} ${this.params.a11y.of} ${total}.`;

        const score = blank.getScore();

        // correct answer
        let correctAnswer = '';
        if (params.correctAnswer === true && score !== 1) {
          const solution = (blank.getSolution() || '&nbsp;').replace(' ', '&nbsp;');
          correctAnswer = ` ${this.params.a11y.correctAnswer}: ${this.getVerboseSymbol(solution)}.`;
        }

        // add result
        let result = '';
        if (params.result === true) {
          if (score === -1) {
            result = ` ${this.params.a11y.answeredIncorrectly}`;
          }
          else if (score === 1) {
            result = ` ${this.params.a11y.answeredCorrectly}`;
          }
          else {
            result = ` ${this.params.a11y.notAnswered}`;
          }
        }

        // append . for readspeaker pause
        if (result !== '' && result.slice(-1) !== '.') {
          result = `${result}.`;
        }

        // button label
        const label = ` ${this.getVerboseSymbol(blank.getAnswer())}`;

        blank.setAriaLabel(`${this.params.a11y.inputBlank} ${position}${correctAnswer}${result}${label}`);

        counter++;
      });
    });

  }

  /**
   * Determine if a solution is displayed.
   * @returns {boolean} True if solution is displayed.
   */
  isSolutionShowing() {
    return this.solutionShowing || false;
  }

  /**
   * Reset blanks.
   * @param {object} [params] Params.
   */
  reset(params = {}) {
    params.keepAllBlanks = params.keepAllBlanks || this.params.showAllBlanks;

    this.blankGroups.forEach((blankGroup) => {
      blankGroup.reset(params);
    });

    this.relabelBlanks();

    this.solutionShowing = false;

    setTimeout(() => {
      if (this.blankGroups && this.blankGroups.length > 0) {
        this.blankGroups[0].focus();
      }
    }, 0);
  }

  /**
   * Toggle enabled state.
   * @param {boolean} [state] If true, will be enabled, else false.
   */
  toggleEnabled(state) {
    state = (state === undefined) ? !this.enabled : state;

    if (state) {
      this.textContainer.classList.remove('h5p-pick-the-symbols-disabled');
    }
    else {
      this.textContainer.classList.add('h5p-pick-the-symbols-disabled');
    }

    this.blankGroups.forEach((group) => {
      group.setEnabled(state);
    });

    this.enabled = state;
  }

  /**
   * Get correct responses pattern for reporting.
   * @returns {string} Correct responses pattern.
   */
  getXAPICorrectResponsesPatterns() {
    return [this.blankGroups
      .map((group) => group.getXAPICorrectResponsesPattern())
      .filter((group) => group !== '')
      .join('[,]')];
  }

  /**
   * Get response for reporting.
   * @returns {string} Response.
   */
  getXAPIResponses() {
    return this.blankGroups
      .map((group) => group.getXAPIResponse())
      .filter((group) => group !== '')
      .join('[,]');
  }

  /**
   * Get gaps for reporting.
   * @returns {string} Gaps.
   */
  getXAPIGaps() {
    const placeholderText = PickTheSymbolsContent.getPlaceholderText();

    return this.blankGroups.reduce((text, group) => {
      return text.replace(placeholderText, group.getXAPIGap());
    }, this.placeholderTemplate);
  }

  /**
   * Detect whether an answer has been given.
   * @returns {boolean} True, if answer was given.
   */
  getAnswerGiven() {
    return this.answerGiven;
  }

  /**
   * Get maximum score possible.
   * @returns {number} Maximum score possible.
   */
  getMaxScore() {
    return this.blankGroups.reduce((score, blankGroup) => score + blankGroup.getMaxScore(), 0);
  }

  /**
   * Get current score.
   * @returns {number} Current score.
   */
  getScore() {
    const score = this.blankGroups.reduce((score, blankGroup) => score + blankGroup.getScore(), 0);
    return Math.max(0, score);
  }

  /**
   * Answer call to return the current state.
   * @returns {object} Current state.
   */
  getCurrentState() {
    return this.blankGroups.map((group) => group.getCurrentState());
  }

  /**
   * Get readable character description.
   * @param {string} symbol Symbol to make readable.
   * @returns {string} Readable character.
   */
  getVerboseSymbol(symbol) {
    symbol = symbol || '&nbsp;';
    return this.verboseSymbolMapping[symbol] || symbol;
  }

  /**
   * Initialize blanks and text.
   * Will parse the text and break it down into chunks for words and blanks
   * This might need a little refactoring love, it grew over time as new
   * requirements popped in.
   * @param {string} text Characters of text.
   * @param {string[]} symbols Symbols to replace.
   * @returns {object|undefined} Blanks and HTML text to display.
   */
  static deconstructText(text, symbols) {
    if (!text || !symbols) {
      return;
    }
    symbols = symbols.split('');

    /*
     * output will contain the text with placeholders
     * blanks will be array containing groups of spaces/symbols as strings
     */
    let output = '';
    const blanks = [];

    // Sanitize input for HTML elements
    const tmp = document.createElement('div');
    tmp.innerHTML = text;
    const paragraphs = Array.prototype.slice
      .call(tmp.querySelectorAll('p'))
      .map((p) => Util.stripHTML(p.innerText));

    paragraphs.forEach((text) => {
      if (text === '') {
        return;
      }

      const blocks = [];
      let blank;
      let block;

      /*
       * Parse paragraph.
       * Each paragraph contains word groups that should be wrapped together
       * later.
       */
      const chars = text.split('');
      for (let i = 0; i < chars.length; i++) {
        blank = blank || '';
        block = block || '';

        const currentChar = chars[i];
        if (currentChar !== ' ' && symbols.indexOf(currentChar) === -1) {
          // Regular character to simply be displayed
          if (blank !== '') {
            // Previous group had blank symbols, can be pushed
            blanks.push(blank);
            blocks.push(`${PickTheSymbolsContent.getWordGroupMarkerStart()}${block}${PickTheSymbolsContent.getPlaceholderText()}${PickTheSymbolsContent.getWordGroupMarkerEnd()}`);
            blank = '';
            block = '';
          }
          block = `${block}${currentChar}`;
        }
        else {
          blank = `${blank}${currentChar}`;
        }
      }

      // Finish remaining group
      if (block !== '' || blank !== '') {
        let placeholder = '';
        if (blank !== '') {
          placeholder = PickTheSymbolsContent.getPlaceholderText();
          blanks.push(blank);
        }
        blocks.push(`${PickTheSymbolsContent.getWordGroupMarkerStart()}${block}${placeholder}${PickTheSymbolsContent.getWordGroupMarkerEnd()}`);
      }

      output = `${output}<p>${blocks.join('')}</p>`;
    });

    let placeholder = output;

    // TODO: This could go away ...

    // Replace markers with actual span, can't use those before as </span> might be in input
    while (output.indexOf(PickTheSymbolsContent.getWordGroupMarkerStart()) !== -1) {
      output = output.replace(PickTheSymbolsContent.getWordGroupMarkerStart(), '<span class="h5p-pick-the-symbols-word-group">');
      placeholder = placeholder.replace(PickTheSymbolsContent.getWordGroupMarkerStart(), '');
    }

    while (output.indexOf(PickTheSymbolsContent.getWordGroupMarkerEnd()) !== -1) {
      output = output.replace(PickTheSymbolsContent.getWordGroupMarkerEnd(), '</span>');
      placeholder = placeholder.replace(PickTheSymbolsContent.getWordGroupMarkerEnd(), '');
    }

    return { sentence: output, blanks: blanks, placeholder: placeholder };
  }

  /**
   * Get placeholder text.
   * @returns {string} Placeholder text.
   */
  static getPlaceholderText() {
    return '<span class="h5p-pick-the-symbols-placeholder"></span>';
  }

  /**
   * Get text for word group start marker.
   * @returns {string} Word group start marker text.
   */
  static getWordGroupMarkerStart() {
    return '[[[wordgroupstart]]]';
  }

  /**
   * Get text for word group start marker.
   * @returns {string} Word group start marker text.
   */
  static getWordGroupMarkerEnd() {
    return '[[[wordgroupend]]]';
  }
}
