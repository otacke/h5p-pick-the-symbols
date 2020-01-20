/** Class representing the content */
export default class PickTheSymbolsBlank {
  /**
   * @constructor
   *
   * @param {object} params Parameters.
   * @param {string} params.color CSS color for background.
   * @param {string[]} params.options Option characters.
   * @param {string} params.solution Solution character.
   */
  constructor(params) {
    this.solution = params.solution;

    this.content = document.createElement('span');
    this.content.classList.add('h5p-pick-the-symbol-blank');
    this.content.setAttribute('tabindex', 0);
    this.content.style.backgroundColor = params.color;

    this.content.addEventListener('click', () => {
      // Open blank overlay
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
  }
}
