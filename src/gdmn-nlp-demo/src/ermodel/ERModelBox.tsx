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
        <div>
          Search panel...
        </div>
        <div className="ERModel">
          {
            erModel && Object.entries(erModel.entities).slice(0, 100).map( ([name, entity]) =>
              <div key={name} className="Entity">
                <div>{name}</div>
                <div>{entity.lName.ru ? entity.lName.ru.name: name}</div>
                {
                  Object.entries(entity.attributes).map( ([attrName, attr], idx) => {
                    const desc = attr.lName.ru ? attr.lName.ru.name : name;
                    return (
                      <div className={'Attr' + (idx % 2 === 0 ? ' OddRow' : '')}>
                        <span className={'AttrName' + (attrName.length > 20 ? ' SmallText' : '')}>{attrName}</span>
                        <span className={'AttrDesc' + (desc.length > 20 ? ' SmallText' : '')}>{desc}</span>
                        <span className="AttrType">{attr.inspectDataType()}</span>
                      </div>
                    );
                  })
                }
              </div>
            )
          }
        </div>
      </div>
    );
  }

};