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

  const nodes: INode[] = [{id: props.rs.name, value: props.rs.name, isLast: false}];

  const count = props.rs.size;
  const f: INode[] = [];

  for(let i = 0; i < count; i++) {
    //props.rs.getString('USR$NAME', i)
    const fdID = props.rs.params.fieldDefs.find(fd => fd.caption === 'ID')
    const fdNAME = props.rs.params.fieldDefs.find(fd => fd.caption === 'NAME')
    const fdUSRNAME = props.rs.params.fieldDefs.find(fd => fd.caption === 'USR$NAME')
    if(fdID && (fdNAME || fdUSRNAME)) {
      fdNAME
        ? f.push({id: props.rs.getString(fdID.fieldName, i), value: props.rs.getString(fdNAME.fieldName, i), isLast: false} as INode)
        : fdUSRNAME
          ? f.push({id: props.rs.getString(fdID.fieldName, i), value: props.rs.getString(fdUSRNAME.fieldName, i), isLast: false} as INode)
          : undefined
    }
  }

  console.log(f)

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
