import React, { useEffect, useState, useRef } from 'react';
import { IEntityDataView2Props } from './EntityDataView.types';
import { CommandBar, MessageBar, MessageBarType, ICommandBarItemProps, TextField, PrimaryButton } from 'office-ui-fabric-react';
import { gdmnActions } from '../../gdmn/actions';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { rsActions, TStatus } from 'gdmn-recordset';
import { prepareDefaultEntityQuery } from './utils';
import { loadRSActions } from '@src/app/store/loadRSActions';
import { parsePhrase, ParsedText, RusPhrase } from 'gdmn-nlp';
import { ERTranslatorRU } from 'gdmn-nlp-agent';
import { GDMNGrid, TLoadMoreRsDataEvent, cancelSortDialog, TCancelSortDialogEvent, TApplySortDialogEvent,
  applySortDialog, resizeColumn, TColumnResizeEvent, TColumnMoveEvent, columnMove, TSelectRowEvent,
  TSelectAllRowsEvent, TSetCursorPosEvent, setCursorCol, TSortEvent, TToggleGroupEvent, TOnFilterEvent,
  TRecordsetEvent, TRecordsetSetFieldValue, IGridState } from 'gdmn-grid';
import { linkCommandBarButton } from '@src/app/components/LinkCommandBarButton';
import { SQLForm } from '@src/app/components/SQLForm';

