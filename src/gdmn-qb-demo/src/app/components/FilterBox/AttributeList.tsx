import React from 'react';
import shortid from 'shortid';
import { IAttribute } from '@src/app/model';

import './index.css';

interface IAttributeList {
  data: IAttribute[];
}

export const AttributeList: React.SFC<IAttributeList> = props => (
  <div className="entity-box-content">
    <ul className="attributes">
      {props.data.map(i => (
        <li key={shortid.generate()}>
          <input type="checkbox" id="checkbox}" />
          <label htmlFor="checkbox"> {i.name}</label>
        </li>
      ))}
    </ul>
  </div>
);
