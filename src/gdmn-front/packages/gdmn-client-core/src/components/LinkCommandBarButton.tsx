import {
  IComponentAsProps,
  ICommandBarItemProps,
  BaseComponent,
  CommandBarButton,
  IButtonProps
} from 'office-ui-fabric-react';
import React from 'react';
import { NavLink } from 'react-router-dom';

export interface ILinkCommandBarButtonProps extends IComponentAsProps<ICommandBarItemProps> {
  link: string;
  supText?: string;
}

export class LinkCommandBarButton extends BaseComponent<ILinkCommandBarButtonProps> {
  public render(): JSX.Element {
    const { defaultRender: DefaultRender = CommandBarButton, link, supText, ...buttonProps } = this.props;

    const onRenderText = supText
      ? (props: IButtonProps) => (
          <>
            {props.text}
            <sup>{supText}</sup>
          </>
        )
      : undefined;

    return (
      <NavLink to={link}>
        <DefaultRender {...buttonProps} onRenderText={onRenderText} />
      </NavLink>
    );
  }
}
