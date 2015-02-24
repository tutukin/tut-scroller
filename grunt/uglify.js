module.exports = {
  build: {
    options: {
      sourceMap: true,
      sourceMapIncludeSources: true
    },
    files: {
      'build/js/tut-scroller.min.js': [
        'src/js/tutScroller.js',
        'src/js/tutScrollerDirective.js',
        'src/js/tutScrollerController.js'
      ]
    }
  }
};
