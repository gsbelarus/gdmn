import React from 'react';
import Draggable from 'react-draggable';
import { IEntity } from '../../model/entity';
import { AttributeList } from './AttributeList';

import './index.css';

export interface IEntityEvent {
  onClickDelete: (id: string) => void;
}

export const Entity: React.SFC<IEntity & IEntityEvent> = props => (
  <Draggable
    axis="both"
    defaultPosition={{ x: 0, y: 0 }}
    grid={[25, 25]}
    handle=".entity-box-handle-title"
    // bounds="parent"
    // bounds={{ top: 0, left: 0, right: 1800, bottom: 1280 }}
  >
    <div className="entity-box">
      <div className="entity-box-handle">
        <div className="entity-box-handle-title">{props.name}</div>
        <div className="action-button" onClick={() => props.onClickDelete(props.id || '')}>
          <i className="fas fa-times fa-xs"/>
        </div>
      </div>
      <AttributeList data={props.attributes || []}/>
    </div>
  </Draggable>
);
