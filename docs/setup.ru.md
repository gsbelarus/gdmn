## Предварительно устанавливаем

1. [Node](https://nodejs.org/en/download/).
2. [Yarn](https://yarnpkg.com/en/docs/install).
3. [Firebird 3](https://www.firebirdsql.org/en/server-packages/). Проект не будет работать с версией Firebird ниже 3.0.
4. [Git](https://git-scm.com/downloads).

Дополнительная настройка в зависимости от используемой операционной системы:

### Windows

> Возможно, с последней версией драйвера уже не надо ставить старую версию микрософтовского компилятора. В драйвере вроде уже исправлено.

Предварительно, если установлены, удалить Visual Studio Build tools 2017. Это можно сделать через инсталятор Visual Studio Installer в меню приложений Windows.

Выполняем из командной строки с правами Администратора:

        $ npm install --global --production windows-build-tools --vs2015
      
Добавить в переменную окружения **PATH** путь к папке с библиотекой `fbclient.dll` (располагается в папке, куда был установлен сервер Firebird, по умолчанию -- c:\Program Files\Firebird).
        
### Mac OS

Выполняем из командной строки:

        $ firebirdHome='export FIREBIRD_HOME="/Library/Frameworks/Firebird.framework/Resources"'
        $ grep -q -F "$firebirdHome" ~/.bash_profile || echo "$firebirdHome" >> ~/.bash_profile
        
        $ firebirdBin='export PATH=$PATH:$FIREBIRD_HOME/bin'
        $ grep -q -F "$firebirdBin" ~/.bash_profile || echo "$firebirdBin" >> ~/.bash_profile
        
        $ mkdir -p /usr/local/lib 
        $ ln -s /Library/Frameworks/Firebird.framework/Versions/A/Firebird /usr/local/lib/libfbclient.dylib

Выдать пользователю `Firebird Database` права на директорию где локально лежат базы данных Firebird.

### Linux
        
*Будет написано...*

## Получаем исходный код

Из командной строки:

    $ git clone https://github.com/gsbelarus/gdmn.git
    $ cd gdmn

## Устанавливаем зависимости и компилируем проект

Из командной строки выполнить:

    $ yarn
    $ yarn bootstrap
    $ yarn build

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
