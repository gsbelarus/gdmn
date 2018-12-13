# GDMN

[![MIT License][license-badge]][license-url]
[![lerna][lerna-badge]][lerna-badge-url]


__GDMN__ — это революционная облачная платформа с открытым исходным кодом для создания приложений автоматизации учета/управления на предприятии.

Подробно о текущем состоянии разработки читайте в [отчете по первому этапу](docs/REPORT/report.20180626.ru.md).

В данный момент мы работаем над [следующими задачами](docs/roadmap.ru.md).

Перечень используемых технологий и инструкция о том как присоединиться к проекту находится [здесь](CONTRIBUTE.ru.md).

Вопрос/ответ - [FAQ](docs/FAQ.ru.md)


## Packages

This is repository is a "mono repo" that we manage using [Lerna][lerna-url] and [Yarn Workspaces][yarn-workspaces].

### /src:

| Package | Docs | |Description |
| --------| ---- | ------ | ----------- |
| [`gdmn-front`][gdmn-front-url] | [![][gdmn-front-readme-badge]][gdmn-front-readme-url] |  | web-client for gdmn-server |
| [`gdmn-back`][gdmn-back-url] | [![][gdmn-back-readme-badge]][gdmn-back-readme-url] |  | web-server |
| [`gdmn-nlp-demo`][gdmn-nlp-demo-url] | [![][gdmn-nlp-demo-readme-badge]][gdmn-nlp-demo-readme-url] |  | gdmn-nlp web demo |
| [`gdmn-grid-demo`][gdmn-grid-demo-url] | [![][gdmn-grid-demo-readme-badge]][gdmn-grid-demo-readme-url] |  | gdmn-grid web demo |

### /packages:

| Package | Docs |  | Description |
| --------| ---- | ------ | ----------- |
| [`gdmn-db`][gdmn-db-url] | [![][gdmn-db-readme-badge]][gdmn-db-readme-url] |  |  |
| [`gdmn-orm`][gdmn-orm-url] | [![][gdmn-orm-readme-badge]][gdmn-orm-readme-url] |  |  |
| [`gdmn-er-bridge`][gdmn-er-bridge-url] | [![][gdmn-er-bridge-readme-badge]][gdmn-er-bridge-readme-url] |  |  |
| [`gdmn-recordset`][gdmn-recordset-url] | [![][gdmn-recordset-readme-badge]][gdmn-recordset-readme-url] |  |  |
| [`gdmn-grid`][gdmn-grid-url] | [![][gdmn-grid-readme-badge]][gdmn-grid-readme-url] |  | data-grid |
| [`gdmn-nlp`][gdmn-nlp-url] | [![][gdmn-nlp-readme-badge]][gdmn-nlp-readme-url] |  | natural language processing |
| [`gdmn-nlp-agent`][gdmn-nlp-agent-url] | [![][gdmn-nlp-agent-readme-badge]][gdmn-nlp-agent-readme-url] |  |  |


## License

[MIT][license-url]. Copyright © 2018 by [Golden Software of Belarus, Ltd.][gs-url]
All rights reserved.


[lerna-badge]: https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg
[lerna-badge-url]: https://lernajs.io/
[gs-url]: http://gsbelarus.com
[license-badge]: https://img.shields.io/badge/license-MIT-yellowgreen.svg
[license-url]: LICENSE
[lerna-url]: https://github.com/lerna/lerna
[yarn-workspaces]: https://yarnpkg.com/lang/en/docs/workspaces/
[travis-badge]: https://travis-ci.org/gsbelarus/gdmn.svg
[travis-url]: https://travis-ci.org/gsbelarus/gdmn

[gdmn-front-url]: /src/gdmn-front
[gdmn-front-readme-badge]: https://img.shields.io/badge/docs-readme-orange.svg
[gdmn-front-readme-url]: /src/gdmn-front/README.md

[gdmn-back-url]: /src/gdmn-back
[gdmn-back-readme-badge]: https://img.shields.io/badge/docs-readme-orange.svg
[gdmn-back-readme-url]: /src/gdmn-back/README.md

[gdmn-nlp-demo-url]: /src/gdmn-nlp-demo
[gdmn-nlp-demo-readme-badge]: https://img.shields.io/badge/docs-readme-orange.svg
[gdmn-nlp-demo-readme-url]: /src/gdmn-nlp-demo/README.md

[gdmn-grid-demo-url]: /src/gdmn-grid-demo
[gdmn-grid-demo-readme-badge]: https://img.shields.io/badge/docs-readme-orange.svg
[gdmn-grid-demo-readme-url]: /src/gdmn-grid-demo/README.md

[gdmn-db-url]: /packages/gdmn-db
[gdmn-db-readme-badge]: https://img.shields.io/badge/docs-readme-orange.svg
[gdmn-db-readme-url]: /packages/gdmn-db/README.md

[gdmn-orm-url]: /packages/gdmn-orm
[gdmn-orm-readme-badge]: https://img.shields.io/badge/docs-readme-orange.svg
[gdmn-orm-readme-url]: /packages/gdmn-orm/README.md

[gdmn-er-bridge-url]: /packages/gdmn-er-bridge
[gdmn-er-bridge-readme-badge]: https://img.shields.io/badge/docs-readme-orange.svg
[gdmn-er-bridge-readme-url]: /packages/gdmn-er-bridge/README.md

[gdmn-recordset-url]: /packages/gdmn-recordset
[gdmn-recordset-readme-badge]: https://img.shields.io/badge/docs-readme-orange.svg
[gdmn-recordset-readme-url]: /packages/gdmn-recordset/README.md

[gdmn-grid-url]: /packages/gdmn-grid
[gdmn-grid-readme-badge]: https://img.shields.io/badge/docs-readme-orange.svg
[gdmn-grid-readme-url]: /packages/gdmn-grid/README.md

[gdmn-nlp-url]: /packages/gdmn-nlp
[gdmn-nlp-readme-badge]: https://img.shields.io/badge/docs-readme-orange.svg
[gdmn-nlp-readme-url]: /packages/gdmn-nlp/README.md

[gdmn-nlp-agent-url]: /packages/gdmn-nlp-agent
[gdmn-nlp-agent-readme-badge]: https://img.shields.io/badge/docs-readme-orange.svg
[gdmn-nlp-agent-readme-url]: /packages/gdmn-nlp-agent/README.md
