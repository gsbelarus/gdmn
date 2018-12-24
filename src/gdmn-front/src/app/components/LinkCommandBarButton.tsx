import { IComponentAsProps, ICommandBarItemProps, BaseComponent, IButtonProps, CommandBarButton } from "office-ui-fabric-react";
import React from "react";
import { Link } from "react-router-dom";

export interface ILinkCommandBarButtonProps extends IComponentAsProps<ICommandBarItemProps> {
  link: string;
  supText?: string;
}

export class LinkCommandBarButton extends BaseComponent<ILinkCommandBarButtonProps> {
  public render(): JSX.Element {
    const { defaultRender, link, supText, ...buttonProps } = this.props;

    const onRenderText = supText ? (props: IButtonProps) => <>{props.text}<sup>{supText}</sup></> : undefined;
    const DefaultRender = defaultRender ? defaultRender as any : CommandBarButton;

    return (
      <Link to={link}>
        <DefaultRender {...buttonProps} onRenderText={onRenderText} />
      </Link>
    );
  }
}