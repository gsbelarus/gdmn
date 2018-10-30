## Предварительно устанавливаем

1. [Node](https://nodejs.org/en/download/). Мы рекомендуем версию 10. У нас возникали проблемы с компиляцией библиотек на C++ при использовании версии 11.0. 
2. [Yarn](https://yarnpkg.com/en/docs/install).
3. [Firebird 3](https://www.firebirdsql.org/en/server-packages/). Проект не будет работать с версией Firebird ниже 3.0.
4. [Git](https://git-scm.com/downloads).

Дополнительная настройка в зависимости от используемой операционной системы:

### Windows

Выполняем из командной строки:

        ```
        $ yarn global add windows-build-tools
        $ yarn global add node-gyp
        ```

Добавить в переменную окружения **PATH** путь к папке с библиотекой `fbclient.dll` (располагается в папке, куда был установлен сервер Firebird, по умолчанию -- c:\Program Files\Firebird).
        
### Mac OS

Выполняем из командной строки:

        ```
        $ firebirdHome='export FIREBIRD_HOME="/Library/Frameworks/Firebird.framework/Resources"'
        $ grep -q -F "$firebirdHome" ~/.bash_profile || echo "$firebirdHome" >> ~/.bash_profile
        
        $ firebirdBin='export PATH=$PATH:$FIREBIRD_HOME/bin'
        $ grep -q -F "$firebirdBin" ~/.bash_profile || echo "$firebirdBin" >> ~/.bash_profile
        
        $ mkdir -p /usr/local/lib 
        $ ln -s /Library/Frameworks/Firebird.framework/Versions/A/Firebird /usr/local/lib/libfbclient.dylib
        ```

Выдать пользователю `Firebird Database` права на директорию где локально лежат базы данных Firebird.

### Linux
        
*Будет написано...*

## Получаем исходный код

Из командной строки:

    ```
    $ git clone https://github.com/gsbelarus/gdmn.git
    $ cd gdmn
    ```

## Прописываем пути подключения к базам данных

1. gdmn-nlp-agent. Копируем файл /src/test/testDB.ts.sample в /src/test/testDB.ts.
2. gdmn-back. Копируем файл /src/db/databases.ts.sample в /src/db/databases.ts.
3. gdmn-er-bridge. Копируем файл /src/test/testDB.ts.sample в /src/test/testDB.ts.

## Устанавливаем зависимости

Из командной строки:

    ```
    $ yarn
    $ yarn bootstrap
    $ yarn build
    ```
## Запускаем gdmn-back

Прописываем в файле /src/config/development.json путь к серверу. Как правило, указываем 127.0.0.1, если сервер запускается на этом же компьютере:

```ts
{
  "server": {
    "http": {
      "enabled": true,
      "host": "127.0.0.1",
      "port": 4000
    },
  ...
```    
