import Overlay from './h5p-pick-the-symbols-overlay';
import PickTheSymbolsBlankGroup from './h5p-pick-the-symbols-blank-group';
import PickTheSymbolsChooser from './h5p-pick-the-symbols-chooser';
import Util from './h5p-pick-the-symbols-util';

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

    this.params.callbacks = this.params.callbacks || {};
    this.params.callbacks.onContentInteraction = this.params.callbacks.onContentInteraction || (() => {});
    this.params.callbacks.onResize = this.params.callbacks.onResize || (() => {});

    // Space can't be a symbol
    params.symbols = params.symbols.replace(/ /g, '');

    this.blankGroups = [];
    this.nextBlankId = 0;
    this.answerGiven = false;
    this.overlayIsOpen = false;

    // DOM nodes need to be created first
    const textDeconstructed = PickTheSymbolsContent.deconstructText(params.text, params.symbols);

    const textTemplate = textDeconstructed.sentence;
    let textBlankGroups = textDeconstructed.blanks;

    // No need to add blanks for single characters
    textBlankGroups = textBlankGroups.map(group => group.trim());

    // Check if there are "complicated" blanks
    this.onlySimpleBlanks = textBlankGroups.every(group => group.length < 2);

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
        addBlank: this.params.l10n.addBlank,
        addSymbol: this.params.l10n.addSymbol,
        space: this.params.l10n.space,
        removeBlank: this.params.l10n.removeBlank
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

    this.overlay = new Overlay(
      {
        content: this.chooser.getDOM(),
        l10n: {
          closeWindow: this.params.l10n.closeWindow
        },
        position: {
          horizontal: 'left',
          noOverflowX: true,
          offsetVertical: 4
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
    topWindow.addEventListener('click', event => {
      this.handleCloseOverlayExternal(event);
    });
    window.addEventListener('click', event => {
      this.handleCloseOverlayExternal(event);
    });

    // Need for buttons to add/remove blanks
    if (!this.onlySimpleBlanks && !this.params.showAllBlanks) {
      this.chooser.toggleBlankButtonsContainer(true);
    }

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

      if (this.params.showAllBlanks) {
        blankGroup.addBlank({
          amount: textBlankGroups[index].length
        });
      }
      else {
        // Add initial blank to blank group
        blankGroup.addBlank();
      }

      placeholder.parentNode.replaceChild(blankGroup.getDOM(), placeholder);
    });
  }

  /**
   * Return the DOM for this class.
   * @return {HTMLElement} DOM for this class.
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

    this.chooser.activateButton(blank.getAnswer());

    if (!this.onlySimpleBlanks && !this.params.showAllBlanks) {
      const isFirstBlank = this.currentBlankGroup.getBlank(0) === this.currentBlank;
      const isLastBlank = this.currentBlankGroup.getBlank(Infinity) === this.currentBlank;
      this.chooser.toggleAddButtonRemoveBlank(isLastBlank && !isFirstBlank);
      this.chooser.toggleAddButtonAddBlank(isLastBlank);
    }

    this.overlay.show();
    this.overlayIsOpen = true;

    this.resize();
  }

  /**
   * Handle closing the overlay.
   */
  handleCloseOverlay() {
    this.overlayIsOpen = false;
    this.overlay.hide();

    this.resize();
  }

  /**
   * Handle closing the overlay from outside click.
   */
  handleCloseOverlayExternal() {
    if (!this.overlayIsOpen) {
      return;
    }

    const closeOverlayTriggers = event.path
      .filter(segment => segment.classList !== undefined)
      .filter(segment => segment.classList.contains('h5p-pick-the-symbols-overlay-outer-wrapper') ||
          segment.classList.contains('h5p-pick-the-symbols-blank-group'));

    if (closeOverlayTriggers.length === 0) {
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
    this.handleCloseOverlay();
  }

  /**
   * Remove blank as requested by user.
   */
  handleChooserRemoveBlank() {
    if (this.currentBlankGroup.getBlank() === this.currentBlank) {
      this.currentBlankGroup.removeBlank();
    }
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
      this.params.callbacks.onResize();
    }
  }

  /**
   * Mark visual state of blanks.
   * @param {object} [params={}] Parameters.
   * @param {boolean} [params.highlight] If true, mark state, else reset.
   * @param {boolean} [params.answer] If true, show answer, else hide.
   */
  showSolutions(params = {}) {
    this.blankGroups.forEach(blankGroup => {
      blankGroup.showSolutions(params);
    });
  }

  /**
   * Reset blanks.
   * @param {object} [params] Params.
   */
  reset(params = {}) {
    params.keepBlanks = this.params.showAllBlanks;

    this.blankGroups.forEach(blankGroup => {
      blankGroup.reset(params);
    });
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

    this.enabled = state;
  }

  /**
   * Detect whether an answer has been given.
   * @return {boolean} True, if answer was given.
   */
  getAnswerGiven() {
    return this.answerGiven;
  }

  /**
   * Get maximum score possible.
   * @return {number} Maximum score possible.
   */
  getMaxScore() {
    return this.blankGroups.reduce((score, blankGroup) => score + blankGroup.getMaxScore(), 0);
  }

  /**
   * Get current score.
   * @return {number} Current score.
   */
  getScore() {
    const score = this.blankGroups.reduce((score, blankGroup) => score + blankGroup.getScore(), 0);
    return Math.max(0, score);
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
