/** Class representing the content */
export default class PickTheSymbolsChooser {
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
    this.content.classList.add('h5p-pick-the-symbol-chooser');
    this.content.setAttribute('tabindex', 0);
    this.content.style.backgroundColor = params.color;

    this.content.addEventListener('click', () => {
      // Open chooser overlay
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
     * Get solution for this chooser.
     */
    this.getSolution = () => {
      return this.solution;
    }
  }
}