export const EntityDataView = CSSModules( (props: IEntityDataView2Props): JSX.Element => {

  const { url, entityName, rs, entity, dispatch, viewTab, erModel, gcs } = props;
  const locked = rs ? rs.locked : false;
  const error = viewTab ? viewTab.error : undefined;
  const gridRef = useRef<GDMNGrid | undefined>();
  const filter = rs && rs.filter && rs.filter.conditions.length ? rs.filter.conditions[0].value : '';
  const [showSQL, setShowSQL] = useState(false);
  const topRef = useRef<HTMLDivElement | null>(null);

  const [phrase, setPhrase] = useState(
    rs && rs.queryPhrase
    ? rs.queryPhrase
    : entityName
    ? `покажи все ${entityName}`
    : ''
  );

  useEffect( () => {
    return () => {
      if (gridRef.current) {
        dispatch(gdmnActions.saveSessionData({
          viewTabURL: url,
          sessionData: { 'savedGridState': gridRef.current.state }
        }));
      }
    }
  }, []);

  const applyPhrase = () => {
    if (erModel) {
      const parsedText: ParsedText[] = parsePhrase(phrase);
      const phrases = parsedText.reduce( (p, i) => i.phrase instanceof RusPhrase ? [...p, i.phrase as RusPhrase] : p, [] as RusPhrase[]);
      if (phrases.length) {
        const erTranslatorRU = new ERTranslatorRU(erModel)
        const command = erTranslatorRU.process(phrases);
        const eq = command[0] ? command[0].payload : undefined;
        if (eq) {
          dispatch(loadRSActions.attachRS({ name: entityName, eq, queryPhrase: phrase, override: true }));
        }
      }
    }
  };

  useEffect( () => {
    if (!rs && entity) {
      if (!phrase) {
        const eq = prepareDefaultEntityQuery(entity);
        dispatch(loadRSActions.attachRS({ name: entityName, eq }));
      } else {
        applyPhrase();
      }
    }
  }, [rs, entity]);

  useEffect( () => {
    if (rs) {
      if (viewTab && (!viewTab.rs || !viewTab.rs.length)) {
        dispatch(gdmnActions.updateViewTab({
          url,
          viewTab: {
            rs: [rs.name]
          }
        }));
      }
      else if (!viewTab) {
        dispatch(gdmnActions.addViewTab({
          url,
          caption: `${entityName}`,
          canClose: true,
          rs: [rs.name]
        }));
      }
    } else {
      if (!viewTab) {
        dispatch(gdmnActions.addViewTab({
          url,
          caption: `${entityName}`,
          canClose: true
        }));
      }
    }
  }, [rs, viewTab]);

  const loadMoreRsData = async (event: TLoadMoreRsDataEvent) => {
    const rowsCount = event.stopIndex - (event.rs ? event.rs.size : 0);
    dispatch(loadRSActions.loadMoreRsData({ name: event.rs.name, rowsCount }));
  };

  const onCancelSortDialog = (event: TCancelSortDialogEvent) => dispatch(
    cancelSortDialog({ name: event.rs.name })
  );

  const onApplySortDialog = (event: TApplySortDialogEvent) => dispatch(
    (dispatch, getState) => {
      dispatch(applySortDialog({ name: event.rs.name, sortFields: event.sortFields }));
      dispatch(rsActions.sortRecordSet({ name: event.rs.name, sortFields: event.sortFields }));

      event.ref.scrollIntoView(getState().recordSet[event.rs.name].currentRow);
    }
  );

  const onColumnResize = (event: TColumnResizeEvent) => {
    return dispatch(resizeColumn({
      name: event.rs.name,
      columnIndex: event.columnIndex,
      newWidth: event.newWidth
    }));
  };

  const onColumnMove = (event: TColumnMoveEvent) => dispatch(
    columnMove({
      name: event.rs.name,
      oldIndex: event.oldIndex,
      newIndex: event.newIndex
    })
  );

  const onSelectRow = (event: TSelectRowEvent) => dispatch(
    rsActions.selectRow({
      name: event.rs.name,
      idx: event.idx,
      selected: event.selected
    })
  );

  const onSelectAllRows = (event: TSelectAllRowsEvent) => dispatch(
    rsActions.setAllRowsSelected({
      name: event.rs.name,
      value: event.value
    })
  );

  const onSetCursorPos = (event: TSetCursorPosEvent) => dispatch(
    (dispatch) => {
      dispatch(
        rsActions.setRecordSet(event.rs.setCurrentRow(event.cursorRow))
      );

      dispatch(
        setCursorCol({
          name: event.rs.name,
          cursorCol: event.cursorCol
        })
      );
    }
  );

  const onSort = (event: TSortEvent) => dispatch(
    (dispatch, getState) => {
      dispatch(
        rsActions.sortRecordSet({
          name: event.rs.name,
          sortFields: event.sortFields
        })
      );

      event.ref.scrollIntoView(getState().recordSet[event.rs.name].currentRow);
    }
  );

  const onToggleGroup = (event: TToggleGroupEvent) => dispatch(
    rsActions.toggleGroup({
      name: event.rs.name,
      rowIdx: event.rowIdx
    })
  );

  const onSetFilter = (event: TOnFilterEvent) => {
    if (event.filter) {
      dispatch(rsActions.setFilter({name: event.rs.name, filter: { conditions: [ { value: event.filter } ] } }))
    } else {
      dispatch(rsActions.setFilter({name: event.rs.name, filter: undefined }))
    }
  };

  const onInsert = (event: TRecordsetEvent) => dispatch(rsActions.insert({ name: event.rs.name }));

  const onDelete = (event: TRecordsetEvent) => dispatch(rsActions.deleteRows({ name: event.rs.name }));

  const onCancel = (event: TRecordsetEvent) => dispatch(rsActions.cancel({ name: event.rs.name }));

  const onSetFieldValue = (event: TRecordsetSetFieldValue) => dispatch(rsActions.setFieldValue({ name: event.rs.name, fieldName: event.fieldName, value: event.value }));

  const getSavedState = () => {
    const savedGridState = viewTab && viewTab.sessionData ? viewTab.sessionData['savedGridState'] : undefined;

    if (savedGridState instanceof Object) {
      return savedGridState as IGridState;
    } else {
      return undefined;
    }
  };

  const onCloseSQL = () => setShowSQL(false);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: `add`,
      text: 'Add',
      disabled: !rs || locked,
      iconProps: {
        iconName: 'Add'
      },
      commandBarButtonAs: linkCommandBarButton(`${url}/add`)
    },
    {
      key: `edit`,
      text: 'Edit',
      disabled: !rs || !rs.size || locked,
      iconProps: {
        iconName: 'Edit'
      },
      commandBarButtonAs: rs && rs.size ? linkCommandBarButton(`${url}/edit/${rs.pk2s().join('-')}`) : undefined
    },
    {
      key: `delete`,
      text: 'Delete',
      disabled: !rs || !rs.size || locked,
      iconProps: {
        iconName: 'Delete'
      }
    },
    {
      key: 'load',
      disabled: !gridRef.current || !rs || rs.status === TStatus.LOADING || rs.status === TStatus.FULL,
      text: 'Load all',
      iconProps: {
        iconName: 'Download'
      },
      onClick: () => gridRef.current && gridRef.current.loadFully(5000) as any
    },
    {
      key: 'refresh',
      disabled: !rs || rs.status === TStatus.LOADING,
      text: 'Refresh',
      iconProps: {
        iconName: 'Refresh'
      },
      onClick: () => rs && rs.eq && dispatch(loadRSActions.attachRS({ name: rs.name, eq: rs.eq, override: true }))
    },
    {
      key: 'sql',
      disabled: !rs || !rs.sql,
      text: 'Show SQL',
      iconProps: {
        iconName: 'FileCode'
      },
      onClick: () => setShowSQL(true)
    }
  ];

  const topHeight = topRef.current ? topRef.current.clientHeight : 0;

  return (
    <div className="ViewWide">
      {
        showSQL && rs && rs.sql &&
        <SQLForm
          rs={rs}
          onCloseSQL={onCloseSQL}
        />
      }
      <div styleName="Top" ref={topRef}>
        <CommandBar items={commandBarItems} />
        {
          error
          &&
          <MessageBar
            messageBarType={MessageBarType.error}
            isMultiline={false}
            onDismiss={ () => viewTab && dispatch(gdmnActions.updateViewTab({ url, viewTab: { error: undefined } })) }
            dismissButtonAriaLabel="Close"
          >
            {error}
          </MessageBar>
        }
          <div styleName="OptionsPanel">
            <TextField
              disabled={!rs || rs.status !== TStatus.FULL}
              label="Filter:"
              value={filter}
              onChange={ (_, newValue) => onSetFilter({ rs: rs!, filter: newValue ? newValue : '' }) }
            />
            <span styleName="QueryBox">
              <TextField
                label="Query:"
                value={phrase}
                onChange={ (_, newValue) => setPhrase(newValue ? newValue : '') }
              />
              <PrimaryButton onClick={applyPhrase} >
                Применить
              </PrimaryButton>
            </span>
          </div>
      </div>
      {
        rs && gcs
        ?
        <>
        <div style={{ height: `calc(100% - ${topHeight}px)` }}>
          <GDMNGrid
            {...gcs}
            rs={rs}
            loadMoreRsData={loadMoreRsData}
            onCancelSortDialog={onCancelSortDialog}
            onApplySortDialog={onApplySortDialog}
            onColumnResize={onColumnResize}
            onColumnMove={onColumnMove}
            onSelectRow={onSelectRow}
            onSelectAllRows={onSelectAllRows}
            onSetCursorPos={onSetCursorPos}
            onSort={onSort}
            onToggleGroup={onToggleGroup}
            onDelete={onDelete}
            onInsert={onInsert}
            onCancel={onCancel}
            onSetFieldValue={onSetFieldValue}
            ref={(grid: GDMNGrid) => grid && (gridRef.current = grid)}
            savedState={getSavedState()}
          />
        </div>
      </>
      : 'Loading...'
    }
    </div>
  );
}, styles, { allowMultiple: true });