import React, { Component } from 'react';
import './App.css';
import { Route, BrowserRouter, Switch, Link } from 'react-router-dom';
import { MorphBoxContainer } from './morphology/MorphBoxContainer';
import { CommandBar, ICommandBarItemProps, IComponentAsProps, CommandBarButton, BaseComponent, IButtonProps } from 'office-ui-fabric-react';
import { SyntaxBoxContainer } from './syntax/SyntaxBoxContainer';
import { ERModelBoxContainer } from './ermodel/ERModelBoxContainer';
import { Actions, State } from './store';
import { setERModelLoading, loadERModel } from './ermodel/actions';
import { ThunkDispatch } from 'redux-thunk';
import { deserializeERModel, ERModel } from 'gdmn-orm';
import { connect } from 'react-redux';

interface ILinkCommandBarButtonProps extends IComponentAsProps<ICommandBarItemProps> {
  link: string;
  supText?: string;
};

class LinkCommandBarButton extends BaseComponent<ILinkCommandBarButtonProps> {
  public render(): JSX.Element {
    const { defaultRender, link, supText, ...buttonProps } = this.props;

    const onRenderText = supText ? (props: IButtonProps) => <>{props.text}<sup>{supText}</sup></> : undefined;
    const DefaultRender = defaultRender ? defaultRender as any : CommandBarButton;

    return (
      <Link to={link}>
        <DefaultRender {...buttonProps} onRenderText={onRenderText} />
      </Link>
    );
  }
};

interface IAppProps {
  erModel?: ERModel;
  loadingERModel: boolean;
  onLoadERModel: () => void;
};

class InternalApp extends Component<IAppProps, {}> {

  componentDidMount() {
    const { erModel, onLoadERModel, loadingERModel } = this.props;

    if (!erModel && !loadingERModel) {
      onLoadERModel();
    }
  }

  render() {
    return (
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <>
          <CommandBar
            items={this.getItems()}
          />
          <div className="WorkArea">
            <Switch>
              <Route exact={false} path={`/morphology`} component={MorphBoxContainer} />
              <Route exact={false} path={`/syntax`} component={SyntaxBoxContainer} />
              <Route exact={false} path={`/ermodel`} component={ERModelBoxContainer} />
            </Switch>
          </div>
        </>
      </BrowserRouter>
    );
  }

  private getItems = (): ICommandBarItemProps[] => {
    const { loadingERModel, erModel } = this.props;
    const btn = (link: string, supText?: string) => (props: IComponentAsProps<ICommandBarItemProps>) => {
      return <LinkCommandBarButton {...props} link={link} supText={supText} />;
    };

    return [
      {
        key: 'morphology',
        text: 'Morphology',
        commandBarButtonAs: btn('/morphology')
      },
      {
        key: 'syntax',
        text: 'Syntax',
        commandBarButtonAs: btn('/syntax')
      },
      {
        key: 'ermodel',
        disabled: !erModel,
        text: loadingERModel ? 'Loading ER Model...' : 'ERModel',
        commandBarButtonAs: btn('/ermodel', erModel ? Object.entries(erModel.entities).length.toString() : undefined)
      }
    ];
  };
};

export default connect(
  (state: State) => ({
    erModel: state.ermodel.erModel,
    loadingERModel: state.ermodel.loading
  }),
  (dispatch: ThunkDispatch<State, never, Actions>) => ({
    onLoadERModel: () => dispatch(
      (dispatch: ThunkDispatch<State, never, Actions>, _getState: () => State) => {
        dispatch(setERModelLoading(true));

        fetch(`${process.env.PUBLIC_URL}/data/ermodel.serialized.json`)
        .then( res => res.text() )
        .then( res => JSON.parse(res) )
        .then( res => dispatch(loadERModel(deserializeERModel(res))) )
        .then( _res => dispatch(setERModelLoading(false)) )
        .catch( err => {
          dispatch(setERModelLoading(false));
          console.log(err);
         });
      }
    )
  })
)(InternalApp);

