import { connect } from 'react-redux';
import { State } from '../store';
import { ChatBox } from './NLPDialogBox';
import { NLPDialogAction } from './reducer';
import { addNLPItem } from './actions';
import { ThunkDispatch } from 'redux-thunk';
import { Dispatch } from 'redux';
import { parsePhrase, ParsedText, RusPhrase } from 'gdmn-nlp';
import { TCancelSortDialogEvent, cancelSortDialog, TApplySortDialogEvent, TColumnResizeEvent, resizeColumn, GridAction, applySortDialog, TColumnMoveEvent, columnMove, TSelectRowEvent, TSelectAllRowsEvent, TSetCursorPosEvent, setCursorCol, TSortEvent, TToggleGroupEvent } from 'gdmn-grid';
import { sortRecordSet, RecordSetAction, selectRow, setAllRowsSelected, setRecordSet, toggleGroup } from 'gdmn-recordset';
import { ICommand } from 'gdmn-nlp-agent';
import { ERModel } from 'gdmn-orm';
import { ExecuteCommand } from '../engine/types';
import { loadingQuery, LoadingQuery } from '../syntax/actions';

export const ChatBoxContainer = connect(
  (state: State) => ({
    nlpDialog: state.nlpDialog,
    rs: state.nlpDialog.recordSetName ? state.recordSet[state.nlpDialog.recordSetName] : undefined,
    grid: state.nlpDialog.recordSetName ? state.grid[state.nlpDialog.recordSetName] : undefined,
  }),
  (dispatch: ThunkDispatch<State, never, NLPDialogAction | GridAction | RecordSetAction>) => ({
    onCancelSortDialog: (event: TCancelSortDialogEvent) => dispatch(
      cancelSortDialog({name: event.rs.name})
    ),
    onApplySortDialog: (event: TApplySortDialogEvent) => dispatch(
      (dispatch, getState) => {
        dispatch(applySortDialog({ name: event.rs.name, sortFields: event.sortFields }));
        dispatch(sortRecordSet({ name: event.rs.name, sortFields: event.sortFields }));
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
      selectRow({name: event.rs.name, idx: event.idx, selected: event.selected})
    ),
    onSelectAllRows: (event: TSelectAllRowsEvent) => dispatch(
      setAllRowsSelected({name: event.rs.name, value: event.value})
    ),
    onSetCursorPos: (event: TSetCursorPosEvent) => dispatch(
      (dispatch, getState) => {
        const recordSet = getState().recordSet[event.rs.name];
        if (recordSet) {
          dispatch(setRecordSet({ name: event.rs.name, rs: recordSet.setCurrentRow(event.cursorRow) }));
          dispatch(setCursorCol({ name: event.rs.name, cursorCol: event.cursorCol }));
        }
      }
    ),
    onSort: (event: TSortEvent) => dispatch(
      (dispatch: ThunkDispatch<State, never, RecordSetAction>, getState: () => State) => {
        dispatch(sortRecordSet({ name: event.rs.name, sortFields: event.sortFields }));
        event.ref.scrollIntoView(getState().recordSet[event.rs.name].currentRow);
      }
    ),
    onToggleGroup: (event: TToggleGroupEvent) => dispatch(
      toggleGroup({ name: event.rs.name, rowIdx: event.rowIdx })
    ),
    addNLPMessage: (text: string) => dispatch(
      (dispatch: Dispatch<any>, getState: () => State) => {
        dispatch(addNLPItem({ item: { who: 'me', text } }));

        let parsedText: ParsedText | undefined = undefined;

        try {
          parsedText = parsePhrase(text.trim());
        }
        catch(e) {
          dispatch(addNLPItem({ item: { who: 'it', text: e.message } }));
        }

        let command: ICommand[] | undefined = undefined;
        let erModelName;
        let executeCommand: ExecuteCommand | undefined = undefined;
        let errors: string[] = [];

        if (parsedText && parsedText.phrase instanceof RusPhrase) {
          Object.entries(getState().ermodel).some( ([n, m]) => {
            if (m && !m.loading && m.erModel && m.erTranslatorRU) {
              try {
                command = m.erTranslatorRU.process(parsedText!.phrase as RusPhrase);
                erModelName = n;
                executeCommand = m.executeCommand;
                return true;
              }
              catch (e) {
                errors.push(e.message);
              }
            }

            return false;
          });
        }

        if (erModelName && command && command[0] && executeCommand) {
          executeCommand!(dispatch, erModelName, command![0].payload);
        }

        if (command) {
          dispatch(addNLPItem({ item: { who: 'it', text: 'готово!' }, parsedText }));
        } else {
          errors.forEach( text => dispatch(addNLPItem({ item: { who: 'it', text } })) )
        }
      }
    )
  })
)(ChatBox);