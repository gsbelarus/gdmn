import {PasswordInput} from "@gdmn/client-core";
import {IApplicationInfo, ITemplateApplication, TTaskActionNames, TTaskActionPayloadTypes} from "@gdmn/server-api";
import {IViewProps, View} from "@src/app/components/View";
import {
  Checkbox,
  DefaultButton,
  Dialog,
  DialogFooter,
  Dropdown,
  FocusZone,
  FocusZoneDirection,
  ICommandBarItemProps,
  IDropdownOption,
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
  apps: Array<IApplicationInfo & { loading?: boolean }>;
  templates: ITemplateApplication[];
  apiCreateApplication: (payload: TTaskActionPayloadTypes[TTaskActionNames.CREATE_APP]) => void;
  apiDeleteApplication: (uid: string) => void;
  apiGetTemplatesApplication: () => void;
  reconnectToApplication: (app: IApplicationInfo) => void;
  signIn: (data: ISignInBoxData) => void;
  signOut: () => void;
}

export interface IAddApplicationsViewState {
  alias?: string;
  external?: boolean;
  template?: string;
  host?: string;
  port?: number;
  path?: string;
  username?: string;
  password?: string;
  openDialogAdd: boolean;
  openDialogServer: boolean;
  selectedAppUid?: string;
}

export class ApplicationsView extends View<IApplicationsViewProps, IAddApplicationsViewState> {

  public state: IAddApplicationsViewState = {
    openDialogAdd: false,
    openDialogServer: false
  };

  private _listRef: List<IApplicationInfo & { loading?: boolean | undefined; }> | null = null;

