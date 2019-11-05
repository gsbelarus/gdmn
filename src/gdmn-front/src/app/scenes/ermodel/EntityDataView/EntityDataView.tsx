import React, { useEffect, useReducer } from 'react';
import { IEntityDataViewProps } from './EntityDataView.types';
import { CommandBar, MessageBar, MessageBarType, ICommandBarItemProps, TextField, Stack, DefaultButton, ComboBox, IComboBoxOption } from 'office-ui-fabric-react';
import { gdmnActions } from '../../gdmn/actions';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { rsActions, TStatus, RecordSet } from 'gdmn-recordset';
import { loadRSActions } from '@src/app/store/loadRSActions';
import { parsePhrase, ParsedText, RusPhrase } from 'gdmn-nlp';
import { ERTranslatorRU } from 'gdmn-nlp-agent';
import { GDMNGrid, TLoadMoreRsDataEvent, TRecordsetEvent, TRecordsetSetFieldValue, IUserColumnsSettings, GridComponentState } from 'gdmn-grid';
import { SQLForm } from '@src/app/components/SQLForm';
import { bindGridActions } from '../utils';
import { useSaveGridState } from './useSavedGridState';
import { useMessageBox } from '@src/app/components/MessageBox/MessageBox';
import { apiService } from "@src/app/services/apiService";
import { useSettings } from '@src/app/hooks/useSettings';
import { Tree } from '@src/app/components/Tree';
import { prepareDefaultEntityQuery, prepareEntityQueryWithParams } from 'gdmn-orm';
import { ListEntity } from '@src/app/components/ListEntity';

interface IEntityDataViewState {
  phrase: string;
  phraseError?: string;
  showSQL?: boolean;
  linkField?: string;
  valueFilter?: string;
};

type Action = { type: 'SET_PHRASE', phrase: string }
  | { type: 'SET_PHRASE_ERROR', phraseError: string }
  | { type: 'SET_SHOW_SQL', showSQL: boolean }
  | { type: 'SET_LINK_FIELD', linkField: string }
  | { type: 'SET_FILTER_FIELD', valueFilter: string };

function reducer(state: IEntityDataViewState, action: Action): IEntityDataViewState {
  switch (action.type) {
    case 'SET_PHRASE': {
      const { phrase } = action;

      return {
        ...state,
        phrase,
        phraseError: undefined
      }
    }

    case 'SET_PHRASE_ERROR': {
      const { phraseError } = action;

      return {
        ...state,
        phraseError
      }
    }

    case 'SET_SHOW_SQL': {
      const { showSQL } = action;

      return {
        ...state,
        showSQL
      }
    }

    case 'SET_LINK_FIELD': {
      const { linkField } = action;

      return {
        ...state,
        linkField
      }
    }

    case 'SET_FILTER_FIELD': {
      const { valueFilter } = action;

      return {
        ...state,
        valueFilter
      }
    }
  }

  return state;
};

