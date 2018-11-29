// @ts-ignore
import Checkbox from '@trendmicro/react-checkbox';
import React from 'react';
// @ts-ignore
import InfiniteTree from 'react-infinite-tree';
import styled from 'styled-components';
import { ITreeNode } from './EntityTreeView';
import { Filter } from './Filter';

interface IProps {
  data: ITreeNode;
  onUpdate: (node: any) => void;
  onClear: () => void;
  onSelectAttribute: (parentAlias: string, name: string, checked: boolean) => void;
}

interface IState {
  filterText: string;
}

interface ITree {
  loadData: (data: any) => void;
  selectNode: (data: any) => void;
  getChildNodes: () => object[];
}

export class ReactTree extends React.PureComponent<IProps, IState> {
  public state: Readonly<IState> = {
    filterText: ''
  };

  private tree: ITree | null = null;

  private loadTree() {
    if (!this.tree) return;
    this.tree.loadData(this.props.data);
    // Select the first node
    this.tree.selectNode(this.tree.getChildNodes()[0]);
  }

  public componentDidUpdate() {
    this.loadTree();
  }

  public componentDidMount() {
    this.loadTree();
  }

  public handleFilterChange = () => {
    return;
  };

  public handleFilterClear = () => {
    return;
  };

  public render() {
    const { data, onUpdate } = this.props;
    return (
      <div className="component-container">
        <div className="entity-name">
          <span>{data.name}</span>
          <button className="filter-clear" onClick={this.props.onClear}>
            <i className="fas fa-times"/>
          </button>
        </div>
        <Filter
          value={this.state.filterText}
          onChangeFilter={this.handleFilterChange}
          onClearFilter={this.handleFilterClear}
        />
        <InfiniteTree
          className="entity-list"
          width="100%"
          height={600}
          rowHeight={28}
          autoOpen={true}
          data={this.props.data}
          ref={(infiniteTree: any) => {
            if (infiniteTree !== null) {
              this.tree = infiniteTree.tree;
            }
          }}
        >
          {({ node, tree }: any) => {
            // Determine the toggle state
            let toggleState = '';
            const hasChildren = node.hasChildren();

            if ((!hasChildren && node.loadOnDemand) || (hasChildren && !node.state.open)) {
              toggleState = 'closed';
            }
            if (hasChildren && node.state.open) {
              toggleState = 'opened';
            }

            return renderTreeNode({ node, tree, toggleState, onUpdate });
          }}
        </InfiniteTree>
      </div>
    );
  }
}

const renderTreeNode = ({ node, tree, toggleState, onUpdate }: any) => (
  <TreeNode
    className="entity-item"
    {...{ selected: node.state.selected, depth: node.state.depth }}
    onClick={(event: any) => {
      tree.selectNode(node);
    }}
  >
    <Toggler
      state={toggleState}
      onClick={() => {
        if (toggleState === 'closed') {
          tree.openNode(node);
        } else if (toggleState === 'opened') {
          tree.closeNode(node);
        }
      }}
    />
    <Checkbox
      className="checkmark"
      checked={node.state.checked}
      indeterminate={node.state.indeterminate}
      onClick={(event: any) => {
        event.stopPropagation();
      }}
      onChange={(event: any) => {
        // tree.checkNode(node);
        onUpdate(node);
      }}
    />
    <span>{node.name}</span>
  </TreeNode>
);

const defaultRowHeight = 20;

const TreeNode = ({ selected, depth, ...divProps }: any) => (
  <div
    className="tree-node"
    style={{
      cursor: 'default',
      position: 'relative',
      lineHeight: `${defaultRowHeight}px`,
      background: selected ? '#deecfd' : 'transparent',
      border: selected ? '1px solid #06c' : '1px solid transparent',
      paddingLeft: `${depth * 20}px`
    }}
    {...divProps}
  />
);

const Toggler = styled(({ state, ...props }: any) => (
  <a {...props}>
    {state === 'closed' && <i className="fa fa-fw fa-chevron-right"/>}
    {state === 'opened' && <i className="fa fa-fw fa-chevron-down"/>}
  </a>
))`
  color: #333;
  display: inline-block;
  text-align: center;
  margin-right: 2px;
`;
