import React, { Component } from 'react';
import CSSModules from 'react-css-modules';
import { Avatar, CardContent, Icon, Typography } from '@material-ui/core';

import styles from './IconEmptyView.css';

interface IIconEmptyView {
  muiIconName: string;
  title?: string;
  subtitle?: string;

  style?: any; // todo
}

@CSSModules(styles)
class IconEmptyView extends Component<IIconEmptyView> {
  public render() {
    const { style, muiIconName, title, subtitle } = this.props;

    return (
      <CardContent styleName="centered" style={style}>
        <Avatar styleName="avatar">
          <Icon styleName="icon">{muiIconName}</Icon>
        </Avatar>
        {title && (
          <Typography styleName="text" color="textSecondary" variant="button">
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography styleName="text" color="textSecondary" variant="subheading">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    );
  }
}

export { IconEmptyView, IIconEmptyView };
