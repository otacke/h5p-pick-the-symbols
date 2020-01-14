/** Class representing the content */
export default class PickTheSymbolsContent {
  /**
   * @constructor
   *
   * @param {string} textField Parameter from editor.
   * @param {string} [username=world] Username.
   * @param {number} [random=-1] Random number.
   */
  constructor(params) {
    this.content = document.createElement('div');
    this.content.innerHTML = `<p>${params.text}</p>`;

    /**
     * Return the DOM for this class.
     *
     * @return {HTMLElement} DOM for this class.
     */
    this.getDOM = () => {
      return this.content;
    };
  }
}
