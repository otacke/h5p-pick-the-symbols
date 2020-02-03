/** Class representing the content */
export default class PickTheSymbolsBlank {
  /**
   * @constructor
   *
   * @param {object} params Parameters.
   * @param {string} params.color CSS color for background.
   * @param {string} params.solution Solution characters.
   * @param {boolean} params.isFirst If true, is first, undeletable blank.
   * @param {object} params.callbacks Callbacks.
   * @param {function} params.callbacks.openOverlay Open overlay.
   */
  constructor(params) {
    this.params = params;
    this.answer = params.answer || null;
    this.callbacks = params.callbacks;
    this.solution = params.solution;

    this.content = document.createElement('span');
    this.content.classList.add('h5p-pick-the-symbols-blank-container');

    this.blank = document.createElement('span');
    this.blank.classList.add('h5p-pick-the-symbols-blank');

    this.blank.setAttribute('tabindex', 0);
    this.blank.style.backgroundColor = params.color;
    this.content.append(this.blank);

    this.answerInput = document.createElement('span');
    this.answerInput.classList.add('h5p-pick-the-symbols-blank-answer');
    this.answerInput.innerHTML = (!this.answer || this.answer === ' ') ? '&nbsp;' : this.answer;
    this.blank.appendChild(this.answerInput);

    this.correctAnswer = document.createElement('span');
    this.correctAnswer.classList.add('h5p-pick-the-symbols-blank-correct-answer');
    this.correctAnswer.innerHTML = this.solution;
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
   * @return {HTMLElement} DOM for this class.
   */
  getDOM() {
    return this.content;
  }

  /**
   * Return the DOM for the blank.
   * @return {HTMLElement} DOM for this blank.
   */
  getBlankDOM() {
    return this.blank;
  }

  /**
   * Get solution for this blank.
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
      this.answer = symbol;
      this.answerInput.innerHTML = symbol;
    }
  }

  /**
   * Get answer for this blank.
   * @return {null|string} symbol Answer given.
   */
  getAnswer() {
    return this.answer;
  }

  /**
   * Get score for this answer.
   * @return {number} Score for this answer.
   */
  getScore() {
    // No score if no answer given
    if (this.answer === null) {
      return 0;
    }

    // For original blank, accept explicit "space" as neutral
    if (this.answer === ' ') {
      return (this.solution.trim() === '') ? 0 : -1;
    }

    return (this.solution === this.answer) ? 1 : -1;
  }

  /**
   * Show solution.
   * @param {object} [params={}] Parameters.
   * @param {boolean} [params.highlight] If true, mark state, else reset.
   * @param {boolean} [params.answer] If true, show answer, else hide.
   * @param {boolean} [params.score] If true, show score, else remove.
   */
  showSolution(params = {}) {
    this.showHighlight(params.highlight);

    if (this.getScore() === -1 || this.getScore() === 0 && this.solution.trim() !== '') {
      this.showCorrectSolution(params.answer);
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
      selectorsExplainers.forEach(selector => {
        const nodes = this.blank.querySelectorAll(selector);
        if (nodes) {
          nodes.forEach(node => {
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
   * Reset blank.
   * @param {object} Params.
   * @param {boolean} [keepAnswers] If not true, will remove answers given.
   * @param {boolean} [keepSolutions] If not true, will remove solutions.
   * @param {boolean} [keepExplanations] If not true, will remove explanations.
   * @param {boolean} [keepHighlights] If not true, will remove highlights.
   */
  reset(params = {}) {
    if (params.keepAnswers !== true) {
      this.answer = this.params.answer || null;
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
}
