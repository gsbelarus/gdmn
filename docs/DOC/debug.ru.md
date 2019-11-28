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