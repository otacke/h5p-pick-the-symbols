/** Class representing the content */
export default class PickTheSymbolsBlank {
  /**
   * @constructor
   *
   * @param {object} params Parameters.
   * @param {string} params.color CSS color for background.
   * @param {string[]} params.options Option characters.
   * @param {string} params.solution Solution character.
   * @param {object} params.callbacks Callbacks.
   * @param {function} params.callbacks.openOverlay Open overlay.
   * @param {function} params.callbacks.closeOverlay Close overlay.
   */
  constructor(params) {
    this.params = params;
    this.id = params.id;
    this.answer = params.answer || null;
    this.callbacks = params.callbacks;
    this.solution = params.solution;

    this.content = document.createElement('span');
    this.content.classList.add('h5p-pick-the-symbol-blank');
    this.content.setAttribute('tabindex', 0);
    this.content.innerHTML = this.answer || '&nbsp;';
    this.content.style.backgroundColor = params.color;

    this.content.addEventListener('click', () => {
      this.callbacks.openOverlay(this.id);
    });

    /**
     * Return the DOM for this class.
     *
     * @return {HTMLElement} DOM for this class.
     */
    this.getDOM = () => {
      return this.content;
    };

    /**
     * Get solution for this blank.
     */
    this.getSolution = () => {
      return this.solution;
    };

    /**
     * Set answer for this blank.
     * @param {string} symbol Answer given.
     */
    this.setAnswer = (symbol) => {
      if (!symbol || symbol === '&nbsp;') {
        this.answer = null;
        this.content.innerHTML = '&nbsp;';
      }
      else {
        this.answer = symbol;
        this.content.innerHTML = symbol;
      }
    };

    /**
     * Get answer for this blank.
     * @return {null|string} symbol Answer given.
     */
    this.getAnswer = () => this.answer;

    /**
     * Check if blank contains correct answer.
     * @return {boolean} True, if answer is correct.
     */
    this.isCorrect = () => (this.solution === ' ') ?
      this.answer === null :
      this.answer === this.solution;

    /**
     * Set visual state for blank.
     * @param {boolean} show If true, mark state, else reset.
     */
    this.setVisualState = (state) => {
      if (this.solution === ' ') {
        return;
      }

      if (!state) {
        this.content.style.backgroundColor = this.params.color;
        this.content.classList.remove('h5p-pick-the-symbols-blank-state-correct');
        this.content.classList.remove('h5p-pick-the-symbols-blank-state-wrong');
      }
      else {
        this.content.style.backgroundColor = '';

        const isCorrect = this.isCorrect();
        if (isCorrect) {
          this.content.classList.add('h5p-pick-the-symbols-blank-state-correct');
        }
        else  {
          this.content.classList.add('h5p-pick-the-symbols-blank-state-wrong');
        }
      }
    };

    /** @constant {number} */
    PickTheSymbolsBlank.STATE_CORRECT = 1;

    /** @constant {number} */
    PickTheSymbolsBlank.STATE_WRONG = 0;
  }
}
