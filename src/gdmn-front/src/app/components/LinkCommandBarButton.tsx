import {
  BaseComponent,
  CommandBarButton,
  IButtonProps,
  ICommandBarItemProps,
  IComponentAsProps
} from 'office-ui-fabric-react';
import React from 'react';
import { Link } from 'react-router-dom';

export interface ILinkCommandBarButtonProps extends IComponentAsProps<ICommandBarItemProps> {
  link: string;
  supText?: string;
}

export class LinkCommandBarButton extends BaseComponent<ILinkCommandBarButtonProps> {
  public render(): JSX.Element {
    const { defaultRender, link, supText, ...buttonProps } = this.props;

    const onRenderText = supText ? (props: IButtonProps) => <>{props.text}<sup>{supText}</sup></> : undefined;
    const DefaultRender = defaultRender ? defaultRender as any : CommandBarButton;

    const render = (
      <DefaultRender {...buttonProps} onRenderText={onRenderText}/>
    );
    if (buttonProps.disabled) {
      return render;
    } else {
      return (
        <Link to={link}>
          {render}
        </Link>
      );
    }
  }
}
