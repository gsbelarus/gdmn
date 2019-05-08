import { connect } from 'react-redux';
import { State } from '../store';
import { ChatBox } from './NLPDialogBox';
import { NLPDialogAction } from './reducer';
import { addNLPItem } from './actions';
import { ThunkDispatch } from 'redux-thunk';
import { Dispatch } from 'redux';
import { parsePhrase, ParsedText, RusPhrase } from 'gdmn-nlp';
import { TCancelSortDialogEvent, cancelSortDialog, TApplySortDialogEvent, TColumnResizeEvent, resizeColumn, GridAction, applySortDialog, TColumnMoveEvent, columnMove, TSelectRowEvent, TSelectAllRowsEvent, TSetCursorPosEvent, setCursorCol, TSortEvent, TToggleGroupEvent } from 'gdmn-grid';
import { RSAction, rsActions } from 'gdmn-recordset';
import { ICommand } from 'gdmn-nlp-agent';
import { ExecuteCommand } from '../engine/types';

export const ChatBoxContainer = connect(
  (state: State) => ({
    nlpDialog: state.nlpDialog,
    rs: state.nlpDialog.recordSetName ? state.recordSet[state.nlpDialog.recordSetName] : undefined,
    grid: state.nlpDialog.recordSetName ? state.grid[state.nlpDialog.recordSetName] : undefined,
  }),
  (dispatch: ThunkDispatch<State, never, NLPDialogAction | GridAction | RSAction>) => ({
    onCancelSortDialog: (event: TCancelSortDialogEvent) => dispatch(
      cancelSortDialog({name: event.rs.name})
    ),
    onApplySortDialog: (event: TApplySortDialogEvent) => dispatch(
      (dispatch, getState) => {
        dispatch(applySortDialog({ name: event.rs.name, sortFields: event.sortFields }));
        dispatch(rsActions.sortRecordSet({ name: event.rs.name, sortFields: event.sortFields }));
        event.ref.scrollIntoView(getState().recordSet[event.rs.name].currentRow);
      }
    ),
    onColumnResize: (event: TColumnResizeEvent) => dispatch(
      resizeColumn({name: event.rs.name, columnIndex: event.columnIndex, newWidth: event.newWidth})
    ),
    onColumnMove: (event: TColumnMoveEvent) => dispatch(
      columnMove({name: event.rs.name, oldIndex: event.oldIndex, newIndex: event.newIndex})
    ),
    onSelectRow: (event: TSelectRowEvent) => dispatch(
      rsActions.selectRow({name: event.rs.name, idx: event.idx, selected: event.selected})
    ),
    onSelectAllRows: (event: TSelectAllRowsEvent) => dispatch(
      rsActions.setAllRowsSelected({name: event.rs.name, value: event.value})
    ),
    onSetCursorPos: (event: TSetCursorPosEvent) => dispatch(
      (dispatch, getState) => {
        const recordSet = getState().recordSet[event.rs.name];
        if (recordSet) {
          dispatch(rsActions.setRecordSet({ name: event.rs.name, rs: recordSet.setCurrentRow(event.cursorRow) }));
          dispatch(setCursorCol({ name: event.rs.name, cursorCol: event.cursorCol }));
        }
      }
    ),
    onSort: (event: TSortEvent) => dispatch(
      (dispatch: ThunkDispatch<State, never, RSAction>, getState: () => State) => {
        dispatch(rsActions.sortRecordSet({ name: event.rs.name, sortFields: event.sortFields }));
        event.ref.scrollIntoView(getState().recordSet[event.rs.name].currentRow);
      }
    ),
    onToggleGroup: (event: TToggleGroupEvent) => dispatch(
      rsActions.toggleGroup({ name: event.rs.name, rowIdx: event.rowIdx })
    ),
    addNLPMessage: (text: string) => dispatch(
      (dispatch: Dispatch<any>, getState: () => State) => {
        dispatch(addNLPItem({ item: { who: 'me', text } }));

        let parsedText: ParsedText[] = [];

        try {
          parsedText = parsePhrase(text.trim());
        }
        catch(e) {
          dispatch(addNLPItem({ item: { who: 'it', text: e.message } }));
        }

        let command: ICommand[] | undefined = undefined;
        let erModelName: string | undefined = undefined;
        let executeCommand: ExecuteCommand | undefined = undefined;
        let errors: string[] = [];

        if (parsedText && parsedText.some(item => !!item.phrase && item.phrase instanceof RusPhrase)) {
          Object.entries(getState().ermodel).some( ([n, m]) => {
            if (m && !m.loading && m.erModel && m.erTranslatorRU) {
              try {
                command = m.erTranslatorRU.process(parsedText.map(item => item.phrase).reduce((phrases, item) => item ? [...phrases, item as RusPhrase] : phrases, [] as RusPhrase[]));
                erModelName = n;
                executeCommand = m.executeCommand;
                return true;
              }
              catch (e) {
                errors.push(`ermodel ${n}: ${e.message}`);
              }
            }

            return false;
          });
        }

        if (erModelName && command && command[0] && executeCommand) {
          executeCommand!(dispatch, getState, erModelName, command![0].payload)
          .then(
            () => {
              const recordSetName = erModelName!;
              const rs = getState().recordSet[recordSetName];

              if (rs) {
                dispatch(addNLPItem({ item: { who: 'it', text: `загружено записей: ${rs.size}` }, parsedText, recordSetName }));
              } else {
                dispatch(addNLPItem({ item: { who: 'it', text: 'готово' }, parsedText }));
              }
            }
          )
        } else {
          errors.forEach( text => dispatch(addNLPItem({ item: { who: 'it', text } })) )
        }
      }
    )
  })
)(ChatBox);