import { IDataRow } from "gdmn-recordset";

/**
 * Адрес запроса:: http://www.nbrb.by/API/ExRates/Currencies[/{Cur_ID}]
 * Результат: Возвращает массив объектов класса NBRBCurrency.
 * Если указан Cur_ID, то возвращается один объект NBRBCurrency.
 *
 *  Cur_ID – внутренний код
 *  Cur_ParentID – этот код используется для связи, при изменениях наименования, количества единиц
 *    к которому устанавливается курс белорусского рубля, буквенного, цифрового кодов и т.д.
 *   фактически одной и той же валюты*.
 *  Cur_Code – цифровой код
 *  Cur_Abbreviation – буквенный код
 *  Cur_Name – наименование валюты на русском языке
 *  Cur_Name_Bel – наименование на белорусском языке
 *  Cur_Name_Eng – наименование на английском языке
 *  Cur_QuotName – наименование валюты на русском языке, содержащее количество единиц
 *  Cur_QuotName_Bel – наименование на белорусском языке, содержащее количество единиц
 *  Cur_QuotName_Eng – наименование на английском языке, содержащее количество единиц
 *  Cur_NameMulti – наименование валюты на русском языке во множественном числе
 *  Cur_Name_BelMulti – наименование валюты на белорусском языке во множественном числе*
 *  Cur_Name_EngMulti – наименование на английском языке во множественном числе*
 *  Cur_Scale – количество единиц иностранной валюты
 *  Cur_Periodicity – периодичность установления курса (0 – ежедневно, 1 – ежемесячно)
 *  Cur_DateStart – дата включения валюты в перечень валют, к которым устанавливается официальный курс бел. рубля
 *  Cur_DateEnd – дата исключения валюты из перечня валют, к которым устанавливается официальный курс бел. рубля
 *
 */

export interface INBRBCurrency extends IDataRow {
  Cur_ID: number;
  Cur_ParentID: number;
  Cur_Code: string;
  Cur_Abbreviation: string;
  Cur_Name: string;
  Cur_Name_Bel: string;
  Cur_Name_Eng: string;
  Cur_QuotName: string;
  Cur_QuotName_Bel: string;
  Cur_QuotName_Eng: string;
  Cur_NameMulti: string;
  Cur_Name_BelMulti: string;
  Cur_Name_EngMulti: string;
  Cur_Scale: number;
  Cur_Periodicity: number;
  Cur_DateStart: Date;
  Cur_DateEnd: Date;
};

export type NBRBCurrencies = INBRBCurrency[];

/**
 * Адрес запроса:: http://www.nbrb.by/API/ExRates/Rates[/{Cur_ID}]
 * Параметры (GET):
 *    onDate** – дата, на которую запрашивается курс (если не задана, то возвращается курс на сегодня)
 *    Periodicity – периодичность установления курса (0 – ежедневно, 1 – ежемесячно)
 *    ParamMode – формат аргумента Cur_ID: 0 – внутренний код валюты,
 *      1 – трехзначный цифровой  код валюты в соответствии со стандартом ИСО 4217,
 *      2 – трехзначный буквенный код валюты (ИСО 4217). По умолчанию = 0
 * При использовании буквенного или цифрового кода валюты (ИСО 4217) учитывайте его значение на запрашиваемую дату.
 * Результат: Возвращает массив объектов класса NBRBRate. Если указан Cur_ID, то возвращается один объект NBRBRate.
 *
 *  Cur_ID – внутренний код
 *  Date – дата, на которую запрашивается курс
 *  Cur_Abbreviation – буквенный код
 *  Cur_Scale – количество единиц иностранной валюты
 *  Cur_Name – наименование валюты на русском языке во множественном, либо в единственном числе, в зависимости от количества единиц
 *  Cur_OfficialRate – курс*
 *
 */

export interface INBRBRate extends IDataRow {
  Cur_ID: number;
  Date: Date;
  Cur_Abbreviation: string;
  Cur_Scale: number;
  Cur_Name: string;
  Cur_OfficialRate: number;
};

export type NBRBRates = INBRBRate[];

