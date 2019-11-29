import React, { useEffect, useReducer, useState, useCallback } from 'react';
import { IEntityDataViewProps } from './EntityDataView.types';
import { CommandBar, MessageBar, MessageBarType, ICommandBarItemProps, TextField, Stack, DefaultButton, ComboBox, getTheme, flatten } from 'office-ui-fabric-react';
import { gdmnActions } from '../../gdmn/actions';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { rsActions, TStatus, IMasterLink } from 'gdmn-recordset';
import { loadRSActions } from '@src/app/store/loadRSActions';
import { nlpTokenize, nlpParse, sentenceTemplates } from 'gdmn-nlp';
import { ERTranslatorRU2 } from 'gdmn-nlp-agent';
import { GDMNGrid, TLoadMoreRsDataEvent, TRecordsetEvent, TRecordsetSetFieldValue, IUserColumnsSettings } from 'gdmn-grid';
import { SQLForm } from '@src/app/components/SQLForm';
import { bindGridActions } from '../utils';
import { useSaveGridState } from './useSavedGridState';
import { useMessageBox } from '@src/app/components/MessageBox/MessageBox';
import { apiService } from "@src/app/services/apiService";
import { useSettings } from '@src/app/hooks/useSettings';
import { Tree } from '@src/app/components/Tree';
import { prepareDefaultEntityQuery, EntityAttribute, Attribute } from 'gdmn-orm';
import SplitPane from '@src/app/components/SplitPane';

/*

Мы должны предотвратить повторный запуск (параллельное выполнение)
запросов для одного и того же рекордсета. Для этого введем в стэйте
состояние, которое будем выставлять перед началом взаимодействия с
сервером и проверять перед выполнением операций, и при формировании
пользовательского интерфейса.

состояние: INITIAL, QUERY_RS, QUERY_MASTER.

Таким образом мы имеем к обработке следующие ситуации:

1. отсутствует erModel и/или entity. Мы в состоянии загрузки
   платформы или перезагрузки по hot-reloading. Выводим
   сообщение о загрузке и будем ждать пока не появится
   erModel.

   Состояние запроса скидываем до INITIAL.

2. rs отсутствует. masterRs отсутствует. Мы в состоянии
   начальной инициализации формы.

   Проверим, не идет ли уже выполнение запроса к серверу.
   Если уже идет, то ничего не предпринимаем, выходим.

   Обратимся к сохраненным настройкам, может пользователь
   уже настроил эту форму как мастер-дитэйл?

   а) Если да, то из настроек возьмем информацию для
   конструирования EntityQuery для masterRs. Запустим
   запрос на выполнение. Надо будет в middleware выполнения
   запроса и формирования рекодсета еще предусмотреть возможность
   сразу устанавливать курсор на заданную запись, чтобы
   пользователь мог открыть форму прямо в том состоянии, в котором
   он ее закрыл. Подумать над этим вопросом.

   б) Если нет, то формируем EntityQuery для загрузки rs и
   отсылаем ее в middleware.

   Перед отсылкой запроса в мидлвэр, выставляем
   в стэйте состояние QUERY_MASTER, чтобы предотвратить
   повторный запуск.

3. masterRs присутствует. rs отсутствует. Мы в процессе загрузки
   пользовательских настроек, см. п. 2, а)

   Проверяем, не находимся ли мы уже в состоянии загрузки rs
   (состояние QUERY_RS).

   Формируем EntityQuery для загрузки rs с учетом текущей записи
   в masterRs. Отсылаем ее в middleware. API middleware надо
   доработать, чтобы была возможность передать masterLink
   или информацию для его формирования.

   Перед выполнением запроса (отсылкой его в мидлвэр), выставляем
   в стэйте соответствующее состояние, чтобы предотвратить
   повторный запуск.

4. masterRs отсутствует. rs присутствует. masterLink отсутствует.
   Фраза в rs соответствует фразе в стэйте формы.

   Связь м-д не установлена, мы просто отображаем данные rs.

   Скидываем состояние загрузки rs в INITIAL, если оно было установлено.

5. masterRs отсутствует. rs присутствует. masterLink отсутствует.
   Фраза в rs не соответствует фразе в стэйте формы.

   Если состояние загрузки INITIAL, то формируем новую EntityQuery с учетом
   измененной фразы. Выставляем состояние загрузки и отсылаем запрос в
   мидлвэр.

6. masterRs отсутствует. rs присутствует. masterLink присутствует.

   Это промежуточное состояние установки связи м-д. masterLink
   создается в момент выбора пользователем позиции в выпадающем списке.

   Проверяем, не находимся ли мы уже в состоянии загрузки.

   а) Если да, то выходим из обработчика.

   б) Если нет, значит пользователь выбрал поле для связи
   и теперь мы должны загрузить masterRs. Формируем для него
   EntityQuery, устанавливаем состояние загрузки и посылаем
   экшен в мидлвэр.

7. masterRs присутствует. rs присутствует. masterLink присутствует.
   значение masterLink.masterName не соответствует masterRs.name.

   Это ситуация, когда связь м-д была установлена по одному полю
   и пользователь выбрал из выпадающего списка другое.

   Проверяем, если мы в состоянии загрузки, то выходим из обработчика.

   Если нет, то удаляем masterRs.

8. masterRs присутствует. rs присутствует. masterLink присутствует,
   masterRs пуст.

   Скидываем состояние загрузки rs, если оно было установлено.

   Очищаем rs, если он не пуст.

9. masterRs присутствует. rs присутствует. masterLink присутствует,
   значение из мастер линк соответствует текущей записи из masterRs.
   Фраза из rs соответствует фразе из стэйта формы.

   Связь м-д установлена. Содержимое детального набора данных
   соответствует текущей записи в мастер рекордсете.

   Скидываем состояние загрузки rs, если оно было установлено.

10. masterRs присутствует. rs присутствует. masterLink присутствует,
   значение из мастер линк соответствует текущей записи из masterRs.
   Фраза из rs не соответствует фразе из стэйта формы.

   Если состояние загрузки INITIAL, то формируем новую EntityQuery с учетом
   измененной фразы. Выставляем состояние загрузки и отсылаем запрос в
   мидлвэр.

11. masterRs присутствует. rs присутствует. masterLink присутствует,
   значение из мастер линк не соответствует текущей записи из masterRs.

   Это либо ситуация установки связи м-д, когда мы загрузили мастер
   рекордсет, но еще не синхронизировали с ним детальный, либо
   ситуация, когда пользователь переместил курсор в мастер рекордсете.

   Проверяем, не находимся ли мы уже в состоянии загрузки rs.

   а) если да, то выходим из обработчика.

   б) если нет, то формируем EntityQuery для загрузки rs с учетом
   текущей записи в masterRs. Выставляем состояние QUERY_RS и отсылаем
   запрос в middleware.
*/

