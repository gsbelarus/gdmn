import { compose, mapProps, setDisplayName } from 'recompose';

import { PasswordInput } from './PasswordInput';
import { fieldPropsMapper } from './TextField';

const PasswordField = compose(
  setDisplayName('PasswordField'),
  mapProps(fieldPropsMapper)
)(PasswordInput);

export { PasswordField };
