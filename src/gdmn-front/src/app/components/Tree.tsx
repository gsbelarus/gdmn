import React, { useState } from 'react';
import { Stack, Icon } from 'office-ui-fabric-react';
import { RecordSet } from 'gdmn-recordset';

interface INode {
  id: string;
  parent?: string;
  value: string;
  rollUp?: boolean;
}

const Node = (props: {node: INode, level: (parent: string) => JSX.Element, isLast: boolean}) => {
  const [rollUp, setRollUp] = useState(props.node.rollUp ? props.node.rollUp : false);

    return props.isLast
            ? <div style={{marginLeft: '25px', cursor: 'pointer'}}>{props.node.value}</div>
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
                  <div>{props.level(props.node.id)}</div>
                </Stack>
}

export const Tree = (props: {rs: RecordSet}) => {
  
  const root = {id: props.rs.name, value: props.rs.name}
  const nodes: INode[] = [root];
  const count = props.rs.size;

  for(let i = 0; i < count; i++) {
    const fdID = props.rs.params.fieldDefs.find(fd => fd.caption === 'ID')
    const fdNAME = props.rs.params.fieldDefs.find(fd => fd.caption === 'NAME')
    const fdUSRNAME = props.rs.params.fieldDefs.find(fd => fd.caption === 'USR$NAME')
    const fdPARENT = props.rs.params.fieldDefs.find(fd => fd.caption === 'PARENT.ID')
    const parent = fdPARENT ? props.rs.getString(fdPARENT.fieldName, i) : undefined;
    if(fdID && (fdNAME || fdUSRNAME)) {
      fdNAME
        ? nodes.push({
            id: props.rs.getString(fdID.fieldName, i),
            value: props.rs.getString(fdNAME.fieldName, i), 
            parent: parent ? parent : props.rs.name
          } as INode)
        : fdUSRNAME
          ? nodes.push({
              id: props.rs.getString(fdID.fieldName, i), 
              value: props.rs.getString(fdUSRNAME.fieldName, i), 
              parent: parent ? parent : props.rs.name
            } as INode)
          : undefined
    }
  }
  
  const level = (parent: string) => {
    const nodeInLevel = nodes.filter( curr => curr.parent && curr.parent === parent)
    return <div style={{marginLeft: '25px', WebkitTouchCallout: 'none', WebkitUserSelect: 'none', KhtmlUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none'  }}>
      {
        nodeInLevel.map( node => {
          const nextLevel: INode[] = nodes.filter( curr => curr.parent && curr.parent === node.id);
          return <Node key={`node-${node.value}-parent-${parent}`} node={node} level={level} isLast={nextLevel.length === 0} />
        })
      }
    </div>
  }

  return <div className="Tree">
    {
      <Node key={`root-node-${root.value}`} node={root} level={level} isLast={false} />
    }
  </div>
}
