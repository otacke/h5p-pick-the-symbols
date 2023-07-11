import Util from './h5p-pick-the-symbols-util';

/** Class representing the content */
export default class PickTheSymbolsBlank {
  /**
   * @class
   * @param {object} params Parameters.
   * @param {string} params.color CSS color for background.
   * @param {string} params.solution Solution characters.
   * @param {boolean} params.isFirst If true, is first, undeletable blank.
   * @param {object} params.callbacks Callbacks.
   * @param {function} params.callbacks.openOverlay Open overlay.
   * @param {object} [callbacks] Callbacks.
   */
  constructor(params, callbacks = {}) {
    this.params = params;
    this.answer = params.answer || null;

    this.callbacks = Util.extend({
      onClick: () => {}
    }, callbacks);

    this.solution = params.solution;

    this.content = document.createElement('span');
    this.content.classList.add('h5p-pick-the-symbols-blank-container');

    const symbol = (!this.answer || this.answer === ' ') ? '&nbsp;' : this.answer;

    this.blank = document.createElement('button');
    this.blank.classList.add('h5p-pick-the-symbols-blank');
    this.blank.setAttribute('tabindex', 0);
    this.blank.setAttribute('title', this.params.l10n.title);
    this.blank.style.backgroundColor = this.params.color;
    if (this.params.slimBlanks) {
      this.blank.classList.add('h5p-pick-the-symbol-blank-no-border');
    }
    this.content.appendChild(this.blank);

    this.answerInput = document.createElement('span');
    this.answerInput.classList.add('h5p-pick-the-symbols-blank-answer');
    this.answerInput.innerHTML = symbol;
    this.blank.appendChild(this.answerInput);

    this.correctAnswer = document.createElement('span');
    this.correctAnswer.classList.add('h5p-pick-the-symbols-blank-correct-answer');
    this.correctAnswer.setAttribute('aria-hidden', 'true');
    this.correctAnswer.innerHTML = '';
    this.content.appendChild(this.correctAnswer);

    this.blank.addEventListener('click', () => {
      this.callbacks.onClick(this);
    });

    /** @constant {number} */
    PickTheSymbolsBlank.HIGHLIGHT_NONE = 0;

    /** @constant {number} */
    PickTheSymbolsBlank.HIGHLIGHT_CORRECT = 1;

    /** @constant {number} */
    PickTheSymbolsBlank.HIGHLIGHT_WRONG = 2;

    /** @constant {number} */
    PickTheSymbolsBlank.HIGHLIGHT_ALL = 3;
  }

  /**
   * Return the DOM for this class.
   * @returns {HTMLElement} DOM for this class.
   */
  getDOM() {
    return this.content;
  }

  /**
   * Return the DOM for the blank.
   * @returns {HTMLElement} DOM for this blank.
   */
  getBlankDOM() {
    return this.blank;
  }

  /**
   * Set focus to blank.
   */
  focus() {
    this.blank.focus();
  }

  /**
   * Get solution for this blank.
   * @returns {string} Solution.
   */
  getSolution() {
    return this.solution;
  }

  /**
   * Set answer for this blank.
   * @param {string} symbol Answer given.
   */
  setAnswer(symbol) {
    if (!symbol) {
      this.answer = null;
      this.answerInput.innerHTML = '&nbsp;';
    }
    else if (symbol === '&nbsp;' || symbol === ' ') {
      this.answer = ' ';
      this.answerInput.innerHTML = '&nbsp;';
    }
    else {
      symbol = Util.htmlDecode(symbol);
      this.answer = symbol;
      this.answerInput.innerHTML = symbol;
    }
  }

  /**
   * Get answer for this blank.
   * @returns {null|string} symbol Answer given.
   */
  getAnswer() {
    return this.answer;
  }

  /**
   * Get score for this answer.
   * @returns {number} Score for this answer.
   */
  getScore() {
    // No score if no answer given or explicit space which is neutral
    if (this.answer === null || this.answer === ' ') {
      return 0;
    }

    return (this.solution === this.answer) ? 1 : -1;
  }

  /**
   * Set aria-label.
   * @param {string} label Aria-label.
   */
  setAriaLabel(label) {
    this.blank.setAttribute('aria-label', label);
  }

  /**
   * Toggle enabled state.
   * @param {boolean} state If true, will be enabled, else disabled.
   */
  setEnabled(state) {
    if (state) {
      this.blank.removeAttribute('disabled');
    }
    else {
      this.blank.setAttribute('disabled', 'disabled');
    }
  }

