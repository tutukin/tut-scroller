exports.config = {
  directConnect: true,

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome'
  },

  specs: ['e2e/*.js'],

  baseUrl:  'http://localhost:4300/',

  framework: 'mocha',
  mochaOpts: {
      reporter: 'spec',
      timeout:  11000,
      slow:     5000
  }
};
