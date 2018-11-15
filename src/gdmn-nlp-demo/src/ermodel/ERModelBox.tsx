import React, { Component } from "react";
import "./ERModelBox.css";
import { Spinner, SpinnerSize } from "office-ui-fabric-react";
import { ERModel } from "gdmn-orm";

export interface IERModelBoxProps {
  loading: boolean;
  erModel?: ERModel;
};

export class ERModelBox extends Component<IERModelBoxProps, {}> {

  render () {
    const { loading, erModel } = this.props;

    if (loading) {
      return (
        <Spinner size={SpinnerSize.large} label="Loading ER model..." ariaLive="assertive" />
      );
    }

    return(
      <div>
        {erModel ? `Loaded entities: ${Object.entries(erModel.entities).length}` : undefined}
      </div>
    );
  }

};