  /**
   * Show solution.
   * @param {object} [params] Parameters.
   * @param {boolean} [params.highlight] If true, mark state, else reset.
   * @param {boolean} [params.answer] If true, show answer, else hide.
   * @param {boolean} [params.score] If true, show score, else remove.
   */
  showSolution(params = {}) {
    this.showHighlight(params.highlight);

    if (this.getScore() === -1 || this.getScore() === 0 && this.solution.trim() !== '') {
      this.showCorrectSolution(params.answer);
    }

    // Hide all empty blanks
    if (params.answer && this.getScore() === 0) {
      this.hide();
    }

    this.showScoreExplanation(params.score);
  }

  /**
   * Show score explanations.
   * @param {boolean} [show] If true, show score, else remove.
   */
  showScoreExplanation(show) {
    if (show) {
      if (this.scoreExplanation) {
        return; // Already showing
      }

      const score = this.getScore();

      if (score !== 0) {
        const scorePoints = new H5P.Question.ScorePoints();
        this.scoreExplanation = scorePoints.getElement(score === 1);
        if (this.scoreExplanation) {
          this.blank.appendChild(this.scoreExplanation);
        }
      }
    }
    else {
      // Remove Score Explanations
      const selectorsExplainers = ['.h5p-question-plus-one', '.h5p-question-minus-one'];
      selectorsExplainers.forEach((selector) => {
        const nodes = this.blank.querySelectorAll(selector);
        if (nodes) {
          nodes.forEach((node) => {
            node.parentNode.removeChild(node);
          });
        }
      });

      this.scoreExplanation = null;
    }
  }

  /**
   * Set visual state for blank.
   * @param {number} option Indicator what to highlight.
   */
  showHighlight(option) {
    this.blank.style.backgroundColor = this.params.color;
    this.blank.classList.remove('h5p-pick-the-symbols-blank-state-correct');
    this.blank.classList.remove('h5p-pick-the-symbols-blank-state-wrong');
    this.blank.classList.remove('h5p-pick-the-symbols-empty-answer');

    if (!option) {
      return;
    }

    if (this.getScore() === 1) {
      this.blank.style.backgroundColor = '';
      this.blank.classList.add('h5p-pick-the-symbols-blank-state-correct');
    }

    if (this.getScore() === -1) {
      this.blank.style.backgroundColor = '';
      this.blank.classList.add('h5p-pick-the-symbols-blank-state-wrong');
      if (!this.answer) {
        this.blank.classList.add('h5p-pick-the-symbols-empty-answer');
      }
    }
  }

  /**
   * Show answer.
   * @param {boolean} show If true, show answer.
   */
  showCorrectSolution(show) {
    if (show) {
      this.correctAnswer.innerHTML = this.solution === '' ? '&nbsp;' : this.solution;
      this.correctAnswer.style.display = 'inherit';
    }
    else {
      this.correctAnswer.innerHTML = '';
      this.correctAnswer.style.display = 'none';
    }
  }

  /**
   * Hide blank input field in DOM, will have space character width.
   */
  hide() {
    this.blank.classList.add('h5p-pick-the-symbols-blank-solution');
    this.blank.style.backgroundColor = '';
  }

  /**
   * Show blank input field in DOM.
   */
  show() {
    this.blank.classList.remove('h5p-pick-the-symbols-blank-solution');
    this.blank.style.backgroundColor = this.params.color;
  }

  /**
   * Reset blank.
   * @param {object} [params] Parameters,
   * @param {boolean} [params.keepAnswers] If not true, will remove answers given.
   * @param {boolean} [params.keepSolutions] If not true, will remove solutions.
   * @param {boolean} [params.keepExplanations] If not true, will remove explanations.
   * @param {boolean} [params.keepHighlights] If not true, will remove highlights.
   */
  reset(params = {}) {
    this.show();

    if (params.keepAnswers !== true) {
      this.answer = null;
      this.answerInput.innerHTML = '&nbsp;';
    }

    if (params.keepSolutions !== true) {
      this.showCorrectSolution();
    }

    if (params.keepExplanations !== true) {
      this.showScoreExplanation();
    }

    if (params.keepHighlights !== true) {
      this.showHighlight();
    }
  }

  /**
   * Answer call to return the current state.
   * @returns {object} Current state.
   */
  getCurrentState() {
    return this.getAnswer();
  }
}
