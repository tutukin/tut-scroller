module.exports = {
  build: {
    options: {sourceMap: true},
    files: {
      'build/js/tut-scroller.js': [
        'src/js/tutScroller.js',
        'src/js/tutScrollerDirective.js',
        'src/js/tutScrollerController.js'
      ]
    }
  }
};
