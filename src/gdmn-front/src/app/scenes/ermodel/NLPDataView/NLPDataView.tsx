import React, { useEffect, useReducer, useCallback } from 'react';
import { INLPDataViewProps } from './NLPDataView.types';
import { CommandBar, MessageBar, MessageBarType, ICommandBarItemProps, TextField, Stack, DefaultButton, ComboBox, getTheme, Icon } from 'office-ui-fabric-react';
import { gdmnActions } from '../../gdmn/actions';
import CSSModules from 'react-css-modules';
import styles from './styles.css';
import { rsActions, TStatus, IMasterLink } from 'gdmn-recordset';
import { loadRSActions } from '@src/app/store/loadRSActions';
import { GDMNGrid, TLoadMoreRsDataEvent, TRecordsetEvent, TRecordsetSetFieldValue, IColumnsSettings, deleteGrid } from 'gdmn-grid';
import { SQLForm } from '@src/app/components/SQLForm';
import { bindGridActions } from '../utils';
import { useSaveGridState } from '../../../hooks/useSavedGridState';
import { useMessageBox } from '@src/app/components/MessageBox/MessageBox';
import { apiService } from "@src/app/services/apiService";
import { useSettings } from '@src/app/hooks/useSettings';
import { Tree } from '@src/app/components/Tree';
import { prepareDefaultEntityQuery, EntityAttribute, EntityQuery } from 'gdmn-orm';
import Split from 'react-split';
import { ERTranslatorRU3, command2Text } from 'gdmn-nlp-agent';
import { getLName } from 'gdmn-internals';

/*

Мы должны предотвратить повторный запуск (параллельное выполнение)
запросов для одного и того же рекордсета. Для этого введем в стэйте
состояние, которое будем выставлять перед началом взаимодействия с
сервером и проверять перед выполнением операций, и при формировании
пользовательского интерфейса.

состояние: INITIAL, QUERY_RS, QUERY_MASTER.

Таким образом мы имеем к обработке следующие ситуации:

1. отсутствует erModel. Мы в состоянии загрузки
   платформы или перезагрузки по hot-reloading. Выводим
   сообщение о загрузке и будем ждать пока не появится
   erModel.

   Состояние запроса скидываем до INITIAL.

   TODO: по идее после горячей перезагрузки, надо переделать
   транслятор и все объекты, которые внутри содержат ссылки на
   старую erModel. Иначе она останется в оперативной памяти.

1001. отсутствует translator. это ситуация, когда форма открывается
   для просмотра данных Entity. Создаем translator и viewTab.

101.Translator не равен prevTranslator. Изменился текст запроса.
   Или снаружи, в nlpDialog, или внутри окна. Проверяем
   поменялось ли entity в запросе. Если да, то удаляем рекорд сеты
   и гриды и начинаем всю загрузку с нуля. Если entity тот же,
   то просто подгружаем новые данные в рекордсет.

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

   Связь м-д не установлена, мы просто отображаем данные rs.

   Скидываем состояние загрузки rs в INITIAL, если оно было установлено.

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

  12. masterRs присутствует, rs присутствует, а rs.masterLink отсутствует.
    Если masterLink удалён, значит необходимо удалить и masterRs.
    Такая ситуация возникает, когда пользователь закрывает окно с отображением
    masterRs.
*/

type QueryState = 'INITIAL' | 'QUERY_RS' | 'QUERY_MASTER';

interface INLPDataViewState {
  phraseError?: string;
  showSQL?: boolean;
  queryState: QueryState;
  phrase?: string;
  prevTranslator?: ERTranslatorRU3;
};

type Action = { type: 'SET_PHRASE_ERROR', phraseError: string }
  | { type: 'SET_SHOW_SQL', showSQL: boolean }
  | { type: 'SET_PHRASE', phrase?: string }
  | { type: 'SET_QUERY_STATE', queryState: QueryState, prevTranslator?: ERTranslatorRU3, setPhrase?: boolean };

