import React from 'react';
import { ReactTree } from '@src/app/components/EntityInspector/ReactTree';
import { EntityList, IEnityListMessage } from '@src/app/components/EntityInspector/EntityList';
import { EntityTreeView, ITreeNode } from '@src/app/components/EntityInspector/EntityTreeView';

export { ITreeNode, IEnityListMessage };

import './index.css';

interface IProps {
  list: string[];
  treeData?: ITreeNode;
  statusMessage: IEnityListMessage;
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
