## Предварительно устанавливаем

1. [Node 12 или новее.](https://nodejs.org/en/download/)
2. [Yarn.](https://yarnpkg.com/en/docs/install)
3. [Firebird 3. Проект не будет работать с более ранними версиями Firebird!](https://www.firebirdsql.org/en/server-packages/)
4. [Git](https://git-scm.com/downloads)

Дополнительная настройка в зависимости от используемой операционной системы:

### Windows

Мы не рекомендуем устанавливать `npm` так как проект `gdmn` использует менеджер `yarn`:

![](setup.ru.node1.jpg)

Для компиляции нативного драйвера Firebird в node необходимо установить `Windows Studio Build Tools`:

![](setup.ru.node2.jpg)
      
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
