import { GridAction, GridComponentState } from 'gdmn-grid';
import { ERModel } from 'gdmn-orm';
import { RecordSet, RSAction } from 'gdmn-recordset';
import { RouteComponentProps } from 'react-router';
import { ThunkDispatch } from 'redux-thunk';

import { IState } from '@src/app/store/reducer';
import { TRsMetaActions } from '@src/app/store/rsmeta';

import { GdmnAction } from '../../gdmn/actions';
import { LoadRSActions } from '@src/app/store/loadRSActions';

export interface IHistoryContainerProps {
  id: string;
  onUpdate: (rsName: string) => void;
  onClose: () => void;
  onSelect: (expression: string) => void;
}

export interface IHistoryStateProps {
  erModel: ERModel;
  rs?: RecordSet;
  gcs: GridComponentState;
}
export interface IHistoryProps extends IHistoryContainerProps, IHistoryStateProps {
  dispatch: ThunkDispatch<IState, never, RSAction | GdmnAction | GridAction | TRsMetaActions | LoadRSActions>;
}