export const EntityDataView = CSSModules( (props: IEntityDataViewProps): JSX.Element => {

  const { url, entityName, rs, entity, dispatch, viewTab, erModel, gcs, history, gridColors } = props;
  const currRS: RecordSet | undefined = rs ? rs[entityName] : undefined;
  const locked = currRS ? currRS.locked : false;
  const error = viewTab ? viewTab.error : undefined;
  const filter = currRS && currRS.filter && currRS.filter.conditions.length ? currRS.filter.conditions[0].value : '';
  const [gridRef, getSavedState] = useSaveGridState(dispatch, url, viewTab);
  const [MessageBox, messageBox] = useMessageBox();
  const [userColumnsSettings, setUserColumnsSettings, delUserColumnSettings] = useSettings<IUserColumnsSettings>({ type: 'GRID.v1', objectID: `${entityName}/viewForm` });

  let rsMaster: RecordSet | undefined = undefined;
  
  const [{ phrase, phraseError, showSQL, linkField, valueFilter }, viewDispatch] = useReducer(reducer, {
    phrase: currRS && currRS.queryPhrase
      ? currRS.queryPhrase
      : entityName
      ? `покажи все ${entityName}`
      : ''
  });

  const applyPhrase = () => {
    if (erModel && entity) {
      if (phrase) {
        try {
          const parsedText: ParsedText[] = parsePhrase(phrase);
          const phrases = parsedText.reduce( (p, i) => i.phrase instanceof RusPhrase ? [...p, i.phrase as RusPhrase] : p, [] as RusPhrase[]);
          if (phrases.length) {
            const erTranslatorRU = new ERTranslatorRU(erModel)
            const command = erTranslatorRU.process(phrases);
            const eq = command[0] ? command[0].payload : undefined;
            if (eq) {
              dispatch(loadRSActions.attachRS({ name: entityName, eq, queryPhrase: phrase, override: true, entityMaster: false }));
            }
          }
        }
        catch (e) {
          viewDispatch({ type: 'SET_PHRASE_ERROR', phraseError: e.message });
        }
      } else {
        const eq = prepareDefaultEntityQuery(entity);
        dispatch(loadRSActions.attachRS({ name: entityName, eq, override: true, entityMaster: false }));
      }
    }
  };

  // надо учесть, что когда у нас будет мастер рс, то
  // мы должны грузить набор данных исходя из того, 
  // что там выбрано в мастере
  useEffect( () => {
    if (!currRS && entity) {
      applyPhrase();
    }
  }, [currRS, entity]);

  const linkfields = currRS && currRS.params.eq ? currRS.params.eq.link.fields.filter(fd => fd.links) : [];

  // добавить еще эффект для загрузки мастер рс
  // если мы в режиме мастер-дитэйл
  useEffect( () => {
    if (rs && currRS && linkField) {
      if(rsMaster) {

      } else {
        const findLF = linkfields.find(lf => lf.attribute.name === linkField);
        if(findLF && findLF.links && findLF.links.length !== 0) {
          const entityMaster = findLF.links[0].entity;
          const eq = prepareDefaultEntityQuery(entityMaster);
          dispatch(loadRSActions.attachRS({ name: entityMaster.name, eq, override: true, entityMaster: true }));
        }
      }
    }
  }, [linkField]);

  if(rs && linkField) {
    const findLF = linkfields.find(lf => lf.attribute.name === linkField);
    if(findLF && findLF.links && findLF.links.length !== 0) {
      const entityMaster = findLF.links[0].entity;
      rsMaster = rs[entityMaster.name];
    }
  }

  useEffect( () => {
    if(rsMaster && entity && rsMaster.params.fieldDefs.find(fd => fd.caption === 'ID')) {
      const findAttr = entity.attribute('ID');
      const value = rsMaster.getString(rsMaster.params.fieldDefs.find(fd => fd.caption === 'ID')!.fieldName, rsMaster.params.currentRow)
      const eq = prepareEntityQueryWithParams(entity, findAttr && linkField ? [{attr: findAttr, alias: linkField, value}] : undefined);
      dispatch(loadRSActions.attachRS({ name: entityName, eq, override: true, entityMaster: true }));
    }
  }, [rsMaster])

  const filterByFieldLink = (value: string) => {
    if(entity) {
      const findAttr = entity.attribute('ID');
      const eq = prepareEntityQueryWithParams(entity, findAttr && linkField ? [{attr: findAttr, alias: linkField, value}] : undefined);
      dispatch(loadRSActions.attachRS({ name: entityName, eq, override: true, entityMaster: true }));
    }
  }
  
  useEffect( () => {
    if (currRS) {
      if (viewTab && (!viewTab.rs || !viewTab.rs.length)) {
        dispatch(gdmnActions.updateViewTab({
          url,
          viewTab: {
            rs: [currRS.name]
          }
        }));
      }
      else if (!viewTab) {
        dispatch(gdmnActions.addViewTab({
          url,
          caption: `${entityName}`,
          canClose: true,
          rs: [currRS.name]
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
  }, [rs, currRS, viewTab]);

  const addRecord = () => {
    if (entityName) {

      const f = async () => {
        const result = await apiService.getNextID({withError: false});
        const newID = result.payload.result!.id;
        if (newID) {
          history.push(`/spa/gdmn/entity/${entityName}/add/${newID}`);
        }
      };

      f();
    }
  };

  const loadMoreRsData = async (event: TLoadMoreRsDataEvent) => {
    const rowsCount = event.stopIndex - (event.rs ? event.rs.size : 0);
    dispatch(loadRSActions.loadMoreRsData({ name: event.rs.name, rowsCount }));
  };

  const onInsert = (event: TRecordsetEvent) => dispatch(rsActions.insert({ name: event.rs.name }));

  const onDelete = (event: TRecordsetEvent) => dispatch(rsActions.deleteRows({ name: event.rs.name }));

  const onCancel = (event: TRecordsetEvent) => dispatch(rsActions.cancel({ name: event.rs.name }));

  const onSetFieldValue = (event: TRecordsetSetFieldValue) => dispatch(rsActions.setFieldValue({ name: event.rs.name, fieldName: event.fieldName, value: event.value }));

  const onCloseSQL = () => viewDispatch({ type: 'SET_SHOW_SQL', showSQL: false });

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: `add`,
      text: 'Add',
      disabled: !currRS || locked,
      iconProps: {
        iconName: 'Add'
      },
      onClick: addRecord
    },
    {
      key: `edit`,
      text: 'Edit',
      disabled: !currRS || !currRS.size || locked,
      iconProps: {
        iconName: 'Edit'
      },
      onClick: () => !!currRS && !!currRS.size && history.push(`${url}/edit/${currRS.pk2s().join('-')}`)
      //commandBarButtonAs: rs && rs.size ? linkCommandBarButton(`${url}/edit/${rs.pk2s().join('-')}`) : undefined
    },
    {
      key: `delete`,
      text: 'Delete',
      disabled: !currRS || !currRS.size || locked,
      iconProps: {
        iconName: 'Delete'
      }
    },
    {
      key: 'load',
      disabled: !gridRef.current || !currRS || currRS.status === TStatus.LOADING || currRS.status === TStatus.FULL,
      text: 'Load all',
      iconProps: {
        iconName: 'Download'
      },
      onClick: () => gridRef.current && gridRef.current.loadFully(5000) as any
    },
    {
      key: 'refresh',
      disabled: !currRS || currRS.status === TStatus.LOADING,
      text: 'Refresh',
      iconProps: {
        iconName: 'Refresh'
      },
      onClick: () => currRS && currRS.eq && dispatch(loadRSActions.attachRS({ name: currRS.name, eq: currRS.eq, override: true, entityMaster: false }))
    },
    {
      key: 'sql',
      disabled: !currRS || !currRS.sql,
      text: 'Show SQL',
      iconProps: {
        iconName: 'FileCode'
      },
      onClick: () => viewDispatch({ type: 'SET_SHOW_SQL', showSQL: true })
    },
    {
      key: 'testMessageBox',
      text: 'Test MessageBox',
      iconProps: {
        iconName: 'FileCode'
      },
      onClick: () => {
        (async () => {
          if (await messageBox({
            message: 'abc',
            icon: 'Warning',
            type: 'MB_YESNOCANCEL'
          }) === 'YES') {
            messageBox({
              message: `Button YES has been pressed`
            });
          }
        })();
      }
    }
  ];

  const [gridRefEntities, getSavedStateEntities] = useSaveGridState(dispatch, url, viewTab);
  const [userColumnsSettingsEntity, setUserColumnsSettingsEntity, delUserColumnSettingsEntity] = useSettings<IUserColumnsSettings>({ type: 'GRID.v1', objectID: 'erModel/entity' });
  const fdMaster = rsMaster ? rsMaster.params.fieldDefs.find( fd => fd.caption === 'NAME' || fd.caption === 'USR$NAME') : undefined;
  const gcsRSMaster: GridComponentState | undefined = rsMaster  && fdMaster ? {
    columns: [{name: fdMaster.fieldName, fields: [fdMaster]}],
    leftSideColumns: 0,
    rightSideColumns: 0,
    currentCol: 0,
    selectRows: false,
    hideHeader: false,
    hideFooter: true,
    sortDialog: false,
    paramsDialog: false,
    searchIdx: 0
  } : undefined;

  const { onSetFilter, ...gridActions } = bindGridActions(dispatch);

  return (
    <Stack horizontal styles={{root: {width: '100%', height: '100%'}}}>
        {
          rs
            ? linkfields && linkfields.length !== 0 && linkField && linkField !== ''
              ? <Stack styles={{root: {overflow: 'auto', width: '400px', height: '100%'}}}>
                  {
                    rsMaster
                    ? linkfields.find( lf => lf.attribute.name === linkField)!.links![0].entity.isTree ?
                      <Tree
                        rs={rsMaster}
                        load={() => {
                          rsMaster ? dispatch(loadRSActions.loadMoreRsData({ name: rsMaster.name, rowsCount: 5000 })) : undefined}
                        }
                        selectNode={filterByFieldLink}
                        loadedAll={!rsMaster || rsMaster.status === TStatus.LOADING || rsMaster.status === TStatus.FULL}
                      />
                    : 
                      <div styleName="MDGridMasterTable" style={{width: '100%', height: '100%'}}>
                        { gcsRSMaster ?
                          <GDMNGrid
                            {...gcsRSMaster}
                            rs={rsMaster}
                            columns={gcsRSMaster.columns}
                            ref={ grid => grid && (gridRefEntities.current = grid) }
                            {...gridActions}
                            savedState={getSavedStateEntities()}
                            colors={gridColors}
                            userColumnsSettings={userColumnsSettingsEntity}
                            onSetUserColumnsSettings={ userSettings => userSettings && setUserColumnsSettingsEntity(userSettings) }
                            onDelUserColumnsSettings={ () => delUserColumnSettingsEntity() }
                          /> : <div>Not found grid rs-master</div>
                        }
                      </div>
                      : <div>Not found rs-master</div>
                  }
                </Stack>
              : undefined
            : undefined
        }
      <div styleName="SGrid">
        {
          showSQL && currRS && currRS.sql &&
          <SQLForm
            rs={currRS}
            onCloseSQL={onCloseSQL}
          />
        }
        <div styleName="SGridTop">
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
              <Stack
                horizontal
                tokens={{ childrenGap: '12px' }}
                styles={{
                  root: {
                    paddingLeft: '8px',
                    paddingRight: '8px',
                    paddingBottom: '8px',
                  }
                }}
              >
                <ComboBox
                  label="Link field"
                  placeholder="Select link field"
                  selectedKey={linkField}
                  autoComplete="on"
                  onChange={(_, option) => viewDispatch({ type: 'SET_LINK_FIELD', linkField: option ? option.text : '' })}
                  options={
                    linkfields.length !== 0
                      ? linkfields.map( link => {return {key: link.attribute.name, text: link.attribute.name} as IComboBoxOption})
                      : undefined
                  }
                />
                <TextField
                  disabled={!currRS || currRS.status !== TStatus.FULL}
                  label="Filter:"
                  value={filter}
                  onChange={ (_, newValue) => onSetFilter({ rs: currRS!, filter: newValue ? newValue : '' }) }
                />
                <Stack.Item grow={1}>
                  <Stack horizontal verticalAlign="end">
                    <TextField
                      styles={{
                        root: {
                          width: '100%'
                        }
                      }}
                      label="Query:"
                      value={phrase}
                      onChange={ (_, newValue) => viewDispatch({ type: 'SET_PHRASE', phrase: newValue ? newValue : '' }) }
                      errorMessage={ phraseError ? phraseError : undefined }
                    />
                    <DefaultButton onClick={applyPhrase}>
                      Применить
                    </DefaultButton>
                  </Stack>
                </Stack.Item>
              </Stack>
        </div>
        <MessageBox />
        <div styleName="SGridTable">
          { currRS && gcs ?
            <GDMNGrid
              {...gcs}
              columns={gcs.columns}
              rs={currRS}
              loadMoreRsData={loadMoreRsData}
              {...gridActions}
              onDelete={onDelete}
              onInsert={onInsert}
              onCancel={onCancel}
              onSetFieldValue={onSetFieldValue}
              ref={ grid => grid && (gridRef.current = grid) }
              savedState={getSavedState()}
              colors={gridColors}
              userColumnsSettings={userColumnsSettings}
              onSetUserColumnsSettings={ userSettings => userSettings && setUserColumnsSettings(userSettings) }
              onDelUserColumnsSettings={ () => delUserColumnSettings() }
            />
            : null
          }
        </div>
      </div>
    </Stack>
  );
}, styles, { allowMultiple: true });
