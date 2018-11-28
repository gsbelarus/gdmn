import React, { Children } from 'react';
import { entityAPI } from '@src/app/api/entity';
import {
  EntityLink,
  EntityQuery,
  Entity,
  Attribute,
  ERModel,
  EntityQueryField,
  EntityAttribute,
  SetAttribute,
  DetailAttribute,
  ParentAttribute
} from 'gdmn-orm';
import { EntityInspector, ITreeNode, FilterBox, AttributeBox, IEnityListMessage } from '@src/app/components';
import './App.css';

interface IState {
  statusMessage: IEnityListMessage;
  erModel?: ERModel;
  attributeList: EntityQueryField[];
  entityLink?: EntityLink;
  treeData?: ITreeNode;
}

export class App extends React.PureComponent<any, IState> {
  public state: Readonly<IState> = {
    statusMessage: {},
    attributeList: [],
    entityLink: undefined,
    treeData: undefined
  };

  public componentDidMount() {
    this.handleLoadMockEntities();
  }

  private updateTreeData = (): void => {
    const { erModel, entityLink } = this.state;

    if (!erModel || !entityLink) {
      // Нет ER-модели => дерево пустое
      this.setState({ treeData: undefined });
      return;
    }

    /*     if (!entityLink) {
      // Нет entityLink => дерево из списка enteties
      const entityList = Object.values(erModel.entities).map((i: Entity) => i.name);
      this.setState({ treeData: undefined, entityList });
      const treeEntities: ITreeNode[] = Object.values(erModel.entities).map((i: Entity) => {
        return {
          id: i.name,
          name: i.name
        };
      });
      this.setState({ treeData: { id: 'Entities', name: 'Entities', children: treeEntities } });
      return;
    } */

    const treeChildren: ITreeNode[] = Object.values(entityLink.entity.attributes).map((attr: Attribute) => {
      const attrList = Object.values(this.state.attributeList);
      const isChecked = !!attrList.find(i => i.attribute.name === attr.name);
      return {
        id: attr.name,
        name: attr.name,
        children: [],
        state: {
          checked: isChecked
        },
        loadOnDemand: attr.type === EntityAttribute.name
      };
    });

    // this.setState({ treeData: data });
    this.setState({
      treeData: {
        id: entityLink.entity.name,
        name: entityLink.entity.name,
        state: { checked: false },
        children: treeChildren
      }
    });

    // entityLink.entity.attributes
    // const attributeList = entityLink.entity.attributes;

    /*   const attributes: ITreeNode[] = Object.values(attributeList).map(attr => {
      const checked = !!this.state.selectedAttributes.find(
        (i: IAttributeFilter) => i.entityAlias === selectedEntity.entityName && i.fieldName === attr.name
      );

      return EntityAttribute.isType(attr) &&
        !SetAttribute.isType(attr) &&
        !ParentAttribute.isType(attr) &&
        !DetailAttribute.isType(attr)
        ? {
            id: attr.name,
            name: attr.name,
            entities: Object.values(attr.entities).map(i => i.name),
            parentAlias: selectedEntity.entityName,
            checked
          }
        : { id: attr.name, name: attr.name, parentAlias: selectedEntity.entityName, checked };
    });

    this.setState({
      treeData: {
        id: selectedEntity.entityName,
        name: selectedEntity.entityName,
        children: attributes,
        parentAlias: ''
      }
    }); */
  };

  private handleLoadMockEntities = () => {
    entityAPI
      .fetchMockData()
      .then(erModel => {
        this.setState(
          {
            statusMessage: { loadingData: false, loadingText: '', loadingError: false },
            erModel
          },
          this.updateTreeData
        );
      })
      .catch(e =>
        this.setState(
          {
            statusMessage: { loadingData: false, loadingText: `Ошибка: ${e.message}`, loadingError: true }
          },
          this.updateTreeData
        )
      );
  };

  private getData = () => {
    entityAPI
      .fetchData()
      .then(erModel => {
        this.setState(
          {
            statusMessage: { loadingData: false, loadingText: '', loadingError: false },
            erModel
          },
          this.updateTreeData
        );
      })
      .catch(e =>
        this.setState(
          {
            statusMessage: { loadingData: false, loadingText: `Ошибка: ${e.message}`, loadingError: true }
          },
          this.updateTreeData
        )
      );
  };

  private handleLoadEntities = () => {
    this.setState(
      {
        statusMessage: { loadingData: true, loadingText: 'Загрузка данных...', loadingError: false }
      },
      this.getData
    );
  };

  private handleSelectEntity = (name: string, checked: boolean) => {
    if (!checked) return;
    // TODO: Обработать чекед\анчекед. убрать handleUnSelectEntity

    const { erModel } = this.state;
    if (!erModel) return;

    const newEntity: Entity = erModel.entities[name];
    if (!newEntity) return;

    const entityLink: EntityLink = new EntityLink(newEntity, '', this.state.attributeList);

    this.setState({ entityLink }, this.updateTreeData);
  };

  private handleUpdateNode = (node: any) => {
    console.log('click node', node);
    // console.log('node.state', node.state);

    if (node.state.checked) {
      this.setState({ attributeList: [...this.state.attributeList] }, this.updateTreeData);
      return ;
    }

    console.log('set checked');

    this.setState(
      { attributeList: this.state.attributeList.filter((i: EntityQueryField) => i.attribute.name !== node.name) },
      this.updateTreeData
    );
  };

  private handleUnSelectEntity = () => {
    if (!this.state.entityLink) return;
    this.setState({ entityLink: undefined }, this.updateTreeData);
  };

  private handleSelectAttribute = (parentAlias: string, name: string, checked: boolean) => {
    // entityLink
    // const attr: IAttributeFilter = { entityAlias: parentAlias, fieldName: name };
    // if (checked) {
    //   this.setState({ selectedAttributes: [...this.state.selectedAttributes, attr] }, this.updateTreeData);
    //   return;
    // }
    // const newList: IAttributeFilter[] = this.state.selectedAttributes.filter(
    //   i => !(i.fieldName === name && i.entityAlias === parentAlias)
    // );
    // this.setState({ selectedAttributes: newList }, this.updateTreeData);
  };

  public render() {
    const list = !!this.state.erModel ? Object.keys(this.state.erModel.entities) : [];
    return (
      <div className="App">
        <main className="application-main" role="main">
          <EntityInspector
            list={list}
            treeData={this.state.treeData}
            statusMessage={this.state.statusMessage}
            onLoadMockEntities={this.handleLoadMockEntities}
            onLoadEntities={this.handleLoadEntities}
            onUpdateNode={this.handleUpdateNode}
            onSelectEntity={this.handleSelectEntity}
            onUnselectEntity={this.handleUnSelectEntity}
            onSelectAttribute={this.handleSelectAttribute}
          />
          <AttributeBox
            list={this.state.attributeList.map(i => ({
              expression: { entityName: i.attribute.name, fieldName: i.attribute.name }
            }))}
          />
          {/* <FilterBox /> */}
        </main>
      </div>
    );
  }
}
