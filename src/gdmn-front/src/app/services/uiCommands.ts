import { TAuthActions, authActions } from "../scenes/auth/actions";
import { IContextualMenuItem, ContextualMenuItemType } from "office-ui-fabric-react";

export const uiForms = [
  {
    name: 'stompProtocol'
  }
];

export interface IUICommand {
  command: string;
  form?: string;
  group?: string;
  caption?: string;
  iconName?: string;
  link?: string;
  action?: () => TAuthActions;
};

export const uiCommands: IUICommand[] = [
  {
    command: 'userProfile',
    form: 'mainHeader',
    group: 'userAccount',
    caption: 'User profile...',
    iconName: 'ContactInfo',
    link: `/account`,
  },
  {
    command: 'logout',
    form: 'mainHeader',
    group: 'userAccount',
    caption: 'Logout',
    iconName: 'SignOut',
    action: authActions.signOut
  },
  {
    command: 'deleteAccount',
    form: 'mainHeader',
    group: 'userAccount',
    caption: 'Delete account'
  },
];

export function commandsToContextualMenuItems(commands: string[], dispatch: (action: TAuthActions) => void, redirect: (link: string) => void): IContextualMenuItem[] {
  return commands.map( (c, idx) => {
    if (c === '-') {
      return {
        key: `divider${idx}`,
        itemType: ContextualMenuItemType.Divider
      };
    } else {
      const cmd = uiCommands.find( uic => uic.command === c );

      if (!cmd) {
        throw new Error(`Unknown command ${c}`);
      }

      return {
        key: cmd.command,
        text: cmd.caption || cmd.command,
        iconProps: cmd.iconName ? { iconName: cmd.iconName } : undefined,
        onClick: cmd.link
          ? () => redirect(cmd.link!)
          : cmd.action
          ? () => dispatch(cmd.action!())
          : undefined
      }
    }
  });
};
