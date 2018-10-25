## Установка

Предворительные требования: [Node](https://nodejs.org/en/download/), [Yarn](https://yarnpkg.com/en/docs/install), [Firebird](https://www.firebirdsql.org/en/server-packages/) >= v3.0

1. Требуется выполнить некоторые действия. Если уже было проделано - пропускаем

    * **Windows**
        ```
        $ yarn global add windows-build-tools
        $ yarn global add node-gyp
        ```
        Добавить в переменную окружения PATH путь к папке с библиотекой `<fb_dir>/fbclient.dll`
        
    * **Mac OS**
        ```
        $ firebirdHome='export FIREBIRD_HOME="/Library/Frameworks/Firebird.framework/Resources"'
        $ grep -q -F "$firebirdHome" ~/.bash_profile || echo "$firebirdHome" >> ~/.bash_profile
        
        $ firebirdBin='export PATH=$PATH:$FIREBIRD_HOME/bin'
        $ grep -q -F "$firebirdBin" ~/.bash_profile || echo "$firebirdBin" >> ~/.bash_profile
        
        $ mkdir -p /usr/local/lib 
        $ ln -s /Library/Frameworks/Firebird.framework/Versions/A/Firebird /usr/local/lib/libfbclient.dylib
        ```
        Выдать пользователю `Firebird Database` права на директорию где локально лежат базы данных Firebird
    * **Linux**
        ...

2. Клонирование проекта
    ```
    $ git clone https://github.com/gsbelarus/gdmn.git
    $ cd gdmn
    ```
5. Установка зависимостей
    ```
    $ yarn
    ```

## Дополнительно

* После обновления исходного кода из репозитория (`git pull`) нужно выполнить
    ```
    $ yarn bootstrap
    ```  
* После клонирования исходного кода следует зайти в папку `./src/gdmn-back/src/db` и скопировать файл `databases.ts.sample` с именем `databases.ts`. Открыть этот файл на редактирование и прописать параметры подключения к базе данных.
* После клонирования исходного кода следует зайти в папку `./packages/gdmn-er-bridge/src/test` и скопировать файл `testDB.ts.sample` с именем `testDB.ts`. Открыть этот файл на редактирование и прописать параметры подключения к базе данных.