type QueryState = 'INITIAL' | 'QUERY_RS' | 'QUERY_MASTER';

interface IEntityDataViewState {
  phraseError?: string;
  showSQL?: boolean;
  queryState: QueryState;
};

type Action = { type: 'SET_PHRASE_ERROR', phraseError: string }
  | { type: 'SET_SHOW_SQL', showSQL: boolean }
  | { type: 'SET_QUERY_STATE', queryState: QueryState };

function reducer(state: IEntityDataViewState, action: Action): IEntityDataViewState {
  switch (action.type) {
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

    case 'SET_QUERY_STATE': {
      const { queryState } = action;

      return {
        ...state,
        queryState
      }
    }
  }
};

export const EntityDataView = CSSModules( (props: IEntityDataViewProps): JSX.Element => {
  const { url, entityName, rs, entity, dispatch, viewTab, erModel, gcs, history, gridColors, masterRs, gcsMaster } = props;
  const locked = rs ? rs.locked : false;
  const error = viewTab ? viewTab.error : undefined;
  const filter = rs && rs.filter && rs.filter.conditions.length ? rs.filter.conditions[0].value : '';
  const [gridRef, getSavedState] = useSaveGridState(dispatch, url, viewTab);
  const [MessageBox, messageBox] = useMessageBox();
  const [userColumnsSettings, setUserColumnsSettings, delUserColumnSettings] = useSettings<IUserColumnsSettings>({ type: 'GRID.v1', objectID: `${entityName}/viewForm` });
  const [{ phraseError, showSQL, queryState }, viewDispatch] = useReducer(reducer, { queryState: 'INITIAL' });
  const [phrase, setPhrase] = useState(rs && rs.queryPhrase
    ? rs.queryPhrase
    : entityName
    ? `покажи все ${entityName}`
    : ''
  );

  const applyPhrase = useCallback( (masterLink?: IMasterLink) => {
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
              if (masterLink && masterLink.detailAttribute && masterLink.value !== undefined) {
                eq.addWhereCondition({
                  equals: [{
                    alias: eq.link.alias,
                    attribute: masterLink.detailAttribute,
                    value: masterLink.value
                  }]
                });
              }

              viewDispatch({ type: 'SET_QUERY_STATE', queryState: 'QUERY_RS' });
              dispatch(loadRSActions.attachRS({ name: entityName, eq, queryPhrase: phrase, override: true, masterLink }));
            }
          }
        }
        catch (e) {
          viewDispatch({ type: 'SET_PHRASE_ERROR', phraseError: e.message });
        }
      } else {
        const eq = prepareDefaultEntityQuery(entity, undefined, undefined, undefined, masterLink?.detailAttribute, masterLink?.value);
        viewDispatch({ type: 'SET_QUERY_STATE', queryState: 'QUERY_RS' });
        dispatch(loadRSActions.attachRS({ name: entityName, eq, override: true, masterLink }));
      }
    }
  }, [erModel, entity, phrase]);

  useEffect( () => {
    const log = (step: number) =>
      console.log(`${step} -- ${queryState}${entity ? ',entity' : ''}${rs ? ',rs' : ''}${rs?.masterLink ? ',masterLink' : ''}${rs?.masterLink?.value ? ',value' : ''}${masterRs ? ',masterRs' : ''}`)

    // 1
    if (!erModel || !entity) {
      if (queryState !== 'INITIAL') {
        viewDispatch({ type: 'SET_QUERY_STATE', queryState: 'INITIAL' });
      }
      log(1);
      return;
    }

    // 2
    if (!rs && !masterRs) {
      if (queryState === 'INITIAL') {
        // 2, a)
        // TODO: add reading of user settings

        // 2, b)
        applyPhrase();
      }
      log(2);
      return;
    }

    // 3
    if (masterRs && !rs) {
      // TODO
      log(3);
      return;
    }

    // 4
    if (rs && !masterRs && !rs.masterLink && rs.queryPhrase === phrase) {
      if (queryState === 'QUERY_RS') {
        viewDispatch({ type: 'SET_QUERY_STATE', queryState: 'INITIAL' });
      }
      log(4);
      return;
    }

    // 5
    if (rs && !masterRs && !rs.masterLink && rs.queryPhrase !== phrase) {
      if (queryState === 'INITIAL') {
        applyPhrase();
      }
      log(5);
      return;
    }

    // 6
    if (rs && rs.masterLink && !masterRs) {
      if (queryState === 'INITIAL') {
        viewDispatch({ type: 'SET_QUERY_STATE', queryState: 'QUERY_MASTER' });

        const detailAttr = rs.masterLink.detailAttribute as EntityAttribute;
        const masterEntity = detailAttr.entities[0];
        // TODO: нам не нужны все поля из masterEntity.
        // только ИД, поля для деревьев и название.
        const eq = prepareDefaultEntityQuery(masterEntity);
        dispatch(loadRSActions.attachRS({ name: rs.masterLink.masterName, eq, override: true }));
      }

      log(6);
      return;
    }

    // 7
    if (rs && rs.masterLink && masterRs && masterRs.name !== rs.masterLink.masterName) {
      if (queryState === 'INITIAL') {
        dispatch(loadRSActions.deleteRS({ name: masterRs.name }));
      }

      log(7);
      return;
    }

    // 8
    if (rs && rs.masterLink && masterRs && !masterRs.size) {
      if (queryState !== 'INITIAL') {
        viewDispatch({ type: 'SET_QUERY_STATE', queryState: 'INITIAL' });
      }

      if (rs.size) {
        dispatch(rsActions.setData({ name: rs.name, data: undefined }));
      }

      log(8);
      return;
    }

    // 9
    if (rs && rs.masterLink && masterRs && masterRs.pkValue()[0] === rs.masterLink.value && rs.queryPhrase === phrase) {
      if (queryState !== 'INITIAL') {
        viewDispatch({ type: 'SET_QUERY_STATE', queryState: 'INITIAL' });
      }
      log(9);
      return;
    }

    // 10
    if (rs && rs.masterLink && masterRs && masterRs.pkValue()[0] === rs.masterLink.value && rs.queryPhrase !== phrase) {
      if (queryState === 'INITIAL') {
        applyPhrase({ ...rs.masterLink, value: masterRs.pkValue()[0] });
      }
      log(10);
      return;
    }

    // 11
    if (masterRs && rs && rs.masterLink) {
      if (queryState === 'QUERY_MASTER' && rs.masterLink.value === undefined) {
        viewDispatch({ type: 'SET_QUERY_STATE', queryState: 'INITIAL' });
      }
      else if (queryState === 'INITIAL') {
        applyPhrase({ ...rs.masterLink, value: masterRs.pkValue()[0] });
      }

      log(11);
      return;
    }

    //12
    if(masterRs && rs && !rs.masterLink) {
      if (queryState === 'INITIAL') {
        dispatch(loadRSActions.deleteRS({ name: masterRs.name }));
      }
      //dispatch(loadRSActions.attachRS({ name: entityName, eq, queryPhrase: phrase, override: true, masterLink }));
    }

    throw new Error('Unkonw state');
  }, [erModel, rs, masterRs, entity, queryState]);

  useEffect( () => {
    if (rs || masterRs) {
      const rsNames: string[] = [];

      if (masterRs) {
        rsNames.push(masterRs.name);
      }

      if (rs) {
        rsNames.push(rs.name);
      }

      if (!viewTab) {
        dispatch(gdmnActions.addViewTab({
          url,
          caption: `${entityName}`,
          canClose: true,
          rs: rsNames
        }));
      }
      else if (viewTab.rs?.[0] !== rsNames[0] || viewTab.rs?.[1] !== rsNames[1]) {
        dispatch(gdmnActions.updateViewTab({
          url,
          viewTab: {
            rs: rsNames
          }
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
  }, [rs, masterRs, viewTab]);

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

  const contentView = () => {
    return <div styleName="SGrid">
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
          {console.log(rs?.masterLink)}
          <ComboBox
            label="Link field:"
            placeholder="Select link field"
            allowFreeform
            autoComplete="on"
            selectedKey={rs?.masterLink?.detailAttribute?.name}
            onChange={ queryState !== 'INITIAL' ? undefined : (_, option) => {
              if (option && rs) {
                dispatch(rsActions.setRecordSet(rs.duplicate({
                  masterLink: {
                    masterName: `${rs.name}-${option.key}-master`,
                    detailAttribute: option.data as EntityAttribute,
                    value: undefined
                  }
                })));
              }
            } }
            options={
              entity && Object
                .values(entity.attributes)
                .filter( attr => attr instanceof EntityAttribute )
                .map( attr => ({ key: attr.name, text: attr.name, data: attr }) )
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
                onChange={ (_, newValue) => setPhrase(newValue ? newValue : '') }
                errorMessage={ phraseError ? phraseError : undefined }
              />
              <DefaultButton onClick={ () => applyPhrase() }>
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
  }

  return (
    <Stack horizontal styles={{root: {width: '100%', height: '100%'}}}>
      {
        masterRs && rs && rs.masterLink && entity && rs.masterLink.detailAttribute
        ? <SplitPane>
            <SplitPane.Left>
              <div style={{display: 'flex', flexDirection: 'row-reverse'}}>
                <div
                  style={{
                    background: getTheme().palette.red,
                    color: getTheme().palette.white,
                    width: '18px',
                    height: '18px',
                    textAlign: 'center',
                    justifyContent: 'flex-end',
                    cursor: 'pointer'
                  }}
                  onClick={() => dispatch(rsActions.setRecordSet(rs.duplicate({
                    masterLink: undefined
                  })))}
                >x</div>
                {(rs.masterLink.detailAttribute as EntityAttribute).entities[0].isTree
                  ? <Tree
                      rs={masterRs}
                      load={ () => dispatch(loadRSActions.loadMoreRsData({ name: masterRs.name, rowsCount: 500 })) }
                      selectNode={ currentRow => {
                        dispatch(rsActions.setCurrentRow({ name: masterRs.name, currentRow }));
                      } }
                    />
                  : <div styleName="MDGridMasterTable" style={{width: '100%', height: '100%'}}>
                      { gcsMaster
                        ? <GDMNGrid
                          {...gcsMaster}
                          rs={masterRs}
                          columns={gcsMaster.columns}
                          {...gridActions}
                          colors={gridColors}
                        />
                        : <div>Not found grid rs-master</div>
                    }
                  </div>
                  }
                </div>
            </SplitPane.Left>
            <SplitPane.Right>
              {contentView()}
            </SplitPane.Right>
          </SplitPane>
        
        : contentView()
      }
    </Stack>
  );
}, styles, { allowMultiple: true });
