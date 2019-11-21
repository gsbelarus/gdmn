import React, { useEffect, useReducer } from 'react';
import { IEntityDataViewProps } from './EntityDataView.types';
import { CommandBar, MessageBar, MessageBarType, ICommandBarItemProps, TextField, Stack, DefaultButton, ComboBox, IComboBoxOption } from 'office-ui-fabric-react';
import { gdmnActions } from '../../gdmn/actions';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { rsActions, TStatus, IDataRow } from 'gdmn-recordset';
import { loadRSActions } from '@src/app/store/loadRSActions';
import { nlpTokenize, nlpParse, sentenceTemplates } from 'gdmn-nlp';
import { ERTranslatorRU2 } from 'gdmn-nlp-agent';
import { GDMNGrid, TLoadMoreRsDataEvent, TRecordsetEvent, TRecordsetSetFieldValue, IUserColumnsSettings, GridComponentState } from 'gdmn-grid';
import { SQLForm } from '@src/app/components/SQLForm';
import { bindGridActions } from '../utils';
import { useSaveGridState } from './useSavedGridState';
import { useMessageBox } from '@src/app/components/MessageBox/MessageBox';
import { apiService } from "@src/app/services/apiService";
import { useSettings } from '@src/app/hooks/useSettings';
import { Tree } from '@src/app/components/Tree';
import { prepareDefaultEntityQuery, EntityQuery, EntityQueryOptions } from 'gdmn-orm';
import {List} from "immutable";

interface IEntityDataViewState {
  phrase: string;
  phraseError?: string;
  showSQL?: boolean;
  linkField?: string;
};

type Action = { type: 'SET_PHRASE', phrase: string }
  | { type: 'SET_PHRASE_ERROR', phraseError: string }
  | { type: 'SET_SHOW_SQL', showSQL: boolean }
  | { type: 'SET_LINK_FIELD', linkField: string };

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
  }

  return state;
};

