import React, { useState } from 'react';
import { Stack, Icon, getTheme } from 'office-ui-fabric-react';
import { RecordSet } from 'gdmn-recordset';

interface IItem {
    id: string;
    value: string;
}

export const ListEntity = (props: {rs:RecordSet, load: () => void, loadedAll: boolean}) => {

    const count = props.rs.size;
    const fdID = props.rs.params.fieldDefs.find(fd => fd.caption === 'ID');
    const fdNAME = props.rs.params.fieldDefs.find(fd => fd.caption === 'NAME');
    const fdUSRNAME = props.rs.params.fieldDefs.find(fd => fd.caption === 'USR$NAME');
    const items: IItem[] = [];
  
    for(let i = 0; i < count; i++) {
        if(fdID && (fdNAME || fdUSRNAME)) {
            items.push({
                id: props.rs.getString(fdID.fieldName, i), 
                value: fdNAME ? props.rs.getString(fdNAME.fieldName, i) : props.rs.getString(fdUSRNAME!.fieldName, i), 
            })
        }
      }

    return <div styleName="ListEntity">
        { !props.loadedAll
              ? <Icon
                iconName="More"
                onClick={props.load}
                style={{
                  fontSize: '10px'
                }}
              />
              : undefined
        }
        {
            items.map(item => {
                return <div key={item.id}>{item.value}</div>
            })
        }
    </div>
}
  