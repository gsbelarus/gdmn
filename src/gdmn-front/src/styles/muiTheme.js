const purple = require('@material-ui/core/colors/purple').default;
const green = require('@material-ui/core/colors/green').default;
const createMuiTheme = require('@material-ui/core/styles').createMuiTheme;

const theme = createMuiTheme({
  palette: {
    primary: purple,
    secondary: green
  }
});

module.exports = theme;
