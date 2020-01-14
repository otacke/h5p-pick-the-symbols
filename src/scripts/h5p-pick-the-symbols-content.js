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
    // Space can't be a symbol
    params.symbols = params.symbols.replace(/ /g, '');
    params.text = params.text
      .replace(/ &nbsp;/g, ' ')  // CKeditor creates &nbsp; for multiple blanks
      .replace(/[ ]{2,}/g, ' '); // Only keep one blank between words

    const init = PickTheSymbolsContent.initChoosers(
      [...params.text],
      [...params.symbols],
      params.colorBackground
    );
    this.text = init.text
    this.choosers = init.choosers;

    // DOM
    this.content = document.createElement('div');
    this.content.classList.add('h5p-pick-the-symbols-content');

    // Task description
    const taskDescription = document.createElement('div');
    taskDescription.classList.add('h5p-pick-the-symbols-task-description');
    taskDescription.innerHTML = params.taskDescription;
    this.content.appendChild(taskDescription);

    // Ruler
    const ruler = document.createElement('div');
    ruler.classList.add('h5p-pick-the-symbols-ruler');
    this.content.appendChild(ruler);

    // Textfield
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

  /**
   * Initialize choosers and text.
   * @param {string[]} chars Characters of text.
   * @param {string[]} symbols Symbols to replace.
   * @param {string} color CSS color for blanks background.
   * @return {object} Choosers and HTML text to display.
   */
  static initChoosers(chars, symbols, color) {
    if (!chars || !symbols) {
      return;
    }

    // We only want one chooser between words
    chars = chars.reduce( (prev, curr) => {
      if (curr === ' ' && symbols.indexOf(prev.slice(-1)) !== -1) {
        return prev;
      }
      else if (symbols.indexOf(curr) !== -1 && prev.slice(-1) === ' ') {
        return `${prev.slice(0, -1)}${curr}`;
      }
      else {
        return `${prev}${curr}`;
      }
    }, '');

    // We could end up with <p></p> later that wouldn't have height
    chars = chars.replace(/&nbsp;/g, '\u2800');
    chars = [...chars];

    const choosers = [];
    let htmlMode = false;

    for (let i = 0; i < chars.length; i++) {

      // Skip HTML tags
      if (!htmlMode && chars[i] === '<') {
        htmlMode = true;
        continue;
      }
      else if (htmlMode && chars[i] === '>') {
        htmlMode = false;
        continue;
      }
      else if (htmlMode) {
        continue;
      }

      // Skip regular characters
      if (chars[i] !== ' ' && symbols.indexOf(chars[i]) === -1) {
        continue;
      }

      // Replace blanks and symbols with chooser
      const chooser = new PickTheSymbolsChooser({
        color: color,
        options: symbols,
        solution: chars[i]
      });

      choosers.push(chooser);

      // TODO: Doh! This doesn't work, of course. Fix!
      chars[i] = chooser.getDOM().outerHTML;
    }

    return {
      choosers: choosers,
      text: chars.join('')
    };
  }
}
