import { useState, useRef } from "react";
import { Dialog, DialogType, DialogFooter, PrimaryButton, ContextualMenu, DefaultButton, Icon, Stack } from "office-ui-fabric-react";
import React from "react";
import { Frame } from "@src/app/scenes/gdmn/components/Frame";

type MBType = 'MB_OK'| 'MB_OKCANCEL' | 'MB_YESNO' | 'MB_YESNOCANCEL' | 'MB_ABORTRETRY' | 'MB_ABORTRETRYIGNORE';
type MBIcon = 'Information' | 'Warning' | 'Error' | 'Attention' | 'Question';
type MBResult = 'OK' | 'CANCEL' | 'YES' | 'NO' | 'ABORT' | 'RETRY' | 'IGNORE';

interface IMessageBoxProps { };

interface IMessageBoxParams {
  message: string;
  title?: string;
  icon?: MBIcon;
  type?: MBType;
  defButton?: number;
  code?: boolean;
};

type MessageBoxComponent = (props: IMessageBoxProps) => JSX.Element | null;
type MessageBoxFunc = (msgBoxParams: IMessageBoxParams | string) => Promise<MBResult>;
type ResolveFunc = (result: MBResult) => void;

const iconNames: { [name: string]: string } = {
  'Information': 'Info',
  'Warning': 'Warning',
  'Error': 'ErrorBadge',
  'Attention': 'IncidentTriangle'
};

const maxLineLength = 80;

export const useMessageBox = (): [MessageBoxComponent, MessageBoxFunc] => {

  const [params, setParams] = useState<IMessageBoxParams | undefined>();
  const resolve = useRef<ResolveFunc | undefined>();

  const getOnClick = (result: MBResult) => () => { setParams(undefined); if (resolve.current) resolve.current(result); };
  const getButton = (text: string, result: MBResult = 'OK', n: number = 0) => params && ((params.defButton === undefined && !n) || params.defButton === n)
    ? <PrimaryButton onClick={getOnClick(result)} text={text}/>
    : <DefaultButton onClick={getOnClick(result)} text={text}/>;
  const getIconName = () => params && params.icon && (iconNames[params.icon] || 'StatusCircleQuestionMark');

  let message: JSX.Element | null = null;
  let maxLen = 0;

  if (params) {
    if (params.code) {
      message =
        <Frame border>
          <pre>
            {params.message}
          </pre>
        </Frame>
    }
    else if (params.message.length > maxLineLength) {
      const divided = params.message.split(' ');
      const arr: string[] = [''];
      for (const w of divided) {
        const l = arr[arr.length - 1].length;
        if ((l + w.length) > maxLineLength) {
          if (l > maxLen) {
            maxLen = l;
          }
          arr.push(w);
        } else {
          arr[arr.length - 1] = arr[arr.length - 1] + ' ' + w;
        }
      }
      message = <Stack>{arr.map( l => <Stack.Item>{l}</Stack.Item> )}</Stack>;
    }
    else {
      message = <span>{params.message}</span>;
    }
  }

  const MessageBox = (props: IMessageBoxProps) => {
    return params
      ?
        <Dialog
          hidden={false}
          dialogContentProps={{
            type: DialogType.normal,
            title: params.title
              ? params.title
              : params.icon
              ? params.icon
              : 'Information',
          }}
          modalProps={{
            isBlocking: true,
            dragOptions: {
              moveMenuItemText: 'Move',
              closeMenuItemText: 'Close',
              menu: ContextualMenu
            },
          }}
          minWidth={params.code ? '680px' : maxLen > 35 ? '616px' : undefined}
        >
          {
            params && params.icon
            ?
              <Stack horizontal disableShrink verticalAlign="start">
                <Icon iconName={getIconName()} styles={{ root: { fontSize: '32px', marginRight: '16px' }}} />
                {message}
              </Stack>
            : message
          }
          {
            params.type === undefined || params.type === 'MB_OK'
            ?
              <DialogFooter>
                {getButton('Ok')}
              </DialogFooter>
            : params.type === 'MB_OKCANCEL'
            ? <DialogFooter>
                {getButton('Ok')}
                {getButton('Cancel', 'CANCEL', 1)}
              </DialogFooter>
            : params.type === 'MB_YESNO'
            ? <DialogFooter>
                {getButton('Yes', 'YES')}
                {getButton('No', 'NO', 1)}
              </DialogFooter>
            : params.type === 'MB_YESNOCANCEL'
            ? <DialogFooter>
                {getButton('Yes', 'YES')}
                {getButton('No', 'NO', 1)}
                {getButton('Cancel', 'CANCEL', 2)}
              </DialogFooter>
            : params.type === 'MB_ABORTRETRY'
            ? <DialogFooter>
                {getButton('Abort', 'ABORT')}
                {getButton('Retry', 'RETRY', 1)}
              </DialogFooter>
            : <DialogFooter>
                {getButton('Abort', 'ABORT')}
                {getButton('Retry', 'RETRY', 1)}
                {getButton('Ignore', 'IGNORE', 2)}
              </DialogFooter>
          }
        </Dialog>
      : null;
  };

  const messageBox: MessageBoxFunc = msgBoxParams => {
    if (typeof msgBoxParams === 'string') {
      setParams({ message: msgBoxParams });
    } else {
      setParams(msgBoxParams);
    }
    return new Promise( res => resolve.current = res );
  };

  return [MessageBox, messageBox];
};
