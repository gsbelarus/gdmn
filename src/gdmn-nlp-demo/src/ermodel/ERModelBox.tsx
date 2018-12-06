import React, { Component } from "react";
import "./ERModelBox.css";
import { Spinner, SpinnerSize, TextField, Checkbox, ChoiceGroup, IChoiceGroupOption, Slider, SpinButton } from "office-ui-fabric-react";
import { ERModel } from "gdmn-orm";

export interface IERModelBoxProps {
  loading: boolean;
  erModel?: ERModel;
};

export interface IERModelBoxState {
  text: string;
  searchInEntity: boolean;
  searchInAttribute: boolean;
  viewMode: 'S' | 'L';
  maxCount: number;
};

export class ERModelBox extends Component<IERModelBoxProps, {}> {

  state: IERModelBoxState = {
    text: '',
    searchInEntity: true,
    searchInAttribute: true,
    viewMode: 'L',
    maxCount: 200
  }

  render () {
    const { loading, erModel } = this.props;

    if (loading) {
      return (
        <Spinner size={SpinnerSize.large} label="Loading ER model..." ariaLive="assertive" />
      );
    }

    const { text, searchInEntity, searchInAttribute, viewMode, maxCount } = this.state;

    const filtered = erModel && Object.entries(erModel.entities).filter(
      ([name, entity]) => {
        if (!text) {
          return true;
        }

        const upText = text.toUpperCase();
        const desc = entity.lName.ru ? entity.lName.ru.name: name;
        const res = !searchInEntity
          || name.toUpperCase().indexOf(text) > -1
          || desc.toUpperCase().indexOf(text) > -1;

        if (res && searchInAttribute) {
          return Object.entries(entity.attributes).reduce(
            (prev, [name, attr]) => {
              const attrDesc = attr.lName.ru ? attr.lName.ru.name: name;
              return prev && name.toUpperCase().indexOf(upText) > -1
                || attrDesc.toUpperCase().indexOf(upText) > -1
                || attr.inspectDataType().toUpperCase().indexOf(upText) > -1;
            },
            true
          );
        }

        return res;
      }
    ).slice(0, maxCount).map( ([name, entity]) =>
      <div key={name} className="Entity">
        <div>{name}</div>
        <div>{entity.lName.ru ? entity.lName.ru.name: name}</div>
        {
          viewMode === 'S'
          ? undefined
          : Object.entries(entity.attributes).map( ([attrName, attr], idx) => {
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
    );

    return(
      <div>
        <div className="ERModelSearch">
          <TextField
            label="Word"
            style={{maxWidth: '200px'}}
            value={text}
            onChange={ (e: React.ChangeEvent<HTMLInputElement>) => {
              this.setState({ text: e.target.value });
            }}
          />
          <Checkbox label="Entity" checked={searchInEntity} onChange={ (_ev: React.FormEvent<HTMLElement>, isChecked: boolean) => {
              this.setState({ searchInEntity: isChecked })
            }}
          />
          <Checkbox label="Attribute" checked={searchInAttribute} onChange={ (_ev: React.FormEvent<HTMLElement>, isChecked: boolean) => {
              this.setState({ searchInAttribute: isChecked })
            }}
          />
          <ChoiceGroup
            className="ViewMode"
            styles={{
              flexContainer: {
                display: 'flex',
                flexDirection: 'row'
              }
            }}
            selectedKey={viewMode}
            options={[
              {
                key: 'S',
                text: 'Small '
              } as IChoiceGroupOption,
              {
                key: 'L',
                text: 'Large '
              }
            ]}
            onChange={(ev: React.FormEvent<HTMLInputElement>, option: IChoiceGroupOption): void => {
              this.setState({ viewMode: option.key })
            }}
            label="View"
          />
          {
            erModel &&
            <TextField
              label="Max:"
              style={{maxWidth: '100px'}}
              value={maxCount.toString()}
              onChange={ (e: React.ChangeEvent<HTMLInputElement>) => {
                if (parseInt(e.target.value) > 0) {
                  this.setState({ maxCount: parseInt(e.target.value) });
                }
              }}
            />
          }
          <span>
            Shown: {filtered ? filtered.length : 0}
          </span>
        </div>
        <div className="ERModel">
          {filtered}
        </div>
      </div>
    );
  }

};