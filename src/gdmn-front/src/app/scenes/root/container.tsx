import { compose } from 'recompose';
import { hot } from 'react-hot-loader';
import { Root } from '@src/app/scenes/root/component';

const RootContainer = compose(hot(module))(Root as any); // fixme: type

export { RootContainer };
