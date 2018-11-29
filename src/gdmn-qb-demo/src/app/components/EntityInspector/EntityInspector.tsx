import React from 'react';
import { EntityList, IEntityListMessage } from './EntityList';
import { ITreeNode } from './EntityTreeView';
import './index.css';
import { ReactTree } from './ReactTree';

interface IProps {
  list: string[];
  treeData?: ITreeNode;
  statusMessage: IEntityListMessage;
  onLoadMockEntities: () => void;
  onLoadEntities: () => void;
  onSelectEntity: (id: string, checked: boolean) => void;
  onUnselectEntity: () => void;
  onUpdateNode: (node: any) => void;
  onSelectAttribute: (parentAlias: string, name: string, checked: boolean) => void;
}

interface IState {
  filterText: string;
}

export class EntityInspector extends React.PureComponent<IProps, IState> {
  public render() {
    const { treeData } = this.props;
    return (
      <div className="left-box-container">
        <div className="qb-logo">GDMN: Query Builder</div>
        {treeData ? (
          <ReactTree
            data={treeData}
            onUpdate={this.props.onUpdateNode}
            onClear={this.props.onUnselectEntity}
            onSelectAttribute={this.props.onSelectAttribute}
          />
        ) : (
          // <EntityTreeView
          //   data={this.props.treeData}
          //   onClear={this.props.onUnselectEntity}
          //   onSelectAttribute={this.props.onSelectAttribute}
          // />
          <EntityList
            list={this.props.list}
            statusMessage={this.props.statusMessage}
            onSelectEntity={this.props.onSelectEntity}
            onLoadMockEntities={this.props.onLoadMockEntities}
            onLoadEntities={this.props.onLoadEntities}
          />
        )}
      </div>
    );
  }
}
