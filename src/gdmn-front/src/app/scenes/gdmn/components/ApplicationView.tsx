import React from 'react';
import { View, IViewProps } from '@src/app/components/View';
import { ISignInBoxData } from '../../auth/components/SignInBox';
import '../../../../styles/Application.css';
import { TextField, DefaultButton, Checkbox, Dialog, DialogFooter, PrimaryButton, Spinner, SpinnerSize, FocusZone, List, FocusZoneDirection } from 'office-ui-fabric-react';
import { PasswordInput } from '@gdmn/client-core';
import { TTaskActionPayloadTypes, TTaskActionNames, IApplicationInfo } from '@gdmn/server-api';

export interface IApplicationViewProps extends IViewProps {
  userName: string;
  password: string;
  apps?: Array<any>;
  runAction: boolean;
  actionWithApplication?: string;
  apiGetApplications: () => void;
  apiCreateApplication: (payload: TTaskActionPayloadTypes[TTaskActionNames.CREATE_APP]) => void;
  apiDeleteApplication: (uid: string) => void;
  apiSetApplication: (app: Object) => void;
  signIn: (data: ISignInBoxData) => void;
  signOut: () => void;
}

export interface IAddApplicationState {
  alias?: string;
  external?: boolean;
  host?: string;
  port?: number;
  path?: string;
  username?: string;
  password?: string;
  add: boolean;
  apps?: Array<any>;
  process?: string;
}

export class ApplicationView extends View<IApplicationViewProps, IAddApplicationState> {

  public state: IAddApplicationState = {
    add: false
  }

  constructor(props: IApplicationViewProps) {
    super(props);
    this.onRenderCell = this.onRenderCell.bind(this);
  }

  public getViewCaption(): string {
    return 'List application';
  }

  public componentDidMount() {
    super.componentDidMount();

    this.props.apiGetApplications();
    this.setState({ apps: this.props.apps });
  }

  public componentDidUpdate(prevProps: IApplicationViewProps) {
    if(!this.props.apps) {
      this.props.apiGetApplications();
    }
  }

  private onRenderCell(app?: any, index?: number, isScrolling?: boolean): JSX.Element {
    const date = new Date(app.creationDate);
    return (
      <div className="application" key={`${app.uid}//${app.alias}`} data-is-focusable={true}>
        <div className="deleteApp" onClick={() => {
          console.log('delete');
          this.setState({ process: 'delete' });
          this.props.apiDeleteApplication(app.uid);
          this.setState({ apps: this.props.apps ? [...this.props.apps] : [] })
          this.setState({ process: undefined });
        } }>Delete</div>
        <div className="applicationContent" onClick={() => {
          const user = this.props.userName;
          const pass = this.props.password;
          this.props.signOut();
          this.props.signIn({ userName: user, password: pass, uid: app.uid });
          this.props.apiSetApplication(app);
        }}>
          <div className="applicationAlias">Alias: {app.alias}</div>
          {app.server ? <div className="applicationInfo">IP: {app.server.host}:{app.server.port}</div> : undefined}
          <div className="applicationInfo">Date create: {date.toLocaleDateString('en-GB')}</div>
        </div>
      </div>
    );
  }

  public render() {
    const { apiCreateApplication } = this.props;

    return (
      <>
        <Dialog
          hidden={!this.state.add}
          onDismiss={() => this.setState({ add: false })}
          modalProps={{
            isBlocking: true,
            topOffsetFixed: true
          }}
        >
          <TextField
            label="Alias:"
            style={{ maxWidth: '300px' }}
            value={this.state.alias}
            onChange={(_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
              this.setState({ alias: newValue ? newValue : '' });
            }}
          />
          <Checkbox
            label="Externel"
            styles={{ root: { margin: '8px 0px' } }}
            checked={this.state.external}
            onChange={(_ev?: React.FormEvent<HTMLElement>, isChecked?: boolean) => this.setState({ external: isChecked })}
          />
          {this.state.external && (
            <div>
              <TextField
                label="Host:"
                style={{ maxWidth: '300px' }}
                value={this.state.host}
                onChange={(_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
                  this.setState({ host: newValue });
                }}
              />
              <TextField
                label="Port:"
                style={{ maxWidth: '300px' }}
                value={String(this.state.port)}
                onChange={(_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
                  this.setState({ port: newValue ? Number(newValue) : undefined });
                }}
              />
              <TextField
                label="Path:"
                style={{ maxWidth: '300px' }}
                value={this.state.path}
                onChange={(_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
                  this.setState({ path: newValue });
                }}
              />
              <TextField
                label="Username:"
                style={{ maxWidth: '300px' }}
                value={this.state.username}
                onChange={(_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
                  this.setState({ username: newValue });
                }}
              />
              <PasswordInput
                label="Password:"
                style={{ maxWidth: '300px' }}
                value={this.state.password}
                onChange={(_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
                  this.setState({ password: newValue });
                }}
              />
            </div>
          )}
          <DialogFooter>
            <PrimaryButton
              onClick={() => {
                const data: TTaskActionPayloadTypes[TTaskActionNames.CREATE_APP] = {
                  alias: this.state.alias ? this.state.alias : '',
                  external: !!this.state.external,
                  connectionOptions: this.state.external
                    ? {
                      host: this.state.host,
                      port: this.state.port,
                      username: this.state.username,
                      password: this.state.password,
                      path: this.state.path
                    }
                    : undefined
                };
                apiCreateApplication(data);
                this.setState({ process: 'add' });
                this.setState({ add: false });
              }}
              text="Save" />
            <DefaultButton onClick={() => this.setState({ add: false })} text="Cancel" />
          </DialogFooter>
        </Dialog>
        <div className="addApp" onClick={() => { this.setState({ add: true }) }}>Add application</div>
        {this.props.apps &&
          <FocusZone direction={FocusZoneDirection.vertical}>
            <div className="ListApplications" data-is-scrollable={true}>
              <List items={this.props.apps} onRenderCell={this.onRenderCell} />
            </div>
          </FocusZone>
        }
      </>
    );
  }
}
