import React, { useState } from 'react';
import { Stack, Icon } from 'office-ui-fabric-react';
import { RecordSet } from 'gdmn-recordset';

interface INode {
  id: string;
  parent?: string;
  value: string;
  rollUp?: boolean;
  children: string[];
}

const Node = (props: {node: INode, level: (children: string[], isRoot: boolean) => JSX.Element, isLast: boolean, isRoot?: boolean, iconLoad?: JSX.Element}) => {
  const [rollUp, setRollUp] = useState(props.node.rollUp ? props.node.rollUp : false);

    return props.isLast
            ? <Stack horizontal verticalAlign="center" styles={{root: {margin: '5px', cursor: 'pointer'}}}>
              {props.iconLoad}
              <div style={{marginLeft: '5px'}}>{props.node.value}</div>
              </Stack>
            : (rollUp !== undefined && !rollUp)
              ? <Stack horizontal verticalAlign="center" styles={{root: {margin: '5px', cursor: 'pointer'}}}>
                  <Icon
                      iconName="ChevronRight"
                      onClick={() => setRollUp(!rollUp)}
                      style={{
                        fontSize: '10px'
                      }}
                    />
                  <div style={{ marginLeft: '5px'}}>{props.node.value}</div>
                </Stack>
              : <Stack>
                  <Stack horizontal verticalAlign="center" styles={{root: {margin: '5px', cursor: 'pointer'}}}>
                    <Icon
                      iconName="ChevronDown"
                      onClick={() => setRollUp(!rollUp)}
                      style={{
                        fontSize: '10px'
                      }}
                    />
                    <div style={{marginLeft: '5px'}}>{props.node.value}</div>
                  </Stack>
                  <div>{props.level(props.node.children, props.isRoot ? props.isRoot : false)}</div>
                </Stack>
}

export const Tree = (props: {rs: RecordSet, load: () => void, loadedAll: boolean}) => {
  
  const root = {id: props.rs.name, value: props.rs.name, rollUp: true, children: []}
  const nodes: INode[] = [root];

  const count = props.rs.size;
  const childRoot = [] as string[];
  const fdID = props.rs.params.fieldDefs.find(fd => fd.caption === 'ID')
  const fdNAME = props.rs.params.fieldDefs.find(fd => fd.caption === 'NAME')
  const fdUSRNAME = props.rs.params.fieldDefs.find(fd => fd.caption === 'USR$NAME')
  const fdPARENT = props.rs.params.fieldDefs.find(fd => fd.caption === 'PARENT.ID')

  for(let i = 0; i < count; i++) {
    const parent = fdPARENT ? props.rs.getString(fdPARENT.fieldName, i) : undefined;
    const findIDParent = fdID ? props.rs.getString(fdID.fieldName, i) : undefined;
    if(!parent && findIDParent) {
      childRoot.push(findIDParent)
    }
    if(findIDParent && (fdNAME || fdUSRNAME)) {
      fdNAME
        ? nodes.push({
            id: findIDParent,
            value: props.rs.getString(fdNAME.fieldName, i), 
            parent: parent ? parent : props.rs.name
          } as INode)
        : fdUSRNAME
          ? nodes.push({
              id: findIDParent, 
              value: props.rs.getString(fdUSRNAME.fieldName, i), 
              parent: parent ? parent : props.rs.name
            } as INode)
          : undefined
    }
  }
  const withoutParent = nodes.filter(node => node.parent ? nodes.find(item => item.id === node.parent) === undefined : false)
  nodes.map( (node, idx) => {
    return nodes[idx].children = nodes.filter( curr => curr.parent && curr.parent === node.id).map(item => item.id);
  })

  const level = (children: string[], isRoot: boolean) => {
    const nodeInLevel = nodes.filter( curr => children.find(child => child === curr.id));
    return (
      <div
        style={{
          marginLeft: '25px',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          KhtmlUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          userSelect: 'none'
        }}
      >
        {
          nodeInLevel.map( node => {
            return <Node key={`node-${node.id}`} node={node} level={level} isLast={node.children.length === 0} />
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
            return <Node key={`node-${node.id}`} node={node} level={level} isLast={node.children.length === 0} iconLoad={iconLoad} />
          }) : undefined
        }
      </div>
    )
  }

  return <div className="Tree">
    <Node key={`root-node-${root.value}`} node={root} level={level} isLast={false} isRoot={true} />
  </div>
}
