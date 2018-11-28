export const entityList: any = {
  entities: [
    {
      name: 'GD_CONST',
      lName: {
        ru: {
          name: 'Константы',
          fullName: 'Константы'
        }
      },
      isAbstract: false,
      semCategories: '',
      attributes: [
        {
          name: 'ID',
          type: 'SequenceAttribute',
          lName: {
            ru: {
              name: 'Идентификатор'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          sequence: 'GD_G_UNIQUE'
        },
        {
          name: 'NAME',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Константа',
              fullName: 'NAME'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          maxLength: 60,
          autoTrim: true
        },
        {
          name: 'COMMENT',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Комментарий',
              fullName: 'COMMENT'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 120,
          autoTrim: true
        },
        {
          name: 'CONSTTYPE',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Тип константы',
              fullName: 'CONSTTYPE'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          minValue: 0,
          maxValue: 7,
          defaultValue: 0
        },
        {
          name: 'DATATYPE',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'DATATYPE',
              fullName: 'DATATYPE'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 1,
          autoTrim: true
        },
        {
          name: 'EDITORKEY',
          type: 'EntityAttribute',
          lName: {
            ru: {
              name: 'Кто исправил',
              fullName: 'EDITORKEY'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          references: ['GD_CONTACT']
        },
        {
          name: 'EDITIONDATE',
          type: 'TimeStampAttribute',
          lName: {
            ru: {
              name: 'Дата изменения',
              fullName: 'EDITIONDATE'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: '1900-01-01T00:00:00.000Z',
          maxValue: '9999-12-31T23:59:59.999Z',
          defaultValue: 'CURRENT_TIMESTAMP'
        },
        {
          name: 'AFULL',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Полный доступ',
              fullName: 'AFULL'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647,
          defaultValue: -1
        },
        {
          name: 'ACHAG',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Просмотр и редактирование',
              fullName: 'ACHAG'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647,
          defaultValue: -1
        },
        {
          name: 'AVIEW',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Только просмотр',
              fullName: 'AVIEW'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647,
          defaultValue: -1
        },
        {
          name: 'RESERVED',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Зарезервировано',
              fullName: 'RESERVED'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647
        }
      ]
    },
    {
      name: 'FIN_VERSIONINFO',
      lName: {
        ru: {
          name: 'Версия программы',
          fullName: 'Версия программы'
        }
      },
      isAbstract: false,
      semCategories: '',
      attributes: [
        {
          name: 'ID',
          type: 'SequenceAttribute',
          lName: {
            ru: {
              name: 'Идентификатор'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          sequence: 'GD_G_UNIQUE'
        },
        {
          name: 'VERSIONSTRING',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Версия',
              fullName: 'Версия'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'RELEASEDATE',
          type: 'DateAttribute',
          lName: {
            ru: {
              name: 'Дата версии',
              fullName: 'Дата версии'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          minValue: '1900-01-01T00:00:00.000Z',
          maxValue: '9999-12-31T23:59:59.999Z'
        },
        {
          name: 'COMMENT',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Комментарий',
              fullName: 'COMMENT'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 254,
          autoTrim: true
        }
      ]
    },
    {
      name: 'GD_LINK',
      lName: {
        ru: {
          name: 'Прикрепление',
          fullName: 'Прикрепление'
        }
      },
      isAbstract: false,
      semCategories: '',
      attributes: [
        {
          name: 'ID',
          type: 'SequenceAttribute',
          lName: {
            ru: {
              name: 'Идентификатор'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          sequence: 'GD_G_UNIQUE'
        },
        {
          name: 'OBJECTKEY',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'OBJECTKEY',
              fullName: 'OBJECTKEY'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647
        },
        {
          name: 'LINKEDKEY',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'LINKEDKEY',
              fullName: 'LINKEDKEY'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647
        },
        {
          name: 'LINKEDCLASS',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'LINKEDCLASS',
              fullName: 'LINKEDCLASS'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          maxLength: 40,
          autoTrim: true
        },
        {
          name: 'LINKEDSUBTYPE',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'LINKEDSUBTYPE',
              fullName: 'LINKEDSUBTYPE'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 40,
          autoTrim: true
        },
        {
          name: 'LINKEDNAME',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'LINKEDNAME',
              fullName: 'LINKEDNAME'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          maxLength: 60,
          autoTrim: true
        },
        {
          name: 'LINKEDUSERTYPE',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'LINKEDUSERTYPE',
              fullName: 'LINKEDUSERTYPE'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'LINKEDORDER',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'LINKEDORDER',
              fullName: 'LINKEDORDER'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647
        }
      ]
    },
    {
      name: 'GD_USER',
      lName: {
        ru: {
          name: 'GD_USER',
          fullName: 'GD_USER'
        }
      },
      isAbstract: false,
      semCategories: '',
      attributes: [
        {
          name: 'ID',
          type: 'SequenceAttribute',
          lName: {
            ru: {
              name: 'Идентификатор'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          sequence: 'GD_G_UNIQUE'
        },
        {
          name: 'NAME',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Логин',
              fullName: 'Учетная запись пользователя системы.'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          minLength: 1,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'PASSW',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Пароль',
              fullName: 'Пароль'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          minLength: 1,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'INGROUP',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Входит в группы',
              fullName: 'Группа'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647,
          defaultValue: 1
        },
        {
          name: 'FULLNAME',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Полное наименование пользователя',
              fullName: 'FULLNAME'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 180,
          autoTrim: true
        },
        {
          name: 'DESCRIPTION',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Описание',
              fullName: 'DESCRIPTION'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 180,
          autoTrim: true
        },
        {
          name: 'IBNAME',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Пользователь Interbase',
              fullName: 'Пользователь Interbase'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          minLength: 1,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'IBPASSWORD',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Пароль Interbase',
              fullName: 'Пароль Interbase'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          minLength: 1,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'CONTACTKEY',
          type: 'EntityAttribute',
          lName: {
            ru: {
              name: 'Контакт',
              fullName: 'CONTACTKEY'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          references: ['GD_CONTACT']
        },
        {
          name: 'EXTERNALKEY',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Внешний ключ',
              fullName: 'EXTERNALKEY'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647
        },
        {
          name: 'DISABLED',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'Отключено',
              fullName: 'DISABLED'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          defaultValue: false
        },
        {
          name: 'LOCKEDOUT',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'Пользователь отключен',
              fullName: 'Отключен'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          defaultValue: false
        },
        {
          name: 'MUSTCHANGE',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'Пароль должен быть изменен',
              fullName: 'Должен быть изменен'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          defaultValue: false
        },
        {
          name: 'CANTCHANGEPASSW',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'Нельзя изменять пароль',
              fullName: 'Нелья изменять пароль'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          defaultValue: true
        },
        {
          name: 'PASSWNEVEREXP',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'Срок действия пароля никогда не истекает',
              fullName: 'Пароль никогда не истекает'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          defaultValue: true
        },
        {
          name: 'EXPDATE',
          type: 'DateAttribute',
          lName: {
            ru: {
              name: 'Дата истечения пароля',
              fullName: 'Дата истечения пароля'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: '1900-01-01T00:00:00.000Z',
          maxValue: '9999-12-31T23:59:59.999Z'
        },
        {
          name: 'WORKSTART',
          type: 'TimeAttribute',
          lName: {
            ru: {
              name: 'Начало работы',
              fullName: 'Начало работы'
            }
          },
          required: false,
          semCategories: '',
          calculated: false
        },
        {
          name: 'WORKEND',
          type: 'TimeAttribute',
          lName: {
            ru: {
              name: 'Окончание работы',
              fullName: 'Окончание работы'
            }
          },
          required: false,
          semCategories: '',
          calculated: false
        },
        {
          name: 'ALLOWAUDIT',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Позволять аудит действий пользователя',
              fullName: 'Позволять аудит'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          minValue: -32768,
          maxValue: 32767,
          defaultValue: 0
        },
        {
          name: 'EDITIONDATE',
          type: 'TimeStampAttribute',
          lName: {
            ru: {
              name: 'Дата изменения',
              fullName: 'EDITIONDATE'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: '1900-01-01T00:00:00.000Z',
          maxValue: '9999-12-31T23:59:59.999Z',
          defaultValue: 'CURRENT_TIMESTAMP'
        },
        {
          name: 'EDITORKEY',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Кто исправил',
              fullName: 'EDITORKEY'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647
        },
        {
          name: 'ICON',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Значок',
              fullName: 'ICON'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647
        },
        {
          name: 'RESERVED',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Зарезервировано',
              fullName: 'RESERVED'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647
        },
        {
          name: 'USR$VBPF_EDITONLYSELFDOC',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'Изменять только свои документы',
              fullName: 'Изменять только свои документы'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          defaultValue: false
        },
        {
          name: 'USR$VBPF_VIEWONLYSELFDOC',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'Просмотр только своих док',
              fullName: 'Просмотр только своих док'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          defaultValue: false
        }
      ]
    },
    {
      name: 'GD_JOURNAL',
      lName: {
        ru: {
          name: 'Журнал событий',
          fullName: 'Журнал событий'
        }
      },
      isAbstract: false,
      semCategories: '',
      attributes: [
        {
          name: 'ID',
          type: 'SequenceAttribute',
          lName: {
            ru: {
              name: 'Идентификатор'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          sequence: 'GD_G_UNIQUE'
        },
        {
          name: 'CONTACTKEY',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Контакт',
              fullName: 'CONTACTKEY'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647
        },
        {
          name: 'OPERATIONDATE',
          type: 'TimeStampAttribute',
          lName: {
            ru: {
              name: 'Дата операции',
              fullName: 'Дата операции'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          minValue: '1900-01-01T00:00:00.000Z',
          maxValue: '9999-12-31T23:59:59.999Z'
        },
        {
          name: 'SOURCE',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Информация',
              fullName: 'Информация'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 40,
          autoTrim: true
        },
        {
          name: 'OBJECTID',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Объект',
              fullName: 'Ключ объекта'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647
        },
        {
          name: 'DATA',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Данные',
              fullName: 'DATA'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minLength: 0,
          autoTrim: false
        },
        {
          name: 'CLIENTADDRESS',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'CLIENTADDRESS',
              fullName: 'CLIENTADDRESS'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 40,
          autoTrim: true
        }
      ]
    },
    {
      name: 'GD_CONTACT',
      lName: {
        ru: {
          name: 'Контакты',
          fullName: 'Контакты'
        }
      },
      isAbstract: false,
      semCategories: '',
      attributes: [
        {
          name: 'ID',
          type: 'SequenceAttribute',
          lName: {
            ru: {
              name: 'Идентификатор'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          sequence: 'GD_G_UNIQUE'
        },
        {
          name: 'PARENT',
          type: 'EntityAttribute',
          lName: {
            ru: {
              name: 'Родитель',
              fullName: 'PARENT'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          references: ['GD_CONTACT']
        },
        {
          name: 'CONTACTTYPE',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Тип контакта',
              fullName: 'CONTACTTYPE'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          minValue: -32768,
          maxValue: 32767
        },
        {
          name: 'NAME',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Наименование',
              fullName: 'NAME'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          maxLength: 60,
          autoTrim: true
        },
        {
          name: 'ADDRESS',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Адрес',
              fullName: 'ADDRESS'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 60,
          autoTrim: true
        },
        {
          name: 'DISTRICT',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Район',
              fullName: 'DISTRICT'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'CITY',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Населенный пункт',
              fullName: 'CITY'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'REGION',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Область',
              fullName: 'REGION'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'ZIP',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Индекс',
              fullName: 'ZIP'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'COUNTRY',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Страна',
              fullName: 'COUNTRY'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'NOTE',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Описание',
              fullName: 'NOTE'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minLength: 0,
          autoTrim: false
        },
        {
          name: 'EXTERNALKEY',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Внешний ключ',
              fullName: 'EXTERNALKEY'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647
        },
        {
          name: 'EMAIL',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Электронный адрес',
              fullName: 'EMAIL'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 60,
          autoTrim: true
        },
        {
          name: 'URL',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Сайт',
              fullName: 'URL'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 40,
          autoTrim: true
        },
        {
          name: 'POBOX',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Абонентский ящик',
              fullName: 'POBOX'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 40,
          autoTrim: true
        },
        {
          name: 'PHONE',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Телефон',
              fullName: 'PHONE'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 40,
          autoTrim: true
        },
        {
          name: 'FAX',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Факс',
              fullName: 'FAX'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 40,
          autoTrim: true
        },
        {
          name: 'EDITORKEY',
          type: 'EntityAttribute',
          lName: {
            ru: {
              name: 'Кто исправил',
              fullName: 'EDITORKEY'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          references: ['GD_CONTACT']
        },
        {
          name: 'EDITIONDATE',
          type: 'TimeStampAttribute',
          lName: {
            ru: {
              name: 'Дата изменения',
              fullName: 'EDITIONDATE'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: '1900-01-01T00:00:00.000Z',
          maxValue: '9999-12-31T23:59:59.999Z',
          defaultValue: 'CURRENT_TIMESTAMP'
        },
        {
          name: 'AFULL',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Полный доступ',
              fullName: 'AFULL'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647,
          defaultValue: -1
        },
        {
          name: 'ACHAG',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Просмотр и редактирование',
              fullName: 'ACHAG'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647,
          defaultValue: -1
        },
        {
          name: 'AVIEW',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Только просмотр',
              fullName: 'AVIEW'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647,
          defaultValue: -1
        },
        {
          name: 'DISABLED',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'Отключено',
              fullName: 'DISABLED'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          defaultValue: false
        },
        {
          name: 'RESERVED',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Зарезервировано',
              fullName: 'RESERVED'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647
        },
        {
          name: 'USR$CONTACTKEY',
          type: 'EntityAttribute',
          lName: {
            ru: {
              name: 'Контакт',
              fullName: 'CONTACTKEY'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          references: ['GD_CONTACT']
        },
        {
          name: 'USR$WG_LISTNUM',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Табельный номер'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 10,
          autoTrim: true
        },
        {
          name: 'USR$DEP_OLDCODE',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'код Секрета'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 8,
          autoTrim: true
        },
        {
          name: 'USR$WAGE_OLDEMPLKEY',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Ключ сотрудника из ЗА',
              fullName: 'Ключ сотрудника из ЗА'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -32768,
          maxValue: 32767
        },
        {
          name: 'USR$WB_PERCFORCLASS',
          type: 'NumericAttribute',
          lName: {
            ru: {
              name: '% доплаты за классность'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -9.223372036854776e22,
          maxValue: 9.223372036854776e22,
          precision: 15,
          scale: 4
        },
        {
          name: 'USR$DISTANCE',
          type: 'NumericAttribute',
          lName: {
            ru: {
              name: 'Расстояние',
              fullName: 'Расстояние до организации'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -9.223372036854776e22,
          maxValue: 9.223372036854776e22,
          precision: 15,
          scale: 4
        },
        {
          name: 'USR$COD',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Код для Ветразя',
              fullName: 'USR$COD'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 10,
          autoTrim: true
        },
        {
          name: 'USR$WAGE_OLDDEPTKEY',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Ключ подразделения из ЗА',
              fullName: 'Ключ подразделения из ЗА'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -32768,
          maxValue: 32767
        },
        {
          name: 'USR$MN_USEPORTION',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'Использовать порционность',
              fullName: 'Использовать порционность'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          defaultValue: false
        },
        {
          name: 'USR$WB_TABELNUM',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Табельный номер ПЛ'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 60,
          autoTrim: true
        },
        {
          name: 'USR$MN_REMAINSPRICE',
          type: 'EnumAttribute',
          lName: {
            ru: {
              name: 'Выбор цены остатков',
              fullName: 'Выбор цены остатков'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          values: [
            {
              value: 'L'
            },
            {
              value: 'F'
            },
            {
              value: 'M'
            },
            {
              value: 'X'
            },
            {
              value: 'A'
            }
          ],
          defaultValue: 'L'
        },
        {
          name: 'USR$MN_SMID',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Код в клипере'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 10,
          autoTrim: true
        },
        {
          name: 'USR$SORT',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Сортировка'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647
        },
        {
          name: 'USR$BRANCH_CODE',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Код филиала',
              fullName: 'Код филиала'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'USR$WAGE_CODE',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Код для ветразя из з\\п',
              fullName: 'Код для ветразя из з\\п'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'USR$TRADEAGENTKEY',
          type: 'EntityAttribute',
          lName: {
            ru: {
              name: 'USR$TRADEAGENTKEY',
              fullName: 'USR$TRADEAGENTKEY'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          references: ['GD_CONTACT']
        },
        {
          name: 'USR$VMK_FT_GROUP',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Группа магазинов для фирменной торговли'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647
        },
        {
          name: 'USR$CONTRADEAGENTKEY',
          type: 'EntityAttribute',
          lName: {
            ru: {
              name: 'Торговый агент'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          references: ['GD_CONTACT']
        },
        {
          name: 'USR$VBPF_ISOBOSOB',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'Обособленное подразделение',
              fullName: 'Обособленное подразделение'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          defaultValue: false
        },
        {
          name: 'CREATORKEY',
          type: 'EntityAttribute',
          lName: {
            ru: {
              name: 'CREATORKEY',
              fullName: 'CREATORKEY'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          references: ['GD_CONTACT']
        },
        {
          name: 'CREATIONDATE',
          type: 'TimeStampAttribute',
          lName: {
            ru: {
              name: 'CREATIONDATE',
              fullName: 'CREATIONDATE'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: '1900-01-01T00:00:00.000Z',
          maxValue: '9999-12-31T23:59:59.999Z',
          defaultValue: 'CURRENT_TIMESTAMP'
        },
        {
          name: 'USR$VMK_FT_PERCGROUP',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Группа наценок ФТ',
              fullName: 'Группа наценок ФТ'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647
        },
        {
          name: 'USR$MAIN_DEPTKEY',
          type: 'EntityAttribute',
          lName: {
            ru: {
              name: 'Основное подразделение'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          references: ['GD_CONTACT']
        },
        {
          name: 'USR$VMK_ISGLASS',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'Стекло',
              fullName: 'Стекло'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          defaultValue: false
        },
        {
          name: 'USR$FA_OKONH',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Код ОКОНХ'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 5,
          autoTrim: true
        },
        {
          name: 'USR$VMK_NAME_FT_CON',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'ФТ',
              fullName: 'ФТ'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 60,
          autoTrim: true
        },
        {
          name: 'USR$VMK_FT_GOODNAME',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Наименование для платежки',
              fullName: 'Наименование для платежки'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 120,
          autoTrim: true
        },
        {
          name: 'USR$VMK_INCLUDECASS',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'Включать в кассу главного',
              fullName: 'Включать в кассу главного'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          defaultValue: false
        },
        {
          name: 'USR$VBPF_MATCODE',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Код склада',
              fullName: 'Код склада'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'USR$VBPF_SPENDDEPART',
          type: 'EntityAttribute',
          lName: {
            ru: {
              name: 'Подразделение для затрат',
              fullName: 'Подразделение для затрат'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          references: ['GD_CONTACT']
        },
        {
          name: 'USR$VBPF_MATRESPONSIBLE',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Материально-ответственный',
              fullName: 'Материально-ответственный'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647
        },
        {
          name: 'USR$VBPF_ISMATRESP',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'Является мат.ответственным',
              fullName: 'Является мат.ответственным'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          defaultValue: false
        },
        {
          name: 'USR$VBPF_KINDUCHET',
          type: 'EnumAttribute',
          lName: {
            ru: {
              name: 'Вид учета по подразделению',
              fullName: 'Вид учета по подразделению'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          values: [
            {
              value: '0'
            },
            {
              value: '1'
            },
            {
              value: '2'
            },
            {
              value: '3'
            },
            {
              value: '4'
            }
          ]
        },
        {
          name: 'USR$SHCODE',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Код для терминалов',
              fullName: 'Код для терминалов'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 10,
          autoTrim: true
        },
        {
          name: 'USR$VBPF_UNP',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'УНП для ЖО',
              fullName: 'УНП для ЖО'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'USR$VBPF_TIME_WAIT',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Организ.время задержки',
              fullName: 'Организ.время задержки'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -32768,
          maxValue: 32767
        },
        {
          name: 'USR$VBPF_UPLIMTIME0',
          type: 'TimeAttribute',
          lName: {
            ru: {
              name: 'Начало раб.дня',
              fullName: 'Начало раб.дня'
            }
          },
          required: false,
          semCategories: '',
          calculated: false
        },
        {
          name: 'USR$VBPF_DNLIMTIME0',
          type: 'TimeAttribute',
          lName: {
            ru: {
              name: 'Окончание раб.дня',
              fullName: 'Окончание раб.дня'
            }
          },
          required: false,
          semCategories: '',
          calculated: false
        },
        {
          name: 'USR$VBPF_COSTASDEPOT',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'Цена как со склада магазина',
              fullName: 'Цена как со склада магазина'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          defaultValue: false
        },
        {
          name: 'USR$VBPF_MAINCONTACT',
          type: 'EntityAttribute',
          lName: {
            ru: {
              name: 'Заведущий складом',
              fullName: 'Заведущий складом'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          references: ['GD_CONTACT']
        },
        {
          name: 'USR$VISIBLE',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'Видимое в ЛК',
              fullName: 'Видимое в ЛК'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          defaultValue: false
        },
        {
          name: 'USR$VBPF_ISDENOM',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'Магазин деноминирован',
              fullName: 'Магазин деноминирован'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          defaultValue: false
        },
        {
          name: 'USR$VBPF_AVECOST',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'Расчитывать среднюю цену'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          defaultValue: false
        },
        {
          name: 'LAT',
          type: 'NumericAttribute',
          lName: {
            ru: {
              name: 'LAT',
              fullName: 'LAT'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -90,
          maxValue: 90,
          precision: 10,
          scale: 8
        },
        {
          name: 'LON',
          type: 'NumericAttribute',
          lName: {
            ru: {
              name: 'LON',
              fullName: 'LON'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -180,
          maxValue: 180,
          precision: 11,
          scale: 8
        },
        {
          name: 'USR$VBPF_ISGSM',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'ГСМ',
              fullName: 'ГСМ'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          defaultValue: false
        },
        {
          name: 'USR$CODE_NOT_REZIDENT',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Код страны не резидента',
              fullName: 'Код страны не резидента\r\n(для фирменной торговли)'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'USR$SHORTNAME',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Наименование для товарооборота',
              fullName: 'Наименование для товарооборота'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 120,
          autoTrim: true
        },
        {
          name: 'USR$VBPF_NP',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Номер птичника',
              fullName: 'Номер птичника'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -2147483648,
          maxValue: 2147483647
        },
        {
          name: 'USR$ENCASHMENT',
          type: 'EntityAttribute',
          lName: {
            ru: {
              name: 'Инкасация'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          references: ['GD_CONTACT']
        },
        {
          name: 'USR$VBPF_MERCHANDISER',
          type: 'EntityAttribute',
          lName: {
            ru: {
              name: 'Мерчандайзер',
              fullName: 'Мерчандайзер'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          references: ['GD_CONTACT']
        },
        {
          name: 'GD_CONTACTLIST',
          type: 'SetAttribute',
          lName: {
            ru: {
              name: 'Список контактов',
              fullName: 'Список контактов'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          references: ['GD_CONTACT'],
          attributes: [
            {
              name: 'RESERVED',
              type: 'IntegerAttribute',
              lName: {
                ru: {
                  name: 'Зарезервировано',
                  fullName: 'RESERVED'
                }
              },
              required: false,
              semCategories: '',
              calculated: false,
              minValue: -2147483648,
              maxValue: 2147483647
            }
          ],
          presLen: 0
        }
      ]
    },
    {
      name: 'GD_COMPANY',
      lName: {
        ru: {
          name: 'Компания',
          fullName: 'Компания'
        }
      },
      isAbstract: false,
      semCategories: '',
      attributes: [
        {
          name: 'ID',
          type: 'SequenceAttribute',
          lName: {
            ru: {
              name: 'Идентификатор'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          sequence: 'GD_G_UNIQUE'
        },
        {
          name: 'HEADCOMPANY',
          type: 'EntityAttribute',
          lName: {
            ru: {
              name: 'Головная организация',
              fullName: 'Ссылка на головную орг.'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          references: ['GD_COMPANY']
        },
        {
          name: 'FULLNAME',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Полное наименование',
              fullName: 'FULLNAME'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 180,
          autoTrim: true
        },
        {
          name: 'COMPANYTYPE',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Тип организации',
              fullName: 'Тип компании'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'DIRECTORKEY',
          type: 'EntityAttribute',
          lName: {
            ru: {
              name: 'Директор'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          references: ['GD_PEOPLE']
        },
        {
          name: 'CHIEFACCOUNTANTKEY',
          type: 'EntityAttribute',
          lName: {
            ru: {
              name: 'Глв. бух',
              fullName: 'Глв. бух'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          references: ['GD_PEOPLE']
        },
        {
          name: 'LOGO',
          type: 'BlobAttribute',
          lName: {
            ru: {
              name: 'Логотип',
              fullName: 'Логотип'
            }
          },
          required: false,
          semCategories: '',
          calculated: false
        },
        {
          name: 'USR$WG_PERSDIRKEY',
          type: 'EntityAttribute',
          lName: {
            ru: {
              name: 'Начальник ОК'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          references: ['GD_CONTACT']
        },
        {
          name: 'USR$INV_NDSDODGER',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'Не плательщик НДС',
              fullName: 'Не плательщик НДС'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          defaultValue: false
        },
        {
          name: 'USR$PLUSCOMPANYTYPE',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Дополнительный тип организации'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'USR$TRADEAGENTKEY',
          type: 'EntityAttribute',
          lName: {
            ru: {
              name: 'Торговый агент'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          references: ['GD_CONTACT']
        },
        {
          name: 'USR$EVAT_OFFSHORE',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'Резидент офшора',
              fullName: 'Резидент офшора'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          defaultValue: false
        },
        {
          name: 'USR$EVAT_EAEU',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'Резидент ЕАЭС',
              fullName: 'Резидент ЕАЭС'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          defaultValue: false
        },
        {
          name: 'USR$EVAT_NATIVE',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'Резидент РБ',
              fullName: 'Резидент РБ'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          defaultValue: false
        },
        {
          name: 'USR$EVAT_ISBIGCOMPANY',
          type: 'BooleanAttribute',
          lName: {
            ru: {
              name: 'Крупный плательщик',
              fullName: 'Крупный плательщик'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          defaultValue: false
        },
        {
          name: 'GD_HOLDING',
          type: 'SetAttribute',
          lName: {
            ru: {
              name: 'Холдинг',
              fullName: 'Холдинг'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          references: ['GD_COMPANY'],
          attributes: [],
          presLen: 0
        }
      ]
    },
    {
      name: 'GD_PEOPLE',
      lName: {
        ru: {
          name: 'Люди',
          fullName: 'Люди'
        }
      },
      isAbstract: false,
      semCategories: '',
      attributes: [
        {
          name: 'ID',
          type: 'SequenceAttribute',
          lName: {
            ru: {
              name: 'Идентификатор'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          sequence: 'GD_G_UNIQUE'
        },
        {
          name: 'FIRSTNAME',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Имя',
              fullName: 'Имя'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'SURNAME',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Фамилия',
              fullName: 'Фамилия'
            }
          },
          required: true,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'MIDDLENAME',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Отчество'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'NICKNAME',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Коротко',
              fullName: 'Коротко'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'RANK',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Должность',
              fullName: 'Должность'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'HADDRESS',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Дом. адрес',
              fullName: 'Дом. адрес'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 60,
          autoTrim: true
        },
        {
          name: 'HCITY',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Город (домашний)',
              fullName: 'Город (домашний)'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'HREGION',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Область (проживания)',
              fullName: 'Область (проживания)'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'HZIP',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Индекс (проживания)',
              fullName: 'Индекс (проживания)'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'HCOUNTRY',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Страна (прожив)',
              fullName: 'Страна (прожив)'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'HDISTRICT',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Район (проживания)',
              fullName: 'Район (проживания)'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'HPHONE',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Дом. телефон',
              fullName: 'Дом. телефон'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 40,
          autoTrim: true
        },
        {
          name: 'WCOMPANYKEY',
          type: 'EntityAttribute',
          lName: {
            ru: {
              name: 'Рабочая компания (ссылка)',
              fullName: 'Ключ рабочей компании'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          references: ['GD_CONTACT']
        },
        {
          name: 'WCOMPANYNAME',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Рабочая компания',
              fullName: 'Рабочая компания'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 60,
          autoTrim: true
        },
        {
          name: 'WDEPARTMENT',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Подразделение',
              fullName: 'Рабочее подразделение'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'SPOUSE',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Супруг(а)',
              fullName: 'SPOUSE'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'CHILDREN',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Дети',
              fullName: 'Дети'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'SEX',
          type: 'EnumAttribute',
          lName: {
            ru: {
              name: 'Пол',
              fullName: 'Пол'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          values: [
            {
              value: 'M'
            },
            {
              value: 'F'
            },
            {
              value: 'N'
            }
          ]
        },
        {
          name: 'BIRTHDAY',
          type: 'DateAttribute',
          lName: {
            ru: {
              name: 'Дата рождения',
              fullName: 'Дата рождения'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: '1900-01-01T00:00:00.000Z',
          maxValue: '9999-12-31T23:59:59.999Z'
        },
        {
          name: 'PASSPORTNUMBER',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Номер паспорта',
              fullName: 'Номер паспорта'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 40,
          autoTrim: true
        },
        {
          name: 'PASSPORTEXPDATE',
          type: 'DateAttribute',
          lName: {
            ru: {
              name: 'Дата действия пасп',
              fullName: 'Дата действия пасп'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: '1900-01-01T00:00:00.000Z',
          maxValue: '9999-12-31T23:59:59.999Z'
        },
        {
          name: 'PASSPORTISSDATE',
          type: 'DateAttribute',
          lName: {
            ru: {
              name: 'Дата выдачи',
              fullName: 'Дата выдачи'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: '1900-01-01T00:00:00.000Z',
          maxValue: '9999-12-31T23:59:59.999Z'
        },
        {
          name: 'PASSPORTISSUER',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Кто выдал',
              fullName: 'Кто выдал'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 40,
          autoTrim: true
        },
        {
          name: 'PASSPORTISSCITY',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Город выдачи',
              fullName: 'Город выдачи'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'PERSONALNUMBER',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Персональный номер',
              fullName: 'PERSONALNUMBER'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 40,
          autoTrim: true
        },
        {
          name: 'VISITCARD',
          type: 'BlobAttribute',
          lName: {
            ru: {
              name: 'Визитная карточка',
              fullName: 'Визитная карточка'
            }
          },
          required: false,
          semCategories: '',
          calculated: false
        },
        {
          name: 'PHOTO',
          type: 'BlobAttribute',
          lName: {
            ru: {
              name: 'Фотография',
              fullName: 'Фотография'
            }
          },
          required: false,
          semCategories: '',
          calculated: false
        },
        {
          name: 'USR$ACCOUNT',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Банковский счет'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 40,
          autoTrim: true
        },
        {
          name: 'USR$WG_BCOUNTRY',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Страна рождения'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 32,
          autoTrim: true
        },
        {
          name: 'USR$WG_BREGION',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Область рождения'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 20,
          autoTrim: true
        },
        {
          name: 'USR$WG_BCITY',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Нас. пункт рождения'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 32,
          autoTrim: true
        },
        {
          name: 'USR$WG_BDISTRICT',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Район рождения'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 32,
          autoTrim: true
        },
        {
          name: 'USR$WAGE_PASTCAT',
          type: 'IntegerAttribute',
          lName: {
            ru: {
              name: 'Разряд из ЗА',
              fullName: 'Разряд из ЗА'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          minValue: -32768,
          maxValue: 32767
        },
        {
          name: 'USR$INSURANCENUMBER',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Страховой номер'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 40,
          autoTrim: true
        },
        {
          name: 'USR$IBANACCOUNT',
          type: 'StringAttribute',
          lName: {
            ru: {
              name: 'Счет IBAN',
              fullName: 'Счет IBAN'
            }
          },
          required: false,
          semCategories: '',
          calculated: false,
          maxLength: 40,
          autoTrim: true
        }
      ]
    }
  ]
};
