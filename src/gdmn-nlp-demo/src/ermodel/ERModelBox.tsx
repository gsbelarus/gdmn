import React, { Component } from "react";
import "./ERModelBox.css";
import { Spinner, SpinnerSize, TextField, Checkbox, ChoiceGroup, IChoiceGroupOption, PrimaryButton } from "office-ui-fabric-react";
import { ERModel, Entity } from "gdmn-orm";

export interface IERModelBoxProps {
  loading: boolean;
  erModel?: ERModel;
};

export interface IERModelBoxState {
  erModel?: ERModel;
  text: string;
  searchInEntity: boolean;
  searchInAttribute: boolean;
  viewMode: 'S' | 'L';
  maxCount: number;
  foundEntities: Entity[];
  filtering: boolean;
};

export class ERModelBox extends Component<IERModelBoxProps, {}> {

  state: IERModelBoxState = {
    text: '',
    searchInEntity: true,
    searchInAttribute: true,
    viewMode: 'L',
    maxCount: 40,
    foundEntities: [],
    filtering: false
  }

  static getDerivedStateFromProps(props, state) {
    if (state.erModel !== props.erModel) {
      return {
        ...state,
        erModel: props.erModel,
        text: '',
        foundEntities: [],
        filtering: false
      }
    }

    return state;
  }

  componentDidUpdate() {
    const { erModel } = this.props;
    const { text, searchInEntity, searchInAttribute, maxCount, filtering } = this.state;

    if (!filtering || !erModel) {
      return;
    }

    const foundEntities = Object.entries(erModel.entities).reduce(
      (prev, [_name, entity]) => {
        if (prev.length >= maxCount) {
          return prev;
        }

        if (!text) {
          prev.push(entity);
        } else {
          let res = false;
          const upText = text.toUpperCase();

          if (searchInEntity) {
            const desc = entity.lName.ru ? entity.lName.ru.name : entity.name;
            res = entity.name.toUpperCase().indexOf(upText) > -1 || desc.toUpperCase().indexOf(upText) > -1;
          }

          if (searchInAttribute && (res || !searchInEntity)) {
            res = (Object.entries(entity.attributes).some(
              ([_name, attr]) => {
                const attrDesc = attr.lName.ru ? attr.lName.ru.name : attr.name;
                return attr.name.toUpperCase().indexOf(upText) > -1
                  || attrDesc.toUpperCase().indexOf(upText) > -1
                  || attr.inspectDataType().toUpperCase().indexOf(upText) > -1;
              }
            ));
          }

          if (res) {
            prev.push(entity);
          }
        }

        return prev;
      },
      [] as Entity[]
    );

    this.setState({
      foundEntities,
      filtering: false
    });
  }

  render () {
    const { loading, erModel } = this.props;

    if (loading) {
      return (
        <Spinner size={SpinnerSize.large} label="Loading ER model..." ariaLive="assertive" />
      );
    }

    const { text, searchInEntity, searchInAttribute, viewMode, maxCount, foundEntities, filtering } = this.state;

    const entities = foundEntities.map( entity =>
      <div key={entity.name} className="Entity">
        <div>{entity.name}</div>
        <div>{entity.lName.ru ? entity.lName.ru.name: entity.name}</div>
        {
          viewMode === 'S'
          ? undefined
          : Object.entries(entity.attributes).map( ([_attrName, attr], idx) => {
              const desc = attr.lName.ru ? attr.lName.ru.name : attr.name;
              return (
                <div key={attr.name} className={'Attr' + (idx % 2 === 0 ? ' OddRow' : '')}>
                  <span className={'AttrName' + (attr.name.length > 20 ? ' SmallText' : '')}>
                    {entity.pk.find( pk => pk.name === attr.name ) ? <strong>{attr.name}*</strong> : attr.name}
                  </span>
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
            label="Search for:"
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
          />
          {
            erModel &&
            <TextField
              label="Show max:"
              style={{maxWidth: '60px'}}
              value={maxCount.toString()}
              onChange={ (e: React.ChangeEvent<HTMLInputElement>) => {
                if (parseInt(e.target.value) > 0) {
                  this.setState({ maxCount: parseInt(e.target.value) });
                }
              }}
            />
          }
          <PrimaryButton
            text="Filter"
            disabled={filtering}
            onClick={ () => this.setState({ foundEntities: [], filtering: true })}
          />
          {entities && entities.length ? <span>Shown: {entities.length}</span> : undefined}
          {erModel ? <span>ER Model: {Object.entries(erModel.entities).length}</span> : undefined}
        </div>
        <div className="ERModel">
          {entities}
        </div>
      </div>
    );
  }

};