export const EntityDataView = CSSModules( (props: IEntityDataViewProps): JSX.Element => {

  const { url, entityName, rs, masterRs, entity, masterEntity, dispatch, viewTab, erModel, gcs, history, gridColors } = props;
  const locked = rs ? rs.locked : false;
  const error = viewTab ? viewTab.error : undefined;
  const filter = rs && rs.filter && rs.filter.conditions.length ? rs.filter.conditions[0].value : '';
  const [gridRef, getSavedState] = useSaveGridState(dispatch, url, viewTab);
  const [MessageBox, messageBox] = useMessageBox();
  const [userColumnsSettings, setUserColumnsSettings, delUserColumnSettings] = useSettings<IUserColumnsSettings>({ type: 'GRID.v1', objectID: `${entityName}/viewForm` });
  const [gridRefEntities, getSavedStateEntities] = useSaveGridState(dispatch, url, viewTab);
  const [userColumnsSettingsEntity, setUserColumnsSettingsEntity, delUserColumnSettingsEntity] = useSettings<IUserColumnsSettings>({ type: 'GRID.v1', objectID: 'erModel/entity' });
  const fdMaster = masterRs ? masterRs.params.fieldDefs.find( fd => fd.caption === 'NAME' || fd.caption === 'USR$NAME') : undefined;
  const gcsRSMaster: GridComponentState | undefined = masterRs  && fdMaster ? {
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
  const [{ phrase, phraseError, showSQL, linkField }, viewDispatch] = useReducer(reducer, {
    phrase: rs && rs.queryPhrase
      ? rs.queryPhrase
      : entityName
      ? `покажи все ${entityName}`
      : ''
  });

  const applyPhrase = () => {
    if (erModel && entity) {
      if (phrase) {
        try {
          const tokens = nlpTokenize(phrase, true);
          const parsed = tokens.length ? nlpParse(tokens[0], sentenceTemplates) : [];
          if (parsed.length) {
            const erTranslatorRU = new ERTranslatorRU2(erModel)
            const command = erTranslatorRU.process(parsed);
            const eq = command[0] ? command[0].payload : undefined;
            if (eq) {
              dispatch(loadRSActions.attachRS({ name: entityName, eq, queryPhrase: phrase, override: true }));
            }
          }

          // const parsedText: ParsedText[] = parsePhrase(phrase);
          // const phrases = parsedText.reduce( (p, i) => i.phrase instanceof RusPhrase ? [...p, i.phrase as RusPhrase] : p, [] as RusPhrase[]);
          // if (phrases.length) {
          //   const erTranslatorRU = new ERTranslatorRU(erModel)
          //   const command = erTranslatorRU.process(phrases);
          //   const eq = command[0] ? command[0].payload : undefined;
          //   if (eq) {
          //     dispatch(loadRSActions.attachRS({ name: entityName, eq, queryPhrase: phrase, override: true }));
          //   }
          // }
        }
        catch (e) {
          viewDispatch({ type: 'SET_PHRASE_ERROR', phraseError: e.message });
        }
      } else {
        const eq = prepareDefaultEntityQuery(entity);
        dispatch(loadRSActions.attachRS({ name: entityName, eq, override: true }));
      }
    }
  };

  //этот метод вызывается для получения новых данных,
  //которые соответствуют выбранной записи в дереве или гриде мастера
  const filterByFieldLink = (value: string, row: number, lb?: number, rb?: number) => {
    if(entity && masterRs && masterEntity && linkField) {
      dispatch(rsActions.setCurrentRow({name: masterRs.name, currentRow: row}));
    }
  }


  useEffect( () => {
    if (!rs && entity) {
      applyPhrase();
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
      disabled: !rs || locked,
      iconProps: {
        iconName: 'Add'
      },
      onClick: addRecord
    },
    {
      key: `edit`,
      text: 'Edit',
      disabled: !rs || !rs.size || locked,
      iconProps: {
        iconName: 'Edit'
      },
      onClick: () => !!rs && !!rs.size && history.push(`${url}/edit/${rs.pk2s().join('-')}`)
      //commandBarButtonAs: rs && rs.size ? linkCommandBarButton(`${url}/edit/${rs.pk2s().join('-')}`) : undefined
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

  const { onSetFilter, ...gridActions } = bindGridActions(dispatch);
  const linkfields = rs && rs.params.eq ? rs.params.eq.link.fields.filter( fd => fd.links ) : [];

  return (
    <Stack horizontal styles={{root: {width: '100%', height: '100%'}}}>
        {
          rs
            ? linkfields && linkfields.length !== 0 && linkField && linkField !== ''
              ? <Stack styles={{root: {overflow: 'auto', width: '400px', height: '100%'}}}>
                  {
                    masterRs
                    ? linkfields.find( lf => lf.attribute.name === linkField)!.links![0].entity.isTree ?
                      <Tree
                        rs={masterRs}
                        load={() => {
                          masterRs ? dispatch(loadRSActions.loadMoreRsData({ name: masterRs.name, rowsCount: 5000 })) : undefined}
                        }
                        selectNode={filterByFieldLink}
                      />
                    : 
                      <div styleName="MDGridMasterTable" style={{width: '100%', height: '100%'}}>
                        { gcsRSMaster ?
                          <GDMNGrid
                            {...gcsRSMaster}
                            rs={masterRs}
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
          showSQL && rs && rs.sql &&
          <SQLForm
            rs={rs}
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
                  allowFreeform
                  autoComplete="on"
                  onChange={(_, option) => {
                    if (rs && option) {
                      if(option.key === 'noSelected') {
                        applyPhrase();
                      } else {
                        const fMR = linkfields.find( lf => lf.attribute.name === option.key.toString())!.links![0].entity;
                        if(entity && erModel) {
                          const data = entity && erModel.entities[entity.name]
                          ?
                          List(
                            Object.entries(erModel.entities[entity.name].attributes).map(
                              ([name, ent]) =>
                                ({
                                  name,
                                  description: ent.lName && ent.lName.ru ? ent.lName.ru.name : name
                                } as IDataRow)
                            )
                          )
                          :
                          List<IDataRow>();
                
                          dispatch(
                            rsActions.setRecordSet(rs.setData({
                                data,
                                masterLink: {
                                  masterName: fMR.name,
                                  values: [
                                    {
                                      fieldName: option.key.toString(),
                                      value: undefined
                                    }
                                  ]
                                }
                              })
                            )
                          );
                
                
                          const eqM = prepareDefaultEntityQuery(fMR);
                          dispatch(loadRSActions.attachRS({ name: fMR.name, eq: eqM, override: true }));
                        }
                      }
                    }
                    viewDispatch({ type: 'SET_LINK_FIELD', linkField: option ? option.key as string : '' })
                  }}
                  options={
                    linkfields.map( link => {return {key: link.attribute.name, text: link.attribute.name} as IComboBoxOption})
                  }
                />
                <TextField
                  disabled={!rs || rs.status !== TStatus.FULL}
                  label="Filter:"
                  value={filter}
                  onChange={ (_, newValue) => onSetFilter({ rs: rs!, filter: newValue ? newValue : '' }) }
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
          { rs && gcs ?
            <GDMNGrid
              {...gcs}
              columns={gcs.columns}
              rs={rs}
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
