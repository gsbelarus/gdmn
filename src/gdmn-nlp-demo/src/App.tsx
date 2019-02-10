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
import { ChatBoxContainer } from './nlpdialog/NLPDialogBoxContainer';

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
  onLoadERModel: (srcFile: string, name: string) => void;
};

class InternalApp extends Component<IAppProps, {}> {

  componentDidMount() {
    const { erModel, onLoadERModel, loadingERModel } = this.props;

    if (!erModel && !loadingERModel) {
      onLoadERModel('/data/ermodel.serialized.json', 'db');
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
              <Route exact={false} path={`/nlpdialog`} component={ChatBoxContainer} />
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
      },
      {
        key: 'nlpdialog',
        disabled: !erModel,
        text: loadingERModel ? 'Loading...' : 'NLP Dialog',
        commandBarButtonAs: btn('/nlpdialog')
      }
    ];
  };
};

export default connect(
  (state: State) => {
    if (state.ermodel['db']) {
      return {
        erModel: state.ermodel['db'].erModel,
        loadingERModel: state.ermodel['db'].loading
      }
    }

    return {
      loadingERModel: false
    }
  },
  (dispatch: ThunkDispatch<State, never, Actions>) => ({
    onLoadERModel: (srcFile: string, name: string) => dispatch(
      (dispatch: ThunkDispatch<State, never, Actions>, _getState: () => State) => {
        dispatch(setERModelLoading({ name, loading: true }));
        fetch(`${process.env.PUBLIC_URL}${srcFile}`)
        .then( res => res.text() )
        .then( res => JSON.parse(res) )
        .then( res => dispatch(loadERModel({ name, erModel: deserializeERModel(res, true) })) )
        .then( _res => dispatch(setERModelLoading({ name, loading: false })) )
        .catch( err => {
          dispatch(setERModelLoading({ name, loading: false }));
          console.log(err);
         });
      }
    )
  })
)(InternalApp);

