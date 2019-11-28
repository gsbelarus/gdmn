## Отладка тестов

Для отладки теста надо в папке `.vscode` открыть файл `launch.json` и добавить туда объект по примеру, 
приведенному ниже. Замените название и пути для своей библиотеки:

````json
    {
      "type": "node",
      "request": "launch",
      "name": "Debug gdmn-nlp test",     <-- заменить название
      "cwd": "${workspaceFolder}/packages/gdmn-nlp", <-- заменить путь
      "args": [
        "--inspect-brk",
        "${workspaceRoot}/node_modules/.bin/jest",
        "--runInBand",
        "--config",
        "${workspaceRoot}/jest.config.json"
      ],
      "windows": {
        "args": [
          "--inspect-brk",
          "${workspaceRoot}/node_modules/jest/bin/jest.js",
          "--runInBand",
          "--config ${workspaceRoot}\\packages\\gdmn-nlp\\jest.config.js", <-- заменить путь
          "${workspaceRoot}/jest.config.json"
        ],
      },
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
````    
Далее ставим точки останова в коде теста или в коде библиотеки, в разделе **Debug** редактора **VSCode** 
выбираем из выпадающего списка наш тест и запускаем его на выполнение.

## Отладка gdmn-back

Отладка невозможна с помощью `VSCode` из-за использования `worker threads`. Следует использовать отладчик `ndb`:

1) открыть окно командной строки в режиме администратора
2) выполнить: 

`yarn global add ndb`

3) заходим в папку `gdmn-back`
4) выполняем: 

`yarn rebuild`

5) затем: 

`ndb node ./dist/src/index.js`

Запустится отладчик, где можно открывать исходники, ставить точки останова и т.п.

Если надо поставить точку останова ДО запуска бэка, то запускаем отладчик так:

`ndb .`

открываем исходник, ставим точку, закрываем отладчик и потом см. п 5.