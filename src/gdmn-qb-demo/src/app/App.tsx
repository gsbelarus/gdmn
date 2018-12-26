import { Attribute, Entity, EntityAttribute, EntityLink, EntityQueryField, ERModel } from 'gdmn-orm';
import React from 'react';
import { entityAPI } from '../app/api/entity';
import './App.css';
import { AttributeBox, EntityInspector, IEntityListMessage, ITreeNode } from './components';

interface IState {
  statusMessage: IEntityListMessage;
  erModel?: ERModel;
  attributeList: EntityQueryField[];
  entityLink?: EntityLink;
  treeData?: ITreeNode;
}

export class App extends React.PureComponent<any, IState> {
  public state: Readonly<IState> = {
    statusMessage: {},
    entityLink: undefined,
    treeData: undefined,
    attributeList: []
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

    const treeChildren: ITreeNode[] = Object.values(entityLink.entity.attributes).map((attr: Attribute) => {
      const attrList = Object.values(entityLink.fields);

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

    const entityLink: EntityLink = new EntityLink(newEntity, '', []);

    this.setState({ entityLink }, this.updateTreeData);
  };

  private handleUpdateNode = (node: ITreeNode) => {
    if (!node.parent) return;
    console.log('click node', node.parent.name, node.id);

    const { entityLink, erModel } = this.state;
    if (!entityLink || !erModel) return;

    if (node.state.checked) {
      entityLink.fields.splice(entityLink.fields.findIndex(i => i.attribute.name === node.name), 1);
    } else {
      const newField = new EntityQueryField(erModel.entities[node.parent.name].attributes[node.name]);
      entityLink.fields.push(newField);
    }

    this.setState(
      { attributeList: entityLink.fields },
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
    const { entityLink } = this.state;
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
          {entityLink ? (
            <AttributeBox
              list={entityLink.fields.map(i => ({
                expression: { entityName: entityLink.entity.name, fieldName: i.attribute.name }
              }))}
            />
          ) : null}
          {/* <FilterBox /> */}
        </main>
      </div>
    );
  }
}
