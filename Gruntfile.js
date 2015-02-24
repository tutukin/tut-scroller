module.exports = function (grunt) {
    var gtx = require('gruntfile-gtx').wrap(grunt);

    gtx.loadAuto();

    var gruntConfig = require('./grunt');
    gruntConfig.package = require('./package.json');

    gtx.config(gruntConfig);

    gtx.alias('unit', ['karma:unit:start', 'watch']);
    gtx.alias('e2e', ['connect:protractor', 'protractor:main']);
    //gtx.alias('build', ['clean', 'less', 'copy:build', 'concat', 'uglify', 'jade']);

    gtx.finalise();
};
