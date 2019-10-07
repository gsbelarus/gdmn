Установка и запуск сервера и клиента платформы GDMN.

## Устанавливаем Node

Необходима версия [Node 12 или новее.](https://nodejs.org/en/download/)

Мы не рекомендуем устанавливать `npm` так как проект `gdmn` использует менеджер пакетов `yarn`:

![](setup.ru.node1.jpg)

Для компиляции нативного драйвера Firebird в Node необходимо установить `Windows Studio Build Tools`:

![](setup.ru.node2.jpg)

## Устанавливаем Yarn

Инстолятор [Yarn](https://yarnpkg.com/en/docs/install) на официальном сайте.

## Устанавливаем Firebird 3

Берем инстолятор [Firebird 3](https://www.firebirdsql.org/en/server-packages/). GDMN не будет работать с более ранними версиями Firebird!

Устанавливаем серверную и клиентскую части:

![](setup.ru.fb1.jpg)

Установите флаги, как показано на скриншоте ниже:

![](setup.ru.fb2.jpg)

Пароль для учетной записи `SYSDBA`. Во всех более ранних версиях Firebird пароль по-умолчанию был `masterkey`. Мы используем его на последующих шагах инстоляции и в файлах настроек. Если вы здесь укажете другой пароль, не забудьте прописать его в нужных файлах, которые будут указаны далее.

![](setup.ru.fb3.jpg)

....
PATH
....

4. [Git](https://git-scm.com/downloads)

Дополнительная настройка в зависимости от используемой операционной системы:

### Windows

      
### Mac OS

Выполняем из командной строки:

````sh
$ firebirdHome='export FIREBIRD_HOME="/Library/Frameworks/Firebird.framework/Resources"'
$ grep -q -F "$firebirdHome" ~/.bash_profile || echo "$firebirdHome" >> ~/.bash_profile

$ firebirdBin='export PATH=$PATH:$FIREBIRD_HOME/bin'
$ grep -q -F "$firebirdBin" ~/.bash_profile || echo "$firebirdBin" >> ~/.bash_profile

$ mkdir -p /usr/local/lib 
$ ln -s /Library/Frameworks/Firebird.framework/Versions/A/Firebird /usr/local/lib/libfbclient.dylib
````

Выдать пользователю `Firebird Database` права на директорию где локально лежат базы данных Firebird.

## Получаем исходный код

Из командной строки:

```sh
$ git clone https://github.com/gsbelarus/gdmn.git
$ cd gdmn
```

## Устанавливаем зависимости и компилируем проект

Из командной строки выполнить:

```sh
$ yarn
$ yarn bootstrap
$ yarn build
```

## Запускаем проекты

Для запуска всех проектов выполнить:

    $ yarn start

Для запуск одного из проектов, где ```name``` - имя проекта, выполнить:

    $ yarn start:name

## Дополнительно

Конфигурации проектов:

- ```./src/gdmn-back/config/development.json```
- ```./src/gdmn-front/configs/config.json```

Для запуска тестов прописываем пути подключения к базам данных:
- Копируем файл ```./testConfig.json.sample``` в ```./testConfig.json```.

Если требуется обновить демо данные для **gdmn-grid-demo** выполнить:

    $ cd src/gdmn-grid-demo
    $ yarn download-data -force
    $ cd ../..
