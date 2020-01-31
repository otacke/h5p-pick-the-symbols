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
    this.id = params.id;
    this.answer = params.answer || null;
    this.callbacks = params.callbacks;
    this.solution = params.solution.slice(0, 1);
    this.tail = params.solution.slice(1);
    this.isFirst = params.isFirst;

    this.content = document.createElement('span');
    this.content.classList.add('h5p-pick-the-symbols-blank-container');

    this.blank = document.createElement('span');
    this.blank.classList.add('h5p-pick-the-symbols-blank');
    if (!this.isFirst) {
      this.blank.classList.add('h5p-pick-the-symbols-blank-tail');
    }

    this.blank.setAttribute('tabindex', 0);
    this.blank.style.backgroundColor = params.color;
    this.content.append(this.blank);

    this.answerInput = document.createElement('span');
    this.answerInput.classList.add('h5p-pick-the-symbols-blank-answer');
    this.answerInput.innerHTML = this.answer || '&nbsp;';
    this.blank.appendChild(this.answerInput);

    this.correctAnswer = document.createElement('span');
    this.correctAnswer.classList.add('h5p-pick-the-symbols-blank-correct-answer');
    this.correctAnswer.innerHTML = this.solution;
    this.content.appendChild(this.correctAnswer);

    this.blank.addEventListener('click', () => {
      this.callbacks.onOpenOverlay(this);
    });

    /**
     * Return the DOM for this class.
     * @return {HTMLElement} DOM for this class.
     */
    this.getDOM = () => {
      return this.content;
    };

    /**
     * Return the DOM for the blank.
     * @return {HTMLElement} DOM for this blank.
     */
    this.getBlankDOM = () => {
      return this.blank;
    };

    /**
     * Get blank id.
     * @return {number} Blank's id.
     */
    this.getId = () => {
      return this.id;
    };

    /**
     * Get solution for this blank.
     */
    this.getSolution = () => {
      return this.solution;
    };

    /**
     * Get solution for this blank.
     */
    this.getTail = () => {
      return this.tail;
    };

    /**
     * Set answer for this blank.
     * @param {string} symbol Answer given.
     */
    this.setAnswer = (symbol) => {
      if (!symbol || symbol === '&nbsp;') {
        this.answer = null;
        this.answerInput.innerHTML = '&nbsp;';
      }
      else {
        this.answer = symbol;
        this.answerInput.innerHTML = symbol;
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
    this.isCorrect = () => {
      return (this.solution === ' ') ?
        this.answer === null :
        this.answer === this.solution;
    };

    /**
     * Get score for this answer.
     * @return {number} Score for this answer.
     */
    this.getScore = () => {
      if (this.answer === null) {
        return 0;
      }

      return (this.solution === this.answer) ? 1 : -1;
    };

    /**
     * Show solution.
     * @param {object} [params={}] Parameters.
     * @param {boolean} [params.highlight] If true, mark state, else reset.
     * @param {boolean} [params.answer] If true, show answer, else hide.
     * @param {boolean} [params.score] If true, show score, else remove.
     */
    this.showSolution = (params = {}) => {
      if (this.solution === ' ' && !this.answer) {
        return;
      }

      this.showHighlight(params.highlight);
      if (!this.isCorrect()) {
        this.showAnswer(params.answer);
      }

      if (this.answer) {
        this.showScore(params.score);
      }
    };

    /**
     * Show score explanations.
     * @param {boolean} [show] If true, show score, else remove.
     */
    this.showScore = (show) => {
      if (show) {
        if (this.scoreExplanation) {
          return; // Already showing
        }

        const scorePoints = new H5P.Question.ScorePoints();
        this.scoreExplanation = scorePoints.getElement(this.isCorrect());
        if (this.scoreExplanation) {
          this.blank.appendChild(this.scoreExplanation);
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
    };

    /**
     * Set visual state for blank.
     * @param {number} option Indicator what to highlight.
     */
    this.showHighlight = (option) => {
      this.blank.style.backgroundColor = this.params.color;
      this.blank.classList.remove('h5p-pick-the-symbols-blank-state-correct');
      this.blank.classList.remove('h5p-pick-the-symbols-blank-state-wrong');
      this.blank.classList.remove('h5p-pick-the-symbols-empty-answer');

      if (!option) {
        return;
      }

      if (this.isCorrect()) {
        if (option === PickTheSymbolsBlank.HIGHLIGHT_ALL || option === PickTheSymbolsBlank.HIGHLIGHT_CORRECT) {
          this.blank.style.backgroundColor = '';
          this.blank.classList.add('h5p-pick-the-symbols-blank-state-correct');
        }
      }
      else {
        if (option === PickTheSymbolsBlank.HIGHLIGHT_ALL || option === PickTheSymbolsBlank.HIGHLIGHT_WRONG) {
          this.blank.style.backgroundColor = '';
          this.blank.classList.add('h5p-pick-the-symbols-blank-state-wrong');
          if (!this.answer) {
            this.blank.classList.add('h5p-pick-the-symbols-empty-answer');
          }
        }
      }
    };

    /**
     * Show answer.
     * @param {boolean} show If true, show answer.
     */
    this.showAnswer = (show) => {
      if (this.solution === ' ') {
        return;
      }

      if (show) {
        this.correctAnswer.innerHTML = this.solution;
        this.correctAnswer.style.display = 'inherit';
      }
    };

    /**
     * Reset blank.
     */
    this.reset = () => {
      this.answer = null;
      this.answerInput.innerHTML = '&nbsp;';

      this.correctAnswer.style.display = 'none';
      this.correctAnswer.innerHTML = '';

      this.showScore();
      this.showHighlight();
    };

    /** @constant {number} */
    PickTheSymbolsBlank.HIGHLIGHT_NONE = 0;

    /** @constant {number} */
    PickTheSymbolsBlank.HIGHLIGHT_CORRECT = 1;

    /** @constant {number} */
    PickTheSymbolsBlank.HIGHLIGHT_WRONG = 2;

    /** @constant {number} */
    PickTheSymbolsBlank.HIGHLIGHT_ALL = 3;

  }
}
