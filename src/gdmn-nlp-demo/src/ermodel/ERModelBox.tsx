import React, { Component } from "react";
import "./ERModelBox.css";
import { Spinner, SpinnerSize, TextField } from "office-ui-fabric-react";
import { ERModel } from "gdmn-orm";

export interface IERModelBoxProps {
  loading: boolean;
  erModel?: ERModel;
};

export interface IERModelBoxState {
  text: string;
};

export class ERModelBox extends Component<IERModelBoxProps, {}> {

  state: IERModelBoxState = {
    text: ''
  }

  render () {
    const { loading, erModel } = this.props;

    if (loading) {
      return (
        <Spinner size={SpinnerSize.large} label="Loading ER model..." ariaLive="assertive" />
      );
    }

    const { text } = this.state;

    return(
      <div>
        <div className="ERModelSearch">
          <TextField
            label="Word"
            style={{maxWidth: '200px'}}
            value={text}
            onChange={ (e: React.ChangeEvent<HTMLInputElement>) => {
              this.setState({ text: e.target.value });
            }
          }
          />
        </div>
        <div className="ERModel">
          {
            erModel && Object.entries(erModel.entities).filter(
              ([name, entity]) => {
                const desc = entity.lName.ru ? entity.lName.ru.name: name;
                return !text
                  || name.toUpperCase().indexOf(text.toUpperCase()) > -1
                  || desc.toUpperCase().indexOf(text.toUpperCase()) > -1;
              }
            ).slice(0, 100).map( ([name, entity]) =>
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