  constructor(props: IApplicationsViewProps) {
    super(props);

    this._onRenderCell = this._onRenderCell.bind(this);
    this._onChange = this._onChange.bind(this);
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
          this.props.apiGetTemplatesApplication(); //TODO
          this.setState({ openDialogAdd: true });
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
          const app = this.props.apps.find((item) => item.uid === this.state.selectedAppUid);
          if (app) {
            // TODO
            if (!app.external && !confirm("База данных будет полностью удалена с устройства")) return;
            this.props.apiDeleteApplication(this.state.selectedAppUid!);
            this.setState({ selectedAppUid: undefined });
          }
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
          this.props.reconnectToApplication(app!);
          this.setState({ selectedAppUid: undefined });
        }
      }
    ];
  }

  private _onChange(event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number): void {
    if (option) {
      this.setState({ template: option.key as string });
    }
  };

  private _onRenderCell(app?: IApplicationInfo & { loading?: boolean }): JSX.Element {
    if (!app) throw new Error("ApplicationInfo is undefined");

    let backgroundColor = undefined;
    if (this.state.selectedAppUid === app.uid) {
      backgroundColor = "#A6A6A6";
    } else if (app.loading) {
      backgroundColor = "gray";
    }
    return (
      <div
        className="container"
        data-is-focusable={!app.loading}
        key={`${app.uid}//${app.alias}`}
        onClick={() => {
          this.setState({ selectedAppUid: app.uid }, () => this._listRef!.forceUpdate());
        }}
        style={{ backgroundColor, pointerEvents: app.loading ? "none" : "auto" }}>
        <div hidden={!app.loading}>
          <Spinner size={SpinnerSize.medium} />
        </div>
        <div className="application">
          <div className="applicationAlias">
            Alias: {app.alias}{app.external ? " (внешняя)" : ""}
          </div>
          <div className="applicationInfo">
            Date create: {app.creationDate.toLocaleString("en-US", {hour12: false})}
          </div>
          {app.external ? (
            <>
              <div className="applicationInfo">
                IP: {app.server ? `${app.server.host}:${app.server.port}` : "Default"}
              </div>
              <div className="applicationInfo">
                Path: {app.path}
              </div>
            </>
          ) : undefined}
        </div>
      </div>
    );
  }

  public render() {
    const {apiCreateApplication, templates} = this.props;
    const options: IDropdownOption[] = [
      { key: 'undefined', text: 'шаблон не выбран' }
    ];
    if (templates) {
      templates.forEach(template => {
        options.push({key: template.name, text: template.description});
      });
    }

    return (
      <>
        <Dialog
          hidden={!this.state.openDialogAdd}
          onDismiss={() => this.setState({ openDialogAdd: false, alias: '', template: undefined, host: '', port: undefined, path: '', username: '', password: '' })}
          modalProps={{
            isBlocking: true,
            topOffsetFixed: false
          }}>
          <TextField
            label="Alias:"
            style={{maxWidth: "300px"}}
            value={this.state.alias}
            onChange={(_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
              this.setState({alias: newValue ? newValue : ""});
            }}
          />
          <Checkbox
            label="External"
            styles={{root: {margin: "8px 0px"}}}
            checked={this.state.external}
            onChange={(_ev?: React.FormEvent<HTMLElement>, isChecked?: boolean) => this.setState({external: isChecked})}
          />
          {this.state.external ? (
            <div>
              <PrimaryButton
                text={this.state.port !== null && this.state.port !== undefined && this.state.host !== "" ? `IP: ${this.state.host}:${this.state.port}` : "Server"}
                onClick={() => {
                  this.setState({openDialogServer: true});
                }}
              />
              <Dialog
                hidden={!this.state.openDialogServer}
                onDismiss={() => this.setState({ openDialogServer: false, host: '', port: undefined })}
                modalProps={{
                  isBlocking: true,
                  topOffsetFixed: true
                }}>
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
                <DialogFooter>
                  <PrimaryButton
                    onClick={() => {
                      this.setState({openDialogServer: false});
                    }}
                    text="Save"/>
                  <DefaultButton
                    onClick={() => {
                      this.setState({openDialogServer: false, host: "", port: undefined});
                    }}
                    text="Cancel"
                  />
                </DialogFooter>
              </Dialog>
              <TextField
                label="Path:"
                style={{maxWidth: "300px"}}
                value={this.state.path}
                onChange={(_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
                  this.setState({path: newValue});
                }}
              />
              <TextField
                label="DB Username:"
                style={{maxWidth: "300px"}}
                value={this.state.username}
                onChange={(_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
                  this.setState({username: newValue});
                }}
              />
              <PasswordInput
                label="DB Password:"
                style={{maxWidth: "300px"}}
                value={this.state.password}
                onChange={(_e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
                  this.setState({password: newValue});
                }}
              />
            </div>
          )
            : (
              <div>
                {!templates ? (<Spinner size={SpinnerSize.medium} />) : undefined}
                <Dropdown
                  placeholder="Select an template"
                  label="Template: "
                  options={options}
                  selectedKey={this.state.template}
                  onChange={this._onChange}
                  disabled={!templates}
                />
              </div>
            )}
          <DialogFooter>
            <PrimaryButton
              disabled={!this.state.external
                ? !(this.state.alias && this.state.template !== undefined && this.state.template !== 'undefined')
                : !(this.state.alias && this.state.host && this.state.path && this.state.password)
              }
              onClick={() => {
                const data: TTaskActionPayloadTypes[TTaskActionNames.CREATE_APP] = {
                  alias: this.state.alias ? this.state.alias : "",
                  external: !!this.state.external,
                  template: !this.state.external ? this.state.template : undefined,
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
                this.setState({openDialogAdd: false});
              }}
              text="Save" />
            <DefaultButton
              onClick={() => this.setState({openDialogAdd: false, alias: '', template: undefined, host: '', port: undefined, path: '', username: '', password: ''})}
              text="Cancel"
            />
          </DialogFooter>
        </Dialog>
        {this.props.apps && (
          <div>
            <div className="ViewHeader" style={{height: this.getViewHeaderHeight()}}>
              {this.renderCommandBar()}
            </div>
            <FocusZone direction={FocusZoneDirection.vertical}>
              <div className="ListApplications">
                <List ref={(ref) => this._listRef = ref} items={this.props.apps} onRenderCell={this._onRenderCell}/>
              </div>
            </FocusZone>
          </div>
        )}
      </>
    );
  }
}
