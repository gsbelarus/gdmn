import React, { useEffect, useReducer, useRef } from 'react';
import { IEntityDataViewProps } from './EntityDataView.types';
import { CommandBar, MessageBar, MessageBarType, ICommandBarItemProps, TextField, Stack, DefaultButton, ComboBox, IComboBoxOption } from 'office-ui-fabric-react';
import { gdmnActions } from '../../gdmn/actions';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { rsActions, TStatus, IDataRow, IMasterLink } from 'gdmn-recordset';
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
import { prepareDefaultEntityQuery, EntityQuery, EntityQueryOptions, IEntityQueryWhereValue } from 'gdmn-orm';
import {List} from "immutable";

interface IEntityDataViewState {
  phrase: string;
  phraseError?: string;
  showSQL?: boolean;
};

type Action = { type: 'SET_PHRASE', phrase: string }
  | { type: 'SET_PHRASE_ERROR', phraseError: string }
  | { type: 'SET_SHOW_SQL', showSQL: boolean };

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
  }

  return state;
};

export const EntityDataView = CSSModules( (props: IEntityDataViewProps): JSX.Element => {

  const { url, entityName, rs, masterRs, entity, masterEntity, dispatch, viewTab, erModel, gcs, history, gridColors } = props;
  const locked = rs ? rs.locked : false;
  const error = viewTab ? viewTab.error : undefined;
  const filter = rs && rs.filter && rs.filter.conditions.length ? rs.filter.conditions[0].value : '';
  const masterLinkRef = useRef<IMasterLink | undefined>(rs && rs.masterLink ? rs.masterLink : undefined);
  const linkFieldRef = useRef<string | undefined>(undefined);
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
  const [{ phrase, phraseError, showSQL }, viewDispatch] = useReducer(reducer, {
    phrase: rs && rs.queryPhrase
      ? rs.queryPhrase
      : entityName
      ? `покажи все ${entityName}`
      : ''
  });

  const newEQ = (eq: EntityQuery) => {
    const whereObj = eq.options && eq.options.where ? eq.options.where : [];
    const orderObj = eq.options && eq.options.order ? eq.options.order : undefined;
    if(rs && rs.masterLink && entity) {
      rs.masterLink.values.forEach( ml => {
        const findAttr = entity.attributes[ml.fieldName];
        if(whereObj[0] && whereObj[0].equals) {
          whereObj[0].equals.push({
              alias: eq.link.alias,
              attribute: findAttr,
              value: ml.value
            } as IEntityQueryWhereValue)
        } else {
          whereObj.push({
            equals: [{
              alias: eq.link.alias,
              attribute: findAttr,
              value: ml.value
            } as IEntityQueryWhereValue]
          })
        }
      })
    }
    return new EntityQuery(
      eq.link,
      new EntityQueryOptions( undefined, undefined, whereObj, orderObj )
    );
  }

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
              dispatch(loadRSActions.attachRS({ name: entityName, eq: newEQ(eq), queryPhrase: phrase, override: true, masterLink: masterLinkRef.current }));
            }
          }
        }
        catch (e) {
          viewDispatch({ type: 'SET_PHRASE_ERROR', phraseError: e.message });
        }
      } else {
        dispatch(loadRSActions.attachRS({ name: entityName, eq: newEQ(prepareDefaultEntityQuery(entity)), override: true, masterLink: masterLinkRef.current }));
      }
    }
    // if (erModel && entity) {
    //   if (phrase) {
    //     try {
    //       const parsedText: ParsedText[] = parsePhrase(phrase);
    //       const phrases = parsedText.reduce( (p, i) => i.phrase instanceof RusPhrase ? [...p, i.phrase as RusPhrase] : p, [] as RusPhrase[]);
    //       if (phrases.length) {
    //         const erTranslatorRU = new ERTranslatorRU(erModel)
    //         const command = erTranslatorRU.process(phrases);
    //         const eq = command[0] ? command[0].payload : undefined;
    //         if (eq) {
    //           dispatch(loadRSActions.attachRS({ name: entityName, eq, queryPhrase: phrase, override: true }));
    //         }
    //       }
    //     }
    //     catch (e) {
    //       viewDispatch({ type: 'SET_PHRASE_ERROR', phraseError: e.message });
    //     }
    //   } else {
    //     const eq = prepareDefaultEntityQuery(entity);
    //     dispatch(loadRSActions.attachRS({ name: entityName, eq, override: true }));
    //   }
    // }
  };

  const setMasterLink = (attrName?: string, value?: string) => {
    const fMR = attrName ? linkfields.find( lf => lf.attribute.name === attrName)!.links![0].entity : undefined;
    if(entity && erModel && rs) {
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

      const newMasterLink = attrName && fMR ? {
        masterName: fMR.name,
        values: [
          {
            fieldName: attrName,
            value
          }
        ]
      } as IMasterLink : undefined;
      newMasterLink
      ? dispatch(rsActions.setRecordSet(
        rs.setData({
          data,
          masterLink: newMasterLink
        })
      ))
      : dispatch(rsActions.setRecordSet(
        rs.deleteMasterLink({
          data
        })
      ));


      if(masterLinkRef.current !== newMasterLink) {
        if(masterLinkRef.current && (!newMasterLink || masterLinkRef.current.masterName !== newMasterLink.masterName)) {
          dispatch(loadRSActions.deleteRS({name: `${masterLinkRef.current.masterName}-master`}));
        }
      }
        masterLinkRef.current = newMasterLink;
    }
  }

  //этот метод вызывается для получения новых данных,
  //которые соответствуют выбранной записи в дереве или гриде мастера
  const filterByFieldLink = (row: number) => {
    if(entity && masterRs && masterEntity && linkFieldRef.current) {
      dispatch(rsActions.setCurrentRow({name: masterRs.name, currentRow: row}));
    }
  }

  useEffect(() => {
    if(masterRs && linkFieldRef.current) {
      const fdID = masterRs.params.fieldDefs.find(fd => fd.caption === 'ID');
      const value = fdID ? masterRs.getString(fdID.fieldName, masterRs.currentRow) : undefined;
      if( !(rs && rs.masterLink && rs.masterLink.values.find(v => v.fieldName === linkFieldRef.current && v.value === value))) {
        setMasterLink(linkFieldRef.current, value);
      }
    }
  }, [masterRs])

  useEffect(() => {
    applyPhrase();
  }, [masterLinkRef.current])

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
      onClick: () => rs && rs.eq && dispatch(loadRSActions.attachRS({ name: rs.name, eq: rs.eq, override: true, masterLink: rs ? rs.masterLink : undefined }))
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
  const lf = linkfields.find(lf => masterLinkRef.current && masterLinkRef.current.values.find(mlr => mlr.fieldName === lf.attribute.name));
  linkFieldRef.current = lf ? lf.attribute.name : undefined;

  return (
    <Stack horizontal styles={{root: {width: '100%', height: '100%'}}}>
        {
          rs
            ? linkfields && linkfields.length !== 0 && linkFieldRef.current && linkFieldRef.current !== '' && linkFieldRef.current && linkFieldRef.current !== 'noSelected' || masterLinkRef.current
              ? <Stack styles={{root: {overflow: 'auto', width: '400px', height: '100%'}}}>
                  {
                    masterRs
                    ? linkfields.find( lf =>
                      linkFieldRef.current
                        ? lf.attribute.name === linkFieldRef.current
                        : masterLinkRef.current && masterLinkRef.current.values.find(mlr => mlr.fieldName === lf.attribute.name)
                      )!.links![0].entity.isTree
                      ? <Tree
                          rs={masterRs}
                          load={() => {
                            masterRs ? dispatch(loadRSActions.loadMoreRsData({ name: masterRs.name, rowsCount: 5000 })) : undefined}
                          }
                          selectNode={filterByFieldLink}
                        />
                      : <div styleName="MDGridMasterTable" style={{width: '100%', height: '100%'}}>
                          { gcsRSMaster
                            ? <GDMNGrid
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
                            />
                            : <div>Not found grid rs-master</div>
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
                  selectedKey={linkFieldRef.current}
                  onChange={(_, option) => {
                    if (rs && option) {
                      if(option.key === 'noSelected') {
                        setMasterLink();
                      } else {
                        const fMR = linkfields.find( lf => lf.attribute.name === option.key)!.links![0].entity;
                        const eqM = prepareDefaultEntityQuery(fMR);
                        setMasterLink(option.key.toString());
                        dispatch(loadRSActions.attachRS({ name: fMR.name, eq: eqM, sufix: 'master' }));
                      }
                    }
                    linkFieldRef.current = option ? option.key as string : undefined;
                  }}
                  options={
                    linkfields.length !== 0
                      ? [{key: 'noSelected', text: 'Не выбрано'} as IComboBoxOption, ...linkfields.map( link => {return {key: link.attribute.name, text: link.attribute.name} as IComboBoxOption})]
                      : undefined
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
