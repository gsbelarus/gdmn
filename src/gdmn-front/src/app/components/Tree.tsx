import React, { useState } from 'react';
import { Stack, Icon, getTheme } from 'office-ui-fabric-react';
import { RecordSet } from 'gdmn-recordset';
import { node } from 'prop-types';

interface INode {
  id: string;
  parent?: string;
  value: string;
  rollUp?: boolean;
  children: string[];
}

interface ITreeProps {
  rs: RecordSet;
  load: () => void;
  selectNode: (value: string) => void;
  loadedAll: boolean;
}

interface INodeProps {
  node: INode,
  onClick: (value: string) => void;
  level: (children: string[], isRoot: boolean, onClick: (value: string) => void) => JSX.Element;
  isLast: boolean;
  isRoot?: boolean;
  iconLoad?: JSX.Element;
  selected?: string;
  onSelectNode: (id: string) => void;
}

const Node = (props: INodeProps) => {
  const [rollUp, setRollUp] = useState(props.node.rollUp ? props.node.rollUp : false);

  return (
    <Stack>
      <Stack
        horizontal
        verticalAlign="center" 
        styles={{root: {margin: '5px', cursor: 'pointer', background: props.selected === props.node.id ? getTheme().palette.themeTertiary : undefined}}}
      >
        {
          props.isLast
          ? props.iconLoad
          : (rollUp !== undefined && !rollUp)
            ? <Icon
            iconName="ChevronRight"
            onClick={() => setRollUp(!rollUp)}
            style={{
              fontSize: '10px'
            }}
          />
            : <Icon
            iconName="ChevronDown"
            onClick={() => setRollUp(!rollUp)}
            style={{
              fontSize: '10px'
            }}
          />
        }
        <div
          style={{marginLeft: '5px'}}
          onClick={() => {
            props.onSelectNode(props.node.id);
            props.onClick(props.node.id);
          }}
        >
          {props.node.value}
        </div>
        </Stack>
        {
          !(rollUp !== undefined && !rollUp)
          ? <div>{props.level(props.node.children, props.isRoot ? props.isRoot : false, props.onClick)}</div>
          : undefined
        }
    </Stack>
  )
}

export const Tree = (props: ITreeProps) => {
  
  const root = {id: props.rs.name, value: props.rs.name, rollUp: true, children: []}
  const nodes: INode[] = [root];

  const count = props.rs.size;
  const childRoot = [] as string[];
  const fdID = props.rs.params.fieldDefs.find(fd => fd.caption === 'ID')
  const fdNAME = props.rs.params.fieldDefs.find(fd => fd.caption === 'NAME')
  const fdUSRNAME = props.rs.params.fieldDefs.find(fd => fd.caption === 'USR$NAME')
  const fdPARENT = props.rs.params.fieldDefs.find(fd => fd.caption === 'PARENT.ID')
  const [selectedNode, setSelectedNode] = useState<string | undefined>();

  for(let i = 0; i < count; i++) {
    const parent = fdPARENT ? props.rs.getString(fdPARENT.fieldName, i) : undefined;
    const findIDParent = fdID ? props.rs.getString(fdID.fieldName, i) : undefined;
    if(!parent && findIDParent) {
      childRoot.push(findIDParent)
    }
    if(findIDParent && (fdNAME || fdUSRNAME)) {
      nodes.push({
          id: findIDParent, 
          value: fdNAME ? props.rs.getString(fdNAME.fieldName, i) : props.rs.getString(fdUSRNAME!.fieldName, i), 
          parent: parent ? parent : props.rs.name
        } as INode)
    }
  }
  const withoutParent = nodes.filter(node => node.parent ? nodes.find(item => item.id === node.parent) === undefined : false)
  nodes.map( (node, idx) => {
    return nodes[idx].children = nodes.filter( curr => curr.parent && curr.parent === node.id).map(item => item.id);
  })

  const level = (children: string[], isRoot: boolean, onClick: (value: string) => void) => {
    const nodeInLevel = nodes.filter( curr => children.find(child => child === curr.id));
    return (
      <div style={{ marginLeft: '25px' }} >
        {
          nodeInLevel.map( node => {
            return (
              <Node
                key={`node-${node.id}`}
                onClick={props.selectNode}
                node={node}
                level={level}
                isLast={node.children.length === 0}
                selected={selectedNode}
                onSelectNode={setSelectedNode}
              />
            )
          })
        }{
          isRoot ? withoutParent.map(node => {
            const iconLoad = !props.loadedAll
              ? <Icon
                iconName="More"
                onClick={props.load}
                style={{
                  fontSize: '10px'
                }}
              />
              : undefined;
            return (
              <Node
                key={`node-${node.id}`}
                onClick={props.selectNode}
                node={node}
                level={level}
                isLast={node.children.length === 0}
                iconLoad={iconLoad}
                selected={selectedNode}
                onSelectNode={setSelectedNode}
              />
            )
          }) : undefined
        }
      </div>
    )
  }

  return <div className="Tree" style={{
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    KhtmlUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    userSelect: 'none'
  }} >
    {
      props.loadedAll
      ? undefined
      : <Icon
          iconName="More"
          onClick={ () => {props.load()}}
          style={{
            fontSize: '10px',
            cursor: 'pointer'
          }}
        />
    }
    <Node
      key={`root-node-${root.value}`}
      onClick={props.selectNode}
      node={root}
      level={level}
      isLast={false}
      isRoot={true}
      selected={selectedNode}
      onSelectNode={setSelectedNode}
    />
  </div>
}
