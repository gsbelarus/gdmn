import { TAuthActions, authActions } from '../scenes/auth/actions';
import { IContextualMenuItem, ContextualMenuItemType } from 'office-ui-fabric-react';
import { Link } from 'react-router-dom';
import React from 'react';
import { TGdmnActions } from '../scenes/gdmn/actions';

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
  action?: () => TAuthActions | TGdmnActions;
}

export const uiCommands: IUICommand[] = [
  {
    command: 'erModel',
    form: 'mainHeader',
    group: 'ermodel',
    caption: 'ER Model',
    link: `/er-model`
  },
  {
    command: 'webStomp',
    form: 'mainHeader',
    group: 'stomp',
    caption: 'Web-Stomp',
    link: `/web-stomp`
  },
  {
    command: 'userProfile',
    form: 'mainHeader',
    group: 'userAccount',
    caption: 'User profile...',
    iconName: 'ContactInfo',
    link: `/account`
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
  }
];

export function commandsToContextualMenuItems(
  commands: string[],
  dispatch: (action: TAuthActions | TGdmnActions) => void,
  redirect: (link: string) => void
): IContextualMenuItem[] {
  return commands.map((c, idx) => {
    if (c === '-') {
      return {
        key: `divider${idx}`,
        itemType: ContextualMenuItemType.Divider
      };
    } else {
      const cmd = uiCommands.find(uic => uic.command === c);

      if (!cmd) {
        throw new Error(`Unknown command ${c}`);
      }

      return {
        key: cmd.command,
        text: cmd.caption || cmd.command,
        iconProps: cmd.iconName ? { iconName: cmd.iconName } : undefined,
        onClick: cmd.link ? () => redirect(cmd.link!) : cmd.action ? () => dispatch(cmd.action!()) : undefined
      };
    }
  });
}

export function commandToLink(
  command: string,
  linkPrefix?: string,
  dispatch?: (action: TAuthActions | TGdmnActions) => void
): JSX.Element {
  const cmd = uiCommands.find(uic => uic.command === command);

  if (!cmd) {
    throw new Error(`Unknown command ${command}`);
  }

  if (cmd.link) {
    return <Link to={`${linkPrefix ? linkPrefix : ''}${cmd.link}`}>{cmd.caption}</Link>;
  } else if (cmd.action && dispatch) {
    return <span onClick={() => dispatch(cmd.action!())}>{cmd.caption}</span>;
  } else {
    throw new Error(`Invalid command ${command}`);
  }
}
