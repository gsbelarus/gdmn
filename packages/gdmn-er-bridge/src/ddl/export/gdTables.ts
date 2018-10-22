/*

  Массив получен запросом:

  SELECT
    '''' || ar.relationname || ''',' || IIF(ar.LNAME <> r.rdb$relation_name, '  // ' || ar.LNAME, '')
  FROM
    rdb$relations r JOIN at_relations ar
      ON rdb$relation_name = ar.RELATIONNAME
  WHERE
    NOT ar.RELATIONNAME CONTAINING '$'
    AND
    r.rdb$view_source IS NULL
  ORDER BY
    1

*/

export const gedeminTables = [
  'AC_ACCANALYTICSEXT',
  'AC_ACCOUNT',  // План счетов
  'AC_ACCT_CONFIG',
  'AC_ACCVALUE',
  'AC_AUTOENTRY',
  'AC_AUTOTRRECORD',
  'AC_COMPANYACCOUNT',  // План счетов для организации
  'AC_ENTRY',  // Проводки
  'AC_ENTRY_BALANCE',
  'AC_GENERALLEDGER',
  'AC_G_LEDGERACCOUNT',
  'AC_INCORRECT_RECORD',
  'AC_LEDGER_ACCOUNTS',
  'AC_LEDGER_ENTRIES',
  'AC_QUANTITY',  // Количественные показатели
  'AC_RECORD',  // Проводки (заголовок)
  'AC_TRANSACTION',  // Типовые операции
  'AC_TRRECORD',  // Типовые проводки (заголовок)
  'AT_CHECK_CONSTRAINTS',
  'AT_DATABASE',
  'AT_EXCEPTIONS',  // Исключения
  'AT_FIELDS',  // Домены
  'AT_GENERATORS',  // Генераторы
  'AT_INDICES',  // Индексы
  'AT_NAMESPACE',
  'AT_NAMESPACE_FILE',
  'AT_NAMESPACE_FILE_LINK',
  'AT_NAMESPACE_LINK',
  'AT_NAMESPACE_SYNC',
  'AT_OBJECT',
  'AT_PROCEDURES',  // Процедуры
  'AT_RELATIONS',  // Таблицы
  'AT_RELATION_FIELDS',  // Поля таблиц
  'AT_SETTING',  // Настройки
  'AT_SETTINGPOS',  // Позиции настроек
  'AT_SETTING_STORAGE',  // Позиция настроек для хранилища
  'AT_TRANSACTION',  // Операции  (для исполнения перед загрузкой)
  'AT_TRIGGERS',  // Триггеры
  'BN_BANKCATALOGUE',  // Картотека
  'BN_BANKCATALOGUELINE',  // Позиция картотеки
  'BN_BANKSTATEMENT',  // Банковская выписка
  'BN_BANKSTATEMENTLINE',  // Позиция банковской выписки
  'BUG_BUGBASE',  // Регистрация ошибок
  'EVT_MACROSGROUP',  // Группы макросов
  'EVT_MACROSLIST',  // Список макросов
  'EVT_OBJECT',  // Объекты (для макросов)
  'EVT_OBJECTEVENT',  // События  и методы
  'FIN_VERSIONINFO',  // Версия программы
  'FLT_COMPONENTFILTER',  // Фильтры
  'FLT_LASTFILTER',  // Последний фильтр
  'FLT_PROCEDUREFILTER',  // Процедуры для фильтров
  'FLT_SAVEDFILTER',  // Сохраненные фильтры
  'GD_AUTOTASK',
  'GD_AUTOTASK_LOG',
  'GD_AVAILABLE_ID',
  'GD_BANK',  // Банк
  'GD_BLOCK_RULE',
  'GD_COMMAND',  // Исследователь
  'GD_COMPACCTYPE',  // Типы банковских счетов
  'GD_COMPANY',  // Компания
  'GD_COMPANYACCOUNT',
  'GD_COMPANYCODE',  // Коды компании
  'GD_COMPANYSTORAGE',  // Хранилище компании
  'GD_CONST',  // Константы
  'GD_CONSTVALUE',  // Значение константы
  'GD_CONTACT',  // Контакты
  'GD_CONTACTLIST',  // Список контактов
  'GD_CURR',  // Валюты
  'GD_CURRRATE',  // Курсы валют
  'GD_DESKTOP',  // Рабочий стол
  'GD_DOCUMENT',  // Документы
  'GD_DOCUMENTLINK',  // Связанные документы
  'GD_DOCUMENTTYPE',  // Типы документов
  'GD_DOCUMENTTYPE_OPTION',
  'GD_EMPLOYEE',
  'GD_FILE',  // Файлы
  'GD_FUNCTION',  // Функции
  'GD_FUNCTION_LOG',
  'GD_GLOBALSTORAGE',  // Общее хранилище
  'GD_GOOD',  // Справочник ТМЦ
  'GD_GOODBARCODE',  // Штрих коды
  'GD_GOODGROUP',  // Группы ТМЦ
  'GD_GOODPRMETAL',  // Драг. металлы по товару
  'GD_GOODSET',  // Комплектация
  'GD_GOODTAX',  // Налоги-товар
  'GD_GOODVALUE',  // Ед.изм.
  'GD_HOLDING',  // Холдинг
  'GD_JOURNAL',  // Журнал событий
  'GD_LASTNUMBER',  // Последний номер документа
  'GD_LINK',  // Прикрепление
  'GD_OBJECT_DEPENDENCIES',
  'GD_OURCOMPANY',  // Рабочие компании
  'GD_PEOPLE',  // Люди
  'GD_PLACE',  // Административно-территориальные единицы
  'GD_PRECIOUSEMETAL',  // Драг. металлы
  'GD_REF_CONSTRAINTS',
  'GD_REF_CONSTRAINT_DATA',
  'GD_RUID',
  'GD_SMTP',
  'GD_SQL_HISTORY',
  'GD_SQL_LOG',
  'GD_SQL_STATEMENT',
  'GD_STORAGE_DATA',
  'GD_SUBSYSTEM',  // Подсистемы
  'GD_TAX',  // Налоги
  'GD_TAXACTUAL',  // Настройка отчетов (бух)
  'GD_TAXDESIGNDATE',  // Бухгалтерский отчет
  'GD_TAXNAME',  // Отчеты (бухгалтерия)
  'GD_TAXRESULT',  // Позиция бух отчета
  'GD_TAXTYPE',  // Тип расчета
  'GD_TNVD',  // Справочник ТНВД
  'GD_USER',
  'GD_USERCOMPANY',  // Компания для пользователя
  'GD_USERGROUP',  // Группы пользователей
  'GD_USERSTORAGE',  // Хранилище для пользователей
  'GD_VALUE',  // Единица изм.
  'GD_WEBLOG',
  'GD_WEBLOGDATA',
  'INV_BALANCE',  // Остатки ТМЦ
  'INV_BALANCEOPTION',
  'INV_CARD',  // Карточки по товару
  'INV_MOVEMENT',  // Движение ТМЦ
  'INV_PRICE',  // Прайс-лист
  'INV_PRICELINE',  // Позиция товарного прайс-листа
  'MSG_ACCOUNT',  // Учетные записи для Inet
  'MSG_ATTACHMENT',  // Прикрепления
  'MSG_BOX',  // Группы сообщений
  'MSG_MESSAGE',  // Сообщения
  'MSG_MESSAGERULES',  // Правила сообщений
  'MSG_TARGET',  // Кому адресовано сообщение
  'NEW_TABLE',
  'RPL_DATABASE',
  'RPL_RECORD',
  'RP_ADDITIONALFUNCTION',  // Изпользуемые функции
  'RP_REGISTRY',
  'RP_REPORTDEFAULTSERVER',  // Сервер по умолчанию
  'RP_REPORTGROUP',  // Группа отчетов
  'RP_REPORTLIST',  // Список отчетов
  'RP_REPORTRESULT',  // Результаты отчетов
  'RP_REPORTSERVER',  // Сервер отчетов
  'RP_REPORTTEMPLATE',  // Шаблоны отчетов
  'WEB_RELAY',
  'WG_HOLIDAY',  // Государственные праздники
  'WG_POSITION',  // Должности
  'WG_TBLCAL',  // График рабочего времени
  'WG_TBLCALDAY',  // График рабочего времени (день)
];
