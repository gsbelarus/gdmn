import React from 'react';
import { Link } from 'react-router-dom';
import { ContextualMenuItemType, IContextualMenuItem } from 'office-ui-fabric-react/lib/components/ContextualMenu';

import { authActionsAsync } from '@src/app/scenes/auth/actions';
import { AnyAction } from 'redux';
import { TThunkAction } from '@src/app/store/TActions';

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
  action?: () => AnyAction | TThunkAction;
}

export const uiCommands: IUICommand[] = [
  {
    command: 'sql',
    form: 'mainHeader',
    group: 'sql',
    caption: 'SQL',
    link: `/sql`
  },
  {
    command: 'internals',
    form: 'mainHeader',
    group: 'internals',
    caption: 'Internals',
    link: `/internals`
  },
  {
    command: 'applications',
    form: 'mainHeader',
    group: 'applications',
    caption: 'Applications',
    link: `/applications`
  },
  {
    command: 'erModel',
    form: 'mainHeader',
    group: 'ermodel',
    caption: 'ER Model',
    link: `/er-model`
  },
  {
    command: 'erModel2',
    form: 'mainHeader',
    group: 'ermodel',
    caption: 'ER Model2',
    link: `/er-model2`
  },
  {
    command: 'webStomp',
    form: 'mainHeader',
    group: 'stomp',
    caption: 'Web-Stomp',
    link: `/web-stomp`
  },
  {
    command: 'bp',
    form: 'mainHeader',
    group: 'bp',
    caption: 'BP',
    link: `/bp`
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
    command: 'themeEditor',
    form: 'mainHeader',
    group: 'userAccount',
    caption: 'Theme editor...',
    iconName: 'Color',
    link: `/themeEditor`
  },
  {
    command: 'logout',
    form: 'mainHeader',
    group: 'userAccount',
    caption: 'Logout',
    iconName: 'SignOut',
    action: authActionsAsync.signOut
  },
  {
    command: 'deleteAccount',
    form: 'mainHeader',
    group: 'userAccount',
    caption: 'Delete account'
  }
];

export function commandsToContextualMenuItems(
  commandsOrGroup: string[] | string,
  dispatch: (action: AnyAction | TThunkAction) => void,
  redirect: (link: string) => void
): IContextualMenuItem[] {
  const commands = typeof commandsOrGroup === 'string'
    ? uiCommands.filter( uic => uic.group === commandsOrGroup ).map( uic => uic.command )
    : commandsOrGroup;

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
  dispatch?: (action: AnyAction | TThunkAction) => void
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
