import React, { useState } from 'react';
import { Stack, Icon } from 'office-ui-fabric-react';
import { RecordSet } from 'gdmn-recordset';

interface INode {
  id: string;
  parent?: string;
  value: string;
  isLast: boolean;
  rollUp?: boolean;
}

const Node = (props: {node: INode, level: (parent: string) => JSX.Element}) => {
  const [rollUp, setRollUp] = useState(props.node.rollUp ? props.node.rollUp : false);

    return props.node.isLast
            ? <div style={{marginLeft: '25px', cursor: 'pointer'}}>{props.node.value}</div>
            : (rollUp !== undefined && !rollUp)
              ? <Stack horizontal styles={{root: {margin: '5px', cursor: 'pointer'}}}>
                  <Icon
                      iconName="CaretSolidDown"
                      onClick={() => setRollUp(!rollUp)}
                    />
                  <div style={{marginLeft: '5px'}}>{props.node.value}</div>
                </Stack>
              : <Stack>
                  <Stack horizontal styles={{root: {margin: '5px', cursor: 'pointer'}}}>
                    <Icon
                      iconName="CaretSolidUp"
                      onClick={() => setRollUp(!rollUp)}
                    />
                    <div style={{marginLeft: '5px'}}>{props.node.value}</div>
                  </Stack>
                  <div>{props.level(props.node.value)}</div>
                </Stack>
}

export const Tree = (props: {rs: RecordSet}) => {

  /*const nodes: INode[] = [{id: props.rs.name, value: props.rs.name, isLast: false}, ...(Object.values(props.entity).map(item => {
      return {id: item.name, value: item.name, parent: item.parent ? item.parent.name : undefined, isLast: false} as INode
    }))
  ];*/

  //const fd = props.rs.fieldDefs.find(fieldDef => fieldDef.caption === 'ID')

  console.log(props.rs)

  let nodes: INode[] = [
    {id: '2', value: '2', parent: '1', isLast: false},
    {id: '3', value: '3', parent: '2', isLast: true},
    {id: '4', value: '4', parent: '5', isLast: false, rollUp: false},
    {id: '1', value: '1', isLast: false},
    {id: '5', value: '5', parent: '1', isLast: false},
    {id: '6', value: '6', parent: '2', isLast: false},
    {id: '7', value: '7', parent: '6', isLast: true},
    {id: '8', value: '8', parent: '2', isLast: true},
    {id: '9', value: '9', parent: '1', isLast: true},
    {id: '10', value: '10', parent: '5', isLast: true},
    {id: '11', value: '11', parent: '4', isLast: true},
    {id: '12', value: '12', parent: '4', isLast: true},
  ];

  const level = (parent: string) => {
    const nodeInLevel = nodes.filter( curr => curr.parent && curr.parent === parent)
    return <div style={{marginLeft: '25px', WebkitTouchCallout: 'none', WebkitUserSelect: 'none', KhtmlUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none'  }}>
      {
        nodeInLevel.map( node => {
          return <Node key={`node-${node.value}-parent-${parent}`} node={node} level={level} />
        })
      }
    </div>
  }

  const roots: INode[] = nodes.filter(node => !node.parent)

  return <div className="Tree">
    {
      roots !== []
      ? roots.map( (root, idx) => (
        <Node key={`root-${idx}-node-${root.value}`} node={root} level={level} />
      ))
      : <div>Not found root</div>
    }
  </div>
}
