module.exports = {
  build: {
    options: {sourceMap: true},
    files: {
      'build/js/tut-scroller.js': [
        'src/tutScroller.js',
        'src/js/tutScrollerDirective.js',
        'src/js/PointerMovementsService.js',
        'src/js/ScrollerService.js'
      ]
    }
  }
};
