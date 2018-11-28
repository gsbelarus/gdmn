import React, { ReactEventHandler } from 'react';
import Draggable from 'react-draggable';
import { IAttribute } from '@src/app/model';
import { IAttributeParams } from '@src/app/components/AttributeBox/AttributeBox';
import { sortType, SortType } from '../../types';

import './index.css';

export interface IEntityEvent {
  onClickDelete?: (id: string) => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeSortType: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeFieldAlias: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Attribute: React.SFC<IAttributeParams & IEntityEvent> = props => (
  <tr>
    <td>
      <input type="checkbox" checked={props.visible} key={props.id} onChange={props.onChange} />
    </td>
    <td>
      {props.expression.entityName}.{props.expression.fieldName}
    </td>
    <td>
      <input
        className="field-alias"
        type="text"
        key={props.id}
        value={props.fieldAlias}
        onChange={props.onChangeFieldAlias}
      />
    </td>
    <td>
      <select defaultValue={props.sortType} onChange={props.onChangeSortType}>
        {sortType.map((s, idx) => (
          <option key={idx} value={s}>
            {s}
          </option>
        ))}
      </select>
    </td>
  </tr>
);
