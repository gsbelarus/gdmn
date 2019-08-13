import { useState, useRef } from "react";
import { Dialog, DialogType, DialogFooter, PrimaryButton, ContextualMenu, DefaultButton, Icon, Stack } from "office-ui-fabric-react";
import React from "react";

type MBType = 'MB_OK'| 'MB_OKCANCEL' | 'MB_YESNO' | 'MB_YESNOCANCEL' | 'MB_ABORTRETRY' | 'MB_ABORTRETRYIGNORE';
type MBIcon = 'Information' | 'Warning' | 'Error' | 'Attention' | 'Question';
type MBResult = 'OK' | 'CANCEL' | 'YES' | 'NO' | 'ABORT' | 'RETRY' | 'IGNORE';

interface IMessageBoxProps {
  children: JSX.Element;
};

interface IMessageBoxParams {
  message: string;
  title?: string;
  icon?: MBIcon;
  type?: MBType;
  defButton?: number;
};

type MessageBoxComponent = (props: IMessageBoxProps) => JSX.Element;
type MessageBoxFunc = (msgBoxParams: IMessageBoxParams | null) => Promise<MBResult>;
type ResolveFunc = (result: MBResult) => void;

export const useMessageBox = (): [MessageBoxComponent, MessageBoxFunc] => {

  const [params, setParams] = useState<IMessageBoxParams | null>(null);
  const resolve = useRef<ResolveFunc | null>(null);

  const getOnClick = (result: MBResult) => () => { setParams(null); if (resolve.current) resolve.current(result); };
  const getButton = (text: string, result: MBResult = 'OK', n: number = 0) => params && ((params.defButton === undefined && !n) || params.defButton === n)
    ? <PrimaryButton onClick={getOnClick(result)} text={text}/>
    : <DefaultButton onClick={getOnClick(result)} text={text}/>;
  const getIconName = () => {
    if (!params || !params.icon) {
      return undefined;
    }

    switch (params.icon) {
      case 'Information':
        return 'Info';

      case 'Warning':
        return 'Warning';

      case 'Error':
        return 'ErrorBadge';

      case 'Attention':
        return 'IncidentTriangle';

      default:
        return 'StatusCircleQuestionMark'
    }
  }

  const MessageBox = (props: IMessageBoxProps) => {
    return params
      ? <>
          <Dialog
            hidden={false}
            dialogContentProps={{
              type: DialogType.normal,
              title: params.title
                ? params.title
                : params.icon
                ? params.icon
                : 'Information'
            }}
            modalProps={{
              isBlocking: true,
              dragOptions: {
                moveMenuItemText: 'Move',
                closeMenuItemText: 'Close',
                menu: ContextualMenu
              }
            }}
          >
            {
              params && params.icon
              ?
                <Stack horizontal disableShrink verticalAlign="start">
                  <Icon iconName={getIconName()} styles={{ root: { fontSize: '32px', marginRight: '16px' }}} />
                  {params.message}
                </Stack>
              : params.message
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
          {props.children}
        </>
      : props.children;
  };

  const messageBox: MessageBoxFunc = msgBoxParams => {
    setParams(msgBoxParams);
    return new Promise( res => resolve.current = res );
  };

  return [MessageBox, messageBox];
};
