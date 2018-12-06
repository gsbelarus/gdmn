import { BaseComponent, IContextualMenuItem } from 'office-ui-fabric-react';
import React from 'react';
import { NavLink } from 'react-router-dom';

export interface IContextualMenuItemWithLink extends IContextualMenuItem {
  link?: string;
  supText?: string;
}

export class ContextualMenuItemWithLink extends BaseComponent<IContextualMenuItemWithLink> {
  public render(): JSX.Element {
    const { defaultRender: DefaultRender, link, supText, ...buttonProps } = this.props;

    const onRenderText = supText
      ? (props: IContextualMenuItem) => (
          <>
            {props.text}
            <sup>{supText}</sup>
          </>
        )
      : undefined;

    if (link) {
      return (
        <NavLink to={link}>
          <DefaultRender {...buttonProps} onRenderText={onRenderText} />
        </NavLink>
      );
    } else {
      return <DefaultRender {...buttonProps} onRenderText={onRenderText} />;
    }
  }
}
