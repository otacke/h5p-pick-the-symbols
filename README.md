# H5P Pick the Symbols
Let your student put the correct symbols into sentences.

## Support the development!
This free and openly licensed H5P content type was sponsored by
"Schule Bubendorf" in Switzerland. If you want to fund further development, you
can donate to

* **Recipient:** Schule Bubendorf
* **IBAN:** CH35 0076 9020 2108 8389 6
* **BIC:** BLKBCH22

**If you have questions or feature suggestions, please contact schulleitung@schulebubendorf.ch but not Oliver. He merely was the contractor who developed the code and put it here.**

## Getting started (for developers)
Clone this repository with git and check out the branch that you are interested
in (or choose the branch first and then download the archive, but learning
how to use git really makes sense).

Change to the repository directory and run
```bash
npm install
```

to install required modules. Afterwards, you can build the project using
```bash
npm run build
```

or, if you want to let everything be built continuously while you are making
changes to the code, run
```bash
npm run watch
```
Before putting the code in production, you should always run `npm run build`.

The build process will transpile ES6 to earlier versions in order to improve
compatibility to older browsers. If you want to use particular functions that
some browsers don't support, you'll have to add a polyfill.

The build process will also move the source files into one distribution file and
minify the code.
