import React from "react";
import "./ERModelBox.css";
import { TextField, Checkbox, ChoiceGroup, IChoiceGroupOption, PrimaryButton } from "office-ui-fabric-react";
import { ERModel, Entity } from "gdmn-orm";
import { IViewProps, View } from "@src/app/components/View";

export interface IERModelBoxProps extends IViewProps<any> {
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

export class ERModelBox extends View<IERModelBoxProps, IERModelBoxState> {

  state: IERModelBoxState = {
    text: '',
    searchInEntity: true,
    searchInAttribute: true,
    viewMode: 'L',
    maxCount: 40,
    foundEntities: [],
    filtering: false
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

  public getViewHeaderHeight() {
    return 84;
  }

  render () {
    const { erModel } = this.props;

    if (!erModel) {
      return this.renderLoading();
    }

    const getInheritanceSeq = (e: Entity, prev = ''): string => e.parent ? getInheritanceSeq(e.parent, `${prev} -> ${e.parent.name}`) : prev;

    const { text, searchInEntity, searchInAttribute, viewMode, maxCount, foundEntities, filtering } = this.state;

    const entities = foundEntities.map( entity =>
      <div key={entity.name} className="Entity">
        <div>{entity.name}{getInheritanceSeq(entity)}</div>
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

    return this.renderWide(
      <div className="ERModelSearch">
        <TextField
          label="Search for:"
          style={{maxWidth: '200px'}}
          value={text}
          onChange={ (_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
            if (newValue !== undefined) {
              this.setState({ text: newValue });
            }
          }}
        />
        <Checkbox label="Entity" checked={searchInEntity} onChange={ (_ev?: React.FormEvent<HTMLElement>, isChecked?: boolean) => {
            this.setState({ searchInEntity: !!isChecked })
          }}
        />
        <Checkbox label="Attribute" checked={searchInAttribute} onChange={ (_ev?: React.FormEvent<HTMLElement>, isChecked?: boolean) => {
            this.setState({ searchInAttribute: !!isChecked })
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
          onChange={(ev?: React.FormEvent<HTMLElement>, option?: IChoiceGroupOption): void => {
            if (option && option.key === 'S') {
              this.setState({ viewMode: 'S' });
            } else {
              this.setState({ viewMode: 'L' });
            }
          }}
        />
        {
          erModel &&
          <TextField
            label="Show max:"
            style={{maxWidth: '60px'}}
            value={maxCount.toString()}
            onChange={ (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
              if (newValue !== undefined) {
                if (parseInt(newValue) > 0) {
                  this.setState({ maxCount: parseInt(newValue) });
                }
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
      </div>,
      <div className="ERModel">
        {entities}
      </div>
    );
  }
}