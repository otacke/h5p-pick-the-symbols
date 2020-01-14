/** Class representing the content */
export default class PickTheSymbolsContent {
  /**
   * @constructor
   *
   * @param {object} params Parameters.
   * @param {string} params.taskDescription Task description text.
   * @param {string} params.text Text to parse.
   * @param {string} params.symbols Symbols to replace and pick from.
   */
  constructor(params) {
    this.content = document.createElement('div');
    this.content.classList.add('h5p-pick-the-symbols-content');

    const taskDescription = document.createElement('div');
    taskDescription.classList.add('h5p-pick-the-symbols-task-description');
    taskDescription.innerHTML = params.taskDescription;
    this.content.appendChild(taskDescription);

    const ruler = document.createElement('div');
    ruler.classList.add('h5p-pick-the-symbols-ruler');
    this.content.appendChild(ruler);

    this.text = document.createElement('div');
    this.text.innerHTML = params.text;
    this.text.classList.add('h5p-pick-the-symbols-text');
    this.content.appendChild(this.text);

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