function reducer(state: INLPDataViewState, action: Action): INLPDataViewState {
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

    case 'SET_PHRASE': {
      const { phrase } = action;

      return {
        ...state,
        phrase,
        phraseError: undefined
      }
    }

    case 'SET_QUERY_STATE': {
      const { queryState, prevTranslator, setPhrase } = action;

      return {
        ...state,
        queryState,
        prevTranslator: prevTranslator ?? state.prevTranslator,
        phrase: setPhrase && prevTranslator ? prevTranslator.text.join(' ') : state.phrase,
        phraseError: undefined
      }
    }
  }
};

export const NLPDataView = CSSModules( (props: INLPDataViewProps): JSX.Element => {
  const { url, rs, dispatch, viewTab, erModel, gcs, history, gridColors, masterRs, gcsMaster, rsName, entityName } = props;
  const translator = viewTab?.translator;
  const ent = translator?.command.payload.link.entity;
  const locked = !!rs?.locked;
  const error = viewTab?.error;
  const filter = rs?.filter?.conditions[0]?.value ?? '';
  const [gridRef, getSavedState] = useSaveGridState(dispatch, url, viewTab);
  const [MessageBox, messageBox] = useMessageBox();
  const [userColumnsSettings, setColumnsSettings] = useSettings<IColumnsSettings | undefined>({ type: 'GRID.v1', objectID: ent ? `${ent.name}/viewForm` : undefined });
  const [{ phraseError, showSQL, queryState, phrase, prevTranslator }, viewDispatch] = useReducer(reducer, {
    queryState: 'INITIAL'
  });

  const applyTranslator = useCallback( (masterLink?: IMasterLink) => {
    if (erModel && translator) {
      let eq;

      if (masterLink && masterLink.detailAttribute && masterLink.value !== undefined) {
        // так мы делаем копию объекта, чтобы не изменить исходный
        eq = EntityQuery.inspectorToObject(erModel, translator.command.payload.inspect());
        eq.addWhereCondition({
          equals: [{
            alias: eq.link.alias,
            attribute: masterLink.detailAttribute,
            value: masterLink.value
          }]
        });
      } else {
        eq = translator.command.payload;
      }

      viewDispatch({ type: 'SET_QUERY_STATE', queryState: 'QUERY_RS', prevTranslator: translator, setPhrase: true  });
      dispatch(loadRSActions.attachRS({ name: rsName, eq, override: true, masterLink }));
    }
  }, [erModel, translator]);

  const applyPhrase = useCallback( (text?: string) => {
    if (erModel && text) {
      try {
        let newTranslator = new ERTranslatorRU3({ erModel, processUniform: true }).processText(text);

        if (entityName && newTranslator.command.payload.link.entity.name !== entityName) {
          viewDispatch({ type: 'SET_PHRASE_ERROR', phraseError: "Can't change entity." });
        } else {
          if (!viewTab) {
            dispatch(gdmnActions.addViewTab({
              url,
              caption: `${entityName}`,
              canClose: true,
              translator: newTranslator
            }));
          } else {
            dispatch(gdmnActions.updateViewTab({
              url,
              viewTab: {
                translator: newTranslator
              }
            }));
          }
        }
      }
      catch (e) {
        viewDispatch({ type: 'SET_PHRASE_ERROR', phraseError: e.message });
      }
    }
  }, [erModel, translator, viewTab]);

  useEffect( () => {
    const log = (step: number) =>
      console.log(`${step} -- ${queryState}${translator ? ',translator' : ''}${rs ? ',rs' : ''}${rs?.masterLink ? ',masterLink' : ''}${rs?.masterLink?.value ? ',value' : ''}${masterRs ? ',masterRs' : ''}`)

    // 1
    if (!erModel) {
      if (queryState !== 'INITIAL') {
        viewDispatch({ type: 'SET_QUERY_STATE', queryState: 'INITIAL' });
      }
      log(1);
      return;
    }

    // 1001
    if (!translator?.valid) {
      if (!entityName) {
        throw new Error('Entity name isn\'t specified.')
      }

      applyPhrase(`Покажи все ${entityName}`);

      log(1001);
      return;
    }

    // 101
    if (prevTranslator !== translator) {
      if (prevTranslator?.command.payload.link.entity !== translator.command.payload.link.entity) {
        if (rs) {
          dispatch( dispatch => {
            dispatch(rsActions.deleteRecordSet({ name: rs.name }));

            if (gcs) {
              dispatch(deleteGrid({ name: rs.name }));
            }

            if (masterRs) {
              dispatch(rsActions.deleteRecordSet({ name: masterRs.name }));

              if (gcsMaster) {
                dispatch(deleteGrid({ name: masterRs.name }));
              }
            }

            dispatch(gdmnActions.updateViewTab({
              url,
              viewTab: {
                caption: getLName(translator.command.payload.link.entity.lName, ['ru']),
                rs: undefined
              }
            }));
          });
        } else {
          dispatch(gdmnActions.updateViewTab({
            url,
            viewTab: {
              caption: getLName(translator.command.payload.link.entity.lName, ['ru'])
            }
          }));
        }

        viewDispatch({
          type: 'SET_QUERY_STATE',
          queryState: 'INITIAL',
          prevTranslator: translator,
          setPhrase: true
        });
      } else {
        applyTranslator();
      }

      log(101);
      return;
    }

    // 2
    if (!rs && !masterRs) {
      if (queryState === 'INITIAL') {
        // 2, a)
        // TODO: add reading of user settings

        // 2, b)
        applyTranslator();
      }
      log(2);
      return;
    }

    if (viewTab?.rs?.[0] !== rs?.name || viewTab?.rs?.[1] !== masterRs?.name) {
      if (rs && masterRs) {
        dispatch(gdmnActions.updateViewTab({
          url,
          viewTab: {
            rs: [rs.name, masterRs.name]
          }
        }));
      }
      else if (rs) {
        dispatch(gdmnActions.updateViewTab({
          url,
          viewTab: {
            rs: [rs.name]
          }
        }));
      }
      else if (masterRs) {
        dispatch(gdmnActions.updateViewTab({
          url,
          viewTab: {
            rs: [masterRs.name]
          }
        }));
      }
    }

    // 3
    if (masterRs && !rs) {
      // TODO
      log(3);
      return;
    }


    // 4
    if (rs && !masterRs && !rs.masterLink) {
      if (queryState === 'QUERY_RS') {
        viewDispatch({ type: 'SET_QUERY_STATE', queryState: 'INITIAL' });
      }
      log(4);
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
        dispatch( dispatch => {
          dispatch(rsActions.deleteRecordSet({ name: masterRs.name }));

          if (gcsMaster) {
            dispatch(deleteGrid({ name: masterRs.name }));
          }
        });
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
    if (rs && rs.masterLink && masterRs && masterRs.pkValue()[0] === rs.masterLink.value) {
      if (queryState !== 'INITIAL') {
        viewDispatch({ type: 'SET_QUERY_STATE', queryState: 'INITIAL' });
      }

      log(9);
      return;
    }

    // 11
    if (masterRs && rs && rs.masterLink) {
      if (queryState === 'QUERY_MASTER' && rs.masterLink.value === undefined) {
        viewDispatch({ type: 'SET_QUERY_STATE', queryState: 'INITIAL' });
      }
      else if (queryState === 'INITIAL') {
        applyTranslator({ ...rs.masterLink, value: masterRs.pkValue()[0] });
      }

      log(11);
      return;
    }

    //12
    if(masterRs && rs && !rs.masterLink) {
      if (queryState === 'INITIAL') {
        dispatch( dispatch => {
          dispatch(rsActions.deleteRecordSet({ name: masterRs.name }));

          if (gcsMaster) {
            dispatch(deleteGrid({ name: masterRs.name }));
          }
        });
      }
    }

    throw new Error('Unknown state');
  }, [erModel, translator, prevTranslator, rs, masterRs, queryState, viewTab, applyPhrase, applyTranslator]);

  const addRecord = () => {
    if (ent) {
      const f = async () => {
        const result = await apiService.getNextID({withError: false});
        const newID = result.payload.result!.id;
        if (newID) {
          history.push(`/spa/gdmn/entity/${ent.name}/add/${newID}`);
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
      onClick: () => !!rs && !!rs.size && ent && history.push(`/spa/gdmn/entity/${ent.name}/edit/${rs.pk2s().join('-')}`)
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
      key: 'command',
      disabled: !translator,
      text: 'Make command',
      iconProps: {
        iconName: 'FileComment'
      },
      onClick: () => viewDispatch({ type: 'SET_PHRASE', phrase: translator && command2Text(translator.command) })
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
              background: getTheme().palette.white
            }
          }}
        >
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
              ent && Object
                .values(ent.attributes)
                .filter( attr => attr instanceof EntityAttribute )
                .map( attr => ({ key: attr.name, text: attr.name, data: attr }) )
            }
          />
          <TextField
            disabled={rs?.status !== TStatus.FULL}
            label="Filter:"
            value={filter}
            onChange={ (_, newValue) => onSetFilter({ rs: rs!, filter: newValue ?? '' }) }
          />
          <Stack.Item grow={1}>
            <Stack horizontal verticalAlign="end" tokens={{ childrenGap: '8px' }}>
              <TextField
                styles={{
                  root: {
                    width: '100%'
                  }
                }}
                label="Query:"
                value={phrase}
                onChange={ (_, phrase) => viewDispatch({ type: 'SET_PHRASE', phrase }) }
                errorMessage={ phraseError ? phraseError : undefined }
              />
              <DefaultButton
                disabled={!erModel && !translator}
                onClick={ () => applyPhrase(phrase) }
              >
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
          columnsSettings={userColumnsSettings}
          onSetColumnsSettings={ userSettings => userSettings ? setColumnsSettings(userSettings) : setColumnsSettings(undefined) }
        />
        : null
      }
    </div>
  </div>
  }

  return translator && masterRs && rs && rs.masterLink && rs.masterLink.detailAttribute
    ? <Split
        sizes={[25, 75]}
        gutterSize={8}
        gutterAlign="center"
        minSize={[ 100 , 500 ]}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'w-resize',
          display: 'flex',
          flexDirection: 'row',
          background: getTheme().palette.themeDark
        }}
      >
        <div style={{width: '100%', height: '100%', display: 'flex', cursor: 'default', flexDirection: 'column', background: getTheme().palette.white}}>
        <Icon
          iconName='ChromeClose'
          onClick={ () => {
            dispatch( dispatch => {
              dispatch(rsActions.deleteRecordSet({ name: rs.name }));

              if (gcs) {
                dispatch(deleteGrid({ name: rs.name }));
              }

              if (masterRs) {
                dispatch(rsActions.deleteRecordSet({ name: masterRs.name }));

                if (gcsMaster) {
                  dispatch(deleteGrid({ name: masterRs.name }));
                }
              }

              dispatch(gdmnActions.updateViewTab({
                url,
                viewTab: {
                  rs: undefined
                }
              }));
            });
          }}
          style={{
            background: getTheme().palette.red,
            color: getTheme().palette.white,
            fontSize: '12px',
            width: '16px',
            height: '16px',
            alignSelf: 'flex-end',
            paddingTop: '1px',
            paddingLeft: '2px'
          }}
        />
        {(rs.masterLink.detailAttribute as EntityAttribute).entities[0].isTree
          ? <div style={{width: '100%', height: '100%', overflow: 'auto'}}>
              <Tree
                rs={masterRs}
                load={ () => dispatch(loadRSActions.loadMoreRsData({ name: masterRs.name, rowsCount: 500 })) }
                selectNode={ currentRow => {
                  currentRow >= 0
                    ? dispatch(rsActions.setCurrentRow({ name: masterRs.name, currentRow }))
                    : undefined
                } }
              />
            </div>
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
      <div style={{width: '100%', height: '100%'}}>
        {contentView()}
      </div>
      </Split>
    : contentView()
}, styles, { allowMultiple: true });
