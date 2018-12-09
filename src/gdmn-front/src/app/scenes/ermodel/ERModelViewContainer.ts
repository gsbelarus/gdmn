import { ERModelView, IERModelViewProps } from './ERModelView';
import { IState } from '@src/app/store/reducer';
import { connect } from 'react-redux';
import { ERModel } from 'gdmn-orm';
import { RecordSet, TFieldType, createRecordSet } from 'gdmn-recordset';
import { IColumn, GetGridRef } from 'gdmn-grid';
import { List } from 'immutable';
import { ConnectedGrid, getGridContainer } from '../components/GridContainer';

export const ERModelViewContainer = connect(
  (state: IState): Partial<IERModelViewProps> => ({
    erModel: state.gdmnState.erModel,
    entitiesRs: state.recordSet.entities
  }),
  dispatch => ({
    fillEntities: (erModel: ERModel) => {
      const rs = RecordSet.createWithData(
        'entities',
        [
          {
            fieldName: 'name',
            dataType: TFieldType.String,
            caption: 'Entity name'
          },
          {
            fieldName: 'description',
            dataType: TFieldType.String,
            caption: 'Description'
          }
        ],
        List(
          Object.entries(erModel.entities).map(([name, ent]) => ({
            name,
            description: ent.lName.ru ? ent.lName.ru.name : name
          }))
        )
      );
      dispatch(createRecordSet({ name: rs.name, rs }));
    },
    connectGrid: (name: string, rs: RecordSet, columns: IColumn[] | undefined, getGridRef: GetGridRef): ConnectedGrid =>
      getGridContainer(dispatch, name, rs, columns, getGridRef)
  })
)(ERModelView);
