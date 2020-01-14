import PickTheSymbolsChooser from './h5p-pick-the-symbols-chooser';

/** Class representing the content */
export default class PickTheSymbolsContent {
  /**
   * @constructor
   *
   * @param {object} params Parameters.
   * @param {string} params.taskDescription Task description text.
   * @param {string} params.text Text to parse.
   * @param {string} params.symbols Symbols to replace and pick from.
   * @param {string} params.colorBackground Background color of blanks.
   */
  constructor(params) {
    params.text = params.text.replace(/[ ]{2,}/g, ' ');
    params.symbols = params.symbols.replace(/ /g, '');

    [params.text, params.symbols] = PickTheSymbolsContent.sanitize(params.text, params.symbols);

    this.content = document.createElement('div');
    this.content.classList.add('h5p-pick-the-symbols-content');

    const taskDescription = document.createElement('div');
    taskDescription.classList.add('h5p-pick-the-symbols-task-description');
    taskDescription.innerHTML = params.taskDescription;
    this.content.appendChild(taskDescription);

    const ruler = document.createElement('div');
    ruler.classList.add('h5p-pick-the-symbols-ruler');
    this.content.appendChild(ruler);

    const init = PickTheSymbolsContent.initChoosers([...params.text], [...params.symbols], params.colorBackground);
    this.text = init.text
    this.choosers = init.choosers;

    this.textfield = document.createElement('div');
    this.textfield.innerHTML = this.text;
    this.textfield.classList.add('h5p-pick-the-symbols-text');
    this.content.appendChild(this.textfield);

    /**
     * Return the DOM for this class.
     *
     * @return {HTMLElement} DOM for this class.
     */
    this.getDOM = () => {
      return this.content;
    };
  }

  static sanitize(text, symbols) {
    console.log(text);

    symbols = symbols.replace(/ /g, '');
    text = text
      .replace(/ &nbsp;/g, '')
      .replace(/[ ]{2,}/g, ' ');

    text = [...text];
    for (let i = text.length - 1; i > 0; i--) {
      const current = text[i];
      if (current === ' ') {
        if (
          ([...symbols].indexOf(text[i - 1]) !== -1) ||
          ((i + 1 < text.length) && [...symbols].indexOf(text[i + 1]) !== -1)
        ) {
          text.splice(i, 1);
        }
      }
    }

    return [text, symbols];
  }

  /**
   * Initialize choosers and text.
   * @param {string[]} chars Characters of text.
   * @param {string[]} symbols Symbols to replace.
   * @param {string} color CSS color for blanks background.
   */
  static initChoosers(chars, symbols, color) {
    if (!chars || !symbols) {
      return;
    }

    const choosers = [];

    for (let i = 0; i < chars.length; i++) {
      if (symbols.indexOf(chars[i]) !== -1 || chars[i] === ' ') {
        const chooser = new PickTheSymbolsChooser({
          color: color,
          options: symbols,
          solution: chars[i]
        });

        choosers.push(chooser);
        chars[i] = chooser.getDOM().outerHTML;
      }
    }

    return {
      choosers: choosers,
      text: chars.join('')
    };
  }
}
