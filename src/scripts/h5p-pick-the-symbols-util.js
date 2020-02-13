/** Class for utility functions */
class Util {
  /**
   * Extend an array just like JQuery's extend.
   * @param {object} arguments Objects to be merged.
   * @return {object} Merged objects.
   */
  static extend() {
    for (let i = 1; i < arguments.length; i++) {
      for (let key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key)) {
          if (typeof arguments[0][key] === 'object' && typeof arguments[i][key] === 'object') {
            this.extend(arguments[0][key], arguments[i][key]);
          }
          else {
            arguments[0][key] = arguments[i][key];
          }
        }
      }
    }
    return arguments[0];
  }

  /**
   * Retrieve true string from HTML encoded string.
   * @param {string} input Input string.
   * @return {string} Output string.
   */
  static htmlDecode(input) {
    var dparser = new DOMParser().parseFromString(input, 'text/html');
    return dparser.documentElement.textContent.replace(/(\r\n|\n|\r)/gm, '');
  }

  /** Get top DOM Window object.
	 * @param {Window} [startWindow=window] Window to start looking from.
   * @param {number} [maxLevel=Infinity];
	 * @return {Window|false} Top window.
	 */
  static getTopWindow(startWindow = window, maxLevel = Infinity) {
    if (maxLevel === 0) {
      return startWindow;
    }

    let sameOrigin;
    try {
      sameOrigin = startWindow.parent.location.host === window.location.host;
    }
    catch (error) {
      sameOrigin = false;
    }

    if (!sameOrigin) {
      return startWindow;
    }

    if (startWindow.parent === startWindow || !startWindow.parent) {
      return startWindow;
    }

    return Util.getTopWindow(startWindow.parent, maxLevel - 1);
  }
}

export default Util;
