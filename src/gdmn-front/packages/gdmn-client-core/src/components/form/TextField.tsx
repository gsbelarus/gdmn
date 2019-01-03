import { compose, mapProps, setDisplayName } from 'recompose';
import { TextField as TextInput } from 'office-ui-fabric-react/lib/components/TextField';

// TODO types

function fieldPropsMapper({ input: { name, value, onChange }, meta: { touched, error }, ...customProps }: any) {
  return {
    fullWidth: true,
    error: touched && !!error,
    helperText: touched && !!error ? error : null,
    name,
    value,
    onChange, // TODO test
    ...customProps
  };
}

const TextField = compose(
  setDisplayName('TextField'),
  mapProps(fieldPropsMapper)
)(TextInput);

export { TextField, fieldPropsMapper };
