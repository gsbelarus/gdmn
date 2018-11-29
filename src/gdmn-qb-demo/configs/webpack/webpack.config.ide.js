const path = require('path');

module.exports = {
  resolve: {
    alias: {
      '@src': path.join(__dirname, '../../src'),
      configFile: path.join(__dirname, '../config.json')
    }
  }
};
