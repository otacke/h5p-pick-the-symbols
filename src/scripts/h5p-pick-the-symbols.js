// Import required classes
import PickTheSymbolsBlank from './h5p-pick-the-symbols-blank';
import PickTheSymbolsContent from './h5p-pick-the-symbols-content';
import Util from './h5p-pick-the-symbols-util';

/**
 * Class holding a full PickTheSymbols.
 *
 * TODO: xAPI ('multiple choice')
 * TODO: a11y
 */
export default class PickTheSymbols extends H5P.Question {
  /**
   * @constructor
   *
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content's id.
   * @param {object} [extras] Saved state, metadata, etc.
   */
  constructor(params, contentId, extras = {}) {
    super('pick-the-symbols'); // CSS class selector for content's iframe: h5p-pick-the-symbols

    this.params = params;
    this.contentId = contentId;
    this.extras = extras;

    /*
     * this.params.behaviour.enableSolutionsButton and this.params.behaviour.enableRetry
     * are used by H5P's question type contract.
     * @see {@link https://h5p.org/documentation/developers/contracts#guides-header-8}
     * @see {@link https://h5p.org/documentation/developers/contracts#guides-header-9}
     */

    // Make sure all variables are set
    this.params = Util.extend({
      taskDescription: '',
      text: '',
      symbols: `.?!,:;'"`,
      behaviour: {
        enableSolutionsButton: true,
        enableRetry: true,
        colorBackground: '#e0e0e0',
        infiniteChecking: true,
        showAllBlanks: false
      },
      l10n: {
        checkAnswer: 'Check answer',
        continue: 'Continue',
        showSolution: 'Show solution',
        tryAgain: 'Retry',
        addBlank: 'Add blank',
        addSymbol: 'Fill blank with @symbol',
        space: 'space',
        removeBlank: 'Remove blank'
      },
    }, this.params);

    // this.previousState now holds the saved content state of the previous session
    this.previousState = this.extras.previousState || {};

    /**
     * Register the DOM elements with H5P.Question
     */
    this.registerDomElements = () => {
      this.content = new PickTheSymbolsContent({
        taskDescription: this.params.taskDescription,
        text: this.params.text,
        symbols: Util.htmlDecode(this.params.symbols),
        colorBackground: this.params.behaviour.colorBackground,
        showAllBlanks: this.params.behaviour.showAllBlanks,
        narrowScreenLimitWidth: PickTheSymbols.NARROW_SCREEN_WIDTH_LIMIT,
        callbacks: {
          onContentInteraction: () => {
            this.handleContentInteraction();
          },
          onResize: () => {
            this.resize({
              bubblingUp: true
            });
          }
        },
        l10n: {
          addBlank: this.params.l10n.addBlank,
          addSymbol: this.params.l10n.addSymbol,
          space: this.params.l10n.space,
          removeBlank: this.params.l10n.removeBlank
        }
      });

      // Register content with H5P.Question
      this.setContent(this.content.getDOM());

      // Register Buttons
      this.addButtons();

      /*
       * H5P.Question also offers some more functions that could be used.
       * Consult https://github.com/h5p/h5p-question for details
       */
    };

    /**
     * Add all the buttons that shall be passed to H5P.Question.
     */
    this.addButtons = () => {
      // Check answer button
      this.addButton('check-answer', this.params.l10n.checkAnswer, () => {
        this.content.toggleEnabled(false);

        if (this.params.behaviour.infiniteChecking) {
          this.hideButton('check-answer');
          this.showButton('continue');
        }

        this.content.handleCloseOverlay();

        // Highlight answers depending on settings
        this.content.showSolutions({
          highlight: PickTheSymbolsBlank.HIGHLIGHT_CORRECT,
          score: true
        });

        const textScore = H5P.Question.determineOverallFeedback(
          this.params.overallFeedback, this.getScore() / this.getMaxScore());

        this.setFeedback(
          textScore,
          this.getScore(),
          this.getMaxScore()
        );

        if (!this.params.behaviour.infiniteChecking) {
          this.content.toggleEnabled(false);
        }

        if (this.params.behaviour.enableSolutionsButton) {
          this.showButton('show-solution');
        }

        if (this.params.behaviour.enableRetry) {
          this.showButton('try-again');
        }
      }, true, {}, {});

      // Continue button
      this.addButton('continue', this.params.l10n.continue, () => {
        this.content.toggleEnabled(true);
        this.content.reset({
          keepAnswers: true
        });

        this.showButton('check-answer');
        this.hideButton('continue');
        this.hideButton('show-solution');
        this.hideButton('try-again');
      }, false, {}, {});

      // Show solution button
      this.addButton('show-solution', this.params.l10n.showSolution, () => {
        this.showSolutions();
      }, false, {}, {});

      // Retry button
      this.addButton('try-again', this.params.l10n.tryAgain, () => {
        if (!this.params.behaviour.infiniteChecking) {
          this.showButton('check-answer');
        }

        this.hideButton('show-solution');
        this.hideButton('try-again');

        this.resetTask();

        if (!this.params.behaviour.infiniteChecking) {
          this.content.toggleEnabled(true);
        }

        this.trigger('resize');
      }, false, {}, {});
    };

    this.on('resize', () => {
      this.resize();
    });

    /**
     * Resize.
     * @param {object} params Parameters.
     * @param {boolean} [params.bubblingUp] If true, won't bubble down.
     */
    this.resize = (params = {}) => {
      if (params.bubblingUp) {
        this.trigger('resize');
      }
      else {
        this.content.resize({bubblingDown: true});
      }
    };

    /**
     * Check if result has been submitted or input has been given.
     *
     * @return {boolean} True, if answer was given.
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-1}
     */
    this.getAnswerGiven = () => this.content.getAnswerGiven();

    /**
     * Get latest score.
     *
     * @return {number} latest score.
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-2}
     */
    this.getScore = () => this.content.getScore();

    /**
     * Get maximum possible score.
     *
     * @return {number} Score necessary for mastering.
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-3}
     */
    this.getMaxScore = () => this.content.getMaxScore();

    /**
     * Show solutions.
     *
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-4}
     */
    this.showSolutions = () => {
      this.content.showSolutions({
        highlight: PickTheSymbolsBlank.HIGHLIGHT_ALL,
        answer: true,
        score: false
      });
      this.trigger('resize');
    };

    /**
     * Reset task.
     *
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-5}
     */
    this.resetTask = () => {
      this.removeFeedback();
      this.content.reset();
    };

    /**
     * Get xAPI data.
     *
     * @return {object} XAPI statement.
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
     */
    this.getXAPIData = () => ({
      statement: this.getXAPIAnswerEvent().data.statement
    });

    /**
     * Build xAPI answer event.
     *
     * @return {H5P.XAPIEvent} XAPI answer event.
     */
    this.getXAPIAnswerEvent = () => {
      const xAPIEvent = this.createXAPIEvent('answered');

      xAPIEvent.setScoredResult(this.getScore(), this.getMaxScore(), this,
        true, this.isPassed());

      /*
       * TODO: Add other properties here as required, e.g. xAPIEvent.data.statement.result.response
       * https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md#245-result
       */

      return xAPIEvent;
    };

    /**
     * Create an xAPI event for Dictation.
     *
     * @param {string} verb Short id of the verb we want to trigger.
     * @return {H5P.XAPIEvent} Event template.
     */
    this.createXAPIEvent = (verb) => {
      const xAPIEvent = this.createXAPIEventTemplate(verb);
      Util.extend(
        xAPIEvent.getVerifiedStatementValue(['object', 'definition']),
        this.getxAPIDefinition());
      return xAPIEvent;
    };

    /**
     * Get the xAPI definition for the xAPI object.
     *
     * @return {object} XAPI definition.
     */
    this.getxAPIDefinition = () => {
      const definition = {};
      definition.name = {'en-US': this.getTitle()};
      definition.description = {'en-US': this.getDescription()};
      definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
      definition.interactionType = 'choice';

      /*
       * TODO: Add other object properties as required, e.g. definition.correctResponsesPattern
       * cmp. https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md#244-object
       */

      return definition;
    };

    /**
     * Determine whether the task has been passed by the user.
     *
     * @return {boolean} True if user passed or task is not scored.
     */
    this.isPassed = () => this.getScore() === this.getMaxScore();

    /**
     * Get tasks title.
     *
     * @return {string} Title.
     */
    this.getTitle = () => {
      let raw;
      if (this.extras.metadata) {
        raw = this.extras.metadata.title;
      }
      raw = raw || PickTheSymbols.DEFAULT_DESCRIPTION;

      // H5P Core function: createTitle
      return H5P.createTitle(raw);
    };

    /**
     * Get tasks description.
     *
     * @return {string} Description.
     */
    // TODO: Have a field for a task description in the editor if you need one.
    this.getDescription = () => this.params.taskDescription || PickTheSymbols.DEFAULT_DESCRIPTION;

    /**
     * Answer call to return the current state.
     *
     * @return {object} Current state.
     */
    this.getCurrentState = () => {
      /*
       * TODO: Return any data object that will indicate the state that should
       * be loaded on start, here it's a random number
       */
      return {
        random: Math.random(100)
      };
    };
  }
}

/** @constant {string} */
PickTheSymbols.DEFAULT_DESCRIPTION = 'Pick the Symbols';

/** @constant {number} */
PickTheSymbols.NARROW_SCREEN_WIDTH_LIMIT = 768;
