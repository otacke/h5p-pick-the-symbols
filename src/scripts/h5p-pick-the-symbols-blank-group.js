import PickTheSymbolsBlank from './h5p-pick-the-symbols-blank';

/** Class representing a group of blanks */
export default class PickTheSymbolsBlankGroup {
  /**
   * @constructor
   *
   * @param {object} params Parameters.
   */
  constructor(params) {
    this.params = params;

    this.params.callbacks = this.params.callbacks || {};
    this.params.callbacks.onOpenOverlay = this.params.callbacks.onOpenOverlay || (() => {});

    this.blanks = [];

    this.content = document.createElement('div');
    this.content.classList.add('h5p-pick-the-symbols-blank-group');
  }

  /**
   * Return the DOM for this class.
   * @return {HTMLElement} DOM for this class.
   */
  getDOM() {
    return this.content;
  }

  /**
   * Add blank to the end of the group.
   * @param {object} params Parameters.
   * @param {string[]} [params.answer=[]] Preset answers.
   * @param {boolean} [params.provideDefaultSpace=false] If true and solution is 'space', preset it.
   * @param {number} [params.amount=1] Number of blanks to add.
   */
  addBlank(params = {}) {
    params.amount = Math.max(1, params.amount || 1);

    // Sanitize answer
    if (params.answer) {
      params.answer = (typeof params.answer === 'string' || params.answer === null) ? [params.answer] : params.answer;
    }

    for (let i = 0; i < params.amount; i++) {
      const solution = this.params.solution.slice(this.blanks.length, this.blanks.length + 1);

      let answer = (params.answer) ? params.answer.slice(this.blanks.length, this.blanks.length + 1) : null;

      if (answer && answer.length > 0) {
        answer = (answer[0] !== null) ? answer[0].slice(0, 1) : null;
      }

      // Given answer takes precedence over provideDefaultSpace option
      if (params.provideDefaultSpace && (typeof answer === 'undefined') && solution === ' ') {
        answer = ' ';
      }

      const blank = new PickTheSymbolsBlank({
        callbacks: {
          onClick: (blank) => {
            this.handleOpenOverlay(blank);
          }
        },
        color: this.params.colorBackground,
        answer: answer,
        solution: solution,
      });

      this.blanks.push(blank);
      this.content.appendChild(blank.getDOM());
    }
  }

  /**
   * Remove last blank from the group.
   */
  removeBlank() {
    if (this.blanks.length < 2) {
      return;
    }

    this.content.removeChild(this.getBlank(Infinity).getDOM());
    this.blanks.splice(-1);
  }

  /**
   * Get blank.
   * @param {number} [index=Infinity] Index of blank.
   * @return {PickTheSymbolsBlank} Blank.
   */
  getBlank(index = Infinity) {
    index = Math.min(Math.max(0, index), this.blanks.length - 1);
    return this.blanks[index];
  }

  /**
   * Handle opening overlay by blank.
   * @param {PickTheSymbolsBlank} Blank.
   */
  handleOpenOverlay(blank) {
    this.params.callbacks.onOpenOverlay(this, blank);
  }

  /**
   * Get maximum score for group.
   * @return {number} Maximum score for group.
   */
  getMaxScore() {
    return this.params.solution.replace(/ /g, '').length;
  }

  /**
   * Get score for group.
   * @return {number} Score for group.
   */
  getScore() {
    return this.blanks.reduce((score, blank) => score + blank.getScore(), 0);
  }

  /**
   * Get correct responses pattern for reporting.
   * @return {string} Correct responses pattern.
   */
  getXAPICorrectResponsesPattern() {
    return this.blanks
      .map(blank => {
        if (blank.getScore() === 0) {
          return null;
        }
        else if (blank.getSolution() === '') {
          return '';
        }
        else {
          return blank.getSolution();
        }
      })
      .filter(blank => blank !== null)
      .join('[,]');
  }

  /**
   * Get response for reporting.
   * @return {string} Response.
   */
  getXAPIResponse() {
    return this.blanks
      .map(blank => (blank.getScore() !== 0) ? blank.getAnswer() : null)
      .filter(blank => blank !== null)
      .join('[,]');
  }

  /**
   * Get gaps for reporting.
   * @return {string} Gaps.
   */
  getXAPIGap() {
    return this.blanks.reduce((gaps, blank) => {
      return `${gaps}${(blank.getScore() !== 0) ? this.params.xAPIPlaceholder : '&nbsp;'}`;
    }, '');
  }

  /**
   * Mark visual state of blanks.
   * @param {object} [params={}] Parameters.
   * @param {boolean} [params.highlight] If true, mark state, else reset.
   * @param {boolean} [params.answer] If true, show answer, else hide.
   */
  showSolutions(params = {}) {

    // Show all relevant blanks and only those
    if (params.answer) {
      while (this.blanks.length < this.params.solution.length) {
        this.addBlank();
      }

      if (this.blanks.length > 0 && this.params.solution.length > 0) {
        while (this.blanks.length > this.params.solution.length) {
          if (this.getBlank(Infinity).getAnswer() !== null) {
            break; // Useless blank has been filled
          }
          this.removeBlank();
        }
      }
    }

    this.blanks.forEach(blank => {
      blank.showSolution(params);
    });
  }

  /**
   * Reset blanks.
   * @param {boolean} [keepBlanks] If not true, will remove blanks.
   */
  reset(params = {}) {
    if (params.keepBlanks !== true) {
      // Remove all obsolete blanks
      while (this.blanks.length > 1) {
        this.removeBlank();
      }
    }

    this.blanks.forEach(blank => {
      blank.reset(params);
    });
  }

  /**
   * Answer call to return the current state.
   * @return {object} Current state.
   */
  getCurrentState() {
    return this.blanks.map(blank => blank.getCurrentState());
  }
}
