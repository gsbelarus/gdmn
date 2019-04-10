import {PasswordInput} from "@gdmn/client-core";
import {IApplicationInfo, TTaskActionNames, TTaskActionPayloadTypes} from "@gdmn/server-api";
import {IViewProps, View} from "@src/app/components/View";
import {
  Checkbox,
  DefaultButton,
  Dialog,
  DialogFooter,
  FocusZone,
  FocusZoneDirection,
  ICommandBarItemProps,
  List,
  PrimaryButton,
  Spinner,
  SpinnerSize,
  TextField
} from "office-ui-fabric-react";
import React from "react";
import "../../../../styles/Application.css";
import {ISignInBoxData} from "../../auth/components/SignInBox";

export interface IApplicationsViewProps extends IViewProps {
  userName: string;
  password: string;
  apps: Array<IApplicationInfo & { loading?: boolean }>;
  apiGetApplications: () => void;
  apiCreateApplication: (payload: TTaskActionPayloadTypes[TTaskActionNames.CREATE_APP]) => void;
  apiDeleteApplication: (uid: string) => void;
  apiSetApplication: (app: IApplicationInfo) => void;
  signIn: (data: ISignInBoxData) => void;
  signOut: () => void;
}

export interface IAddApplicationsViewState {
  alias?: string;
  external?: boolean;
  host?: string;
  port?: number;
  path?: string;
  username?: string;
  password?: string;
  add: boolean;
  selectedAppUid?: string;
}

export class ApplicationsView extends View<IApplicationsViewProps, IAddApplicationsViewState> {

  public state: IAddApplicationsViewState = {
    add: false
  };

  private _listRef: List<IApplicationInfo & { loading?: boolean | undefined; }> | null = null;

  constructor(props: IApplicationsViewProps) {
    super(props);
    this.onRenderCell = this.onRenderCell.bind(this);
  }

  public getViewCaption(): string {
    return "List application";
  }

  public getCommandBarItems(): ICommandBarItemProps[] {
    return [
      ...super.getCommandBarItems(),
      {
        key: "add",
        text: "Add",
        iconProps: {
          iconName: "Add"
        },
        onClick: () => {
          this.setState({add: true});
        }
      },
      {
        key: "delete",
        text: "Delete",
        disabled: !this.state.selectedAppUid,
        iconProps: {
          iconName: "Delete"
        },
        onClick: () => {
          this.props.apiDeleteApplication(this.state.selectedAppUid!);
          this.setState({selectedAppUid: undefined});
        }
      },
      {
        key: "connect",
        text: "Connect",
        disabled: !this.props.apps.some((item) => item.uid === this.state.selectedAppUid),
        iconProps: {
          iconName: "PlugConnected"
        },
        onClick: () => {
          const app = this.props.apps.find((item) => item.uid === this.state.selectedAppUid);
          const user = this.props.userName;
          const pass = this.props.password;
          this.props.signOut();
          this.props.signIn({userName: user, password: pass, uid: app!.uid});
          this.props.apiSetApplication(app!);
          this.setState({selectedAppUid: undefined});
        }
      }
    ];
  }

  private onRenderCell(app?: IApplicationInfo & { loading?: boolean }): JSX.Element {
    if (!app) throw new Error("ApplicationInfo is undefined");

    const server = app.connectionOptions && app.connectionOptions.server;
    let backgroundColor = undefined;
    if (this.state.selectedAppUid === app.uid) {
      backgroundColor = "#A6A6A6";
    } else if (app.loading) {
      backgroundColor = "gray";
    }
    return (
      <div className="container" style={{backgroundColor, pointerEvents: app.loading ? "none" : "auto"}}>
        <div hidden={!app.loading}>
          <Spinner size={SpinnerSize.medium}/>
        </div>
        <div
          className="application"
          key={`${app.uid}//${app.alias}`}
          data-is-focusable={!app.loading}
          onClick={() => {
            this.setState({selectedAppUid: app.uid}, () => this._listRef!.forceUpdate());
          }}
        >
          <div className="applicationAlias">Alias: {app.alias}</div>
          {server ? <div className="applicationInfo">IP: {server.host}:{server.port}</div> : undefined}
          <div className="applicationInfo">Date
            create: {app.creationDate.toLocaleString("en-US", {hour12: false})}</div>
        </div>
      </div>
    );
  }

  public render() {
    const {apiCreateApplication} = this.props;

    return (
      <>
        <Dialog
          hidden={!this.state.add}
          onDismiss={() => this.setState({add: false})}
          modalProps={{
            isBlocking: true,
            topOffsetFixed: true
          }}
        >
          <TextField
            label="Alias:"
            style={{maxWidth: "300px"}}
            value={this.state.alias}
            onChange={(_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
              this.setState({alias: newValue ? newValue : ""});
            }}
          />
          <Checkbox
            label="Externel"
            styles={{root: {margin: "8px 0px"}}}
            checked={this.state.external}
            onChange={(_ev?: React.FormEvent<HTMLElement>, isChecked?: boolean) => this.setState({external: isChecked})}
          />
          {this.state.external && (
            <div>
              <TextField
                label="Host:"
                style={{maxWidth: "300px"}}
                value={this.state.host}
                onChange={(_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
                  this.setState({host: newValue});
                }}
              />
              <TextField
                label="Port:"
                style={{maxWidth: "300px"}}
                value={this.state.port ? String(this.state.port) : ""}
                onChange={(_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
                  this.setState({port: newValue ? Number(newValue) : undefined});
                }}
              />
              <TextField
                label="Path:"
                style={{maxWidth: "300px"}}
                value={this.state.path}
                onChange={(_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
                  this.setState({path: newValue});
                }}
              />
              <TextField
                label="Username:"
                style={{maxWidth: "300px"}}
                value={this.state.username}
                onChange={(_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
                  this.setState({username: newValue});
                }}
              />
              <PasswordInput
                label="Password:"
                style={{maxWidth: "300px"}}
                value={this.state.password}
                onChange={(_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
                  this.setState({password: newValue});
                }}
              />
            </div>
          )}
          <DialogFooter>
            <PrimaryButton
              onClick={() => {
                const data: TTaskActionPayloadTypes[TTaskActionNames.CREATE_APP] = {
                  alias: this.state.alias ? this.state.alias : "",
                  external: !!this.state.external,
                  connectionOptions: this.state.external
                    ? {
                      server: this.state.host && this.state.port !== null && this.state.port !== undefined
                        ? {
                          host: this.state.host,
                          port: this.state.port
                        } : undefined,
                      username: this.state.username,
                      password: this.state.password,
                      path: this.state.path
                    } : undefined
                };
                apiCreateApplication(data);
                this.setState({add: false});
              }}
              text="Save"/>
            <DefaultButton onClick={() => this.setState({add: false})} text="Cancel"/>
          </DialogFooter>
        </Dialog>
        {this.props.apps && (
          <div>
            <div className="ViewHeader" style={{height: this.getViewHeaderHeight()}}>
              {this.renderCommandBar()}
            </div>
            <FocusZone direction={FocusZoneDirection.vertical}>
              <div className="ListApplications">
                <List ref={(ref) => this._listRef = ref} items={this.props.apps} onRenderCell={this.onRenderCell}/>
              </div>
            </FocusZone>
          </div>
        )
        }
      </>
    );
  }
}
