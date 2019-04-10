## Предварительно

Так как для простоты подключения к тестовым базам данных на сервере мы не используем софт для виртуализации, то запускаем все build-ы в контексте ОС на которой установлен jenkins. Это значит, что ОС должна быть готова для сборки, запуска и тестирования **gdmn**. Для этого нужно выполнить [эти инструкции](https://github.com/gsbelarus/gdmn/blob/master/docs/setup.ru.md#%D0%BF%D1%80%D0%B5%D0%B4%D0%B2%D0%B0%D1%80%D0%B8%D1%82%D0%B5%D0%BB%D1%8C%D0%BD%D0%BE-%D1%83%D1%81%D1%82%D0%B0%D0%BD%D0%B0%D0%B2%D0%BB%D0%B8%D0%B2%D0%B0%D0%B5%D0%BC) для нужной ОС.
Так же для работы Jenkins нужно поставить [Java 8](https://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html).

## Установка

Установить Jenkins можно как через инсталятор, так и из war архива. Для установки из `war` архива нужно
* [скачать архив](http://mirrors.jenkins.io/war-stable/latest/jenkins.war)
* открыть терминал в директории с архивом
* выполнить в терминале `java -jar jenkins.war`
Эта команда распакует нужные файлы из архива и запустит сервер на `0.0.0.0:8080` (прослушивание всех возможных интерфейсов).
Если нужно поменять порт добавляем к команде `--httpPort=$HTTP_PORT` (в дальнейшем изменить порт можно через файл конфигурации). [Список всех флагов](https://wiki.jenkins.io/display/JENKINS/Starting+and+Accessing+Jenkins)

## Настройка

* Создаем где-нибудь в системе файл конфигурации для тестирования [testConfig.json](https://github.com/gsbelarus/gdmn/blob/master/testConfig.json.sample)
* Переходим по ссылке `http://localhost:$HTTP_PORT` и следуем инструкциям, где `$HTTP_PORT` - порт сервера.
* После установке всех плагинов и создания пользователя создаем новый `Job` с типом `Freestyle project`
  * В разделе `General` 
    * Выставляем для `Discard old builds` количество сборок для хранения `Max # of builds to keep`, например 50 штук
    * GitHub project: `https://github.com/gsbelarus/gdmn`
  * В разделе `Source Code Management` настраиваем Git
    * Repository URL: `https://github.com/gsbelarus/gdmn`
    * Credentials: добавляем пользователя с логином и паролем из GitHub, выбираем его
    * Branch Specifier (blank for 'any'): указываем нужну ветку или оставляем пустым для всех веток
  * В разделе `Build Triggers` настраиваем тригеры сборки
    * Ставим галку `GitHub hook trigger for GITScm polling` - активация сборки по WebHooks
  * В разделе `Build Environment`
    * Выставляем для `Abort the build if it's stuck` стратегию `Absolute` и таймаут, например 30 минут
    * Ставим галку `Add timestamps to the Console Output` - для вывода времени в консоль
  * В разделе `Build` добавляем steps
    * Set build status to 'pending' on GitHub commit:
      * Commit context - Manually entered context name: GDMN CI; 
      * Advanced - Content: Install...;
    * Execute Windows batch command: `yarn && yarn bootstrap`
    * Set build status to 'pending' on GitHub commit:
      * Commit context - Manually entered context name: GDMN CI; 
      * Advanced - Content: Build...;
    * Execute Windows batch command: `yarn rebuild`
    * Set build status to 'pending' on GitHub commit:
      * Commit context - Manually entered context name: GDMN CI; 
      * Advanced - Content: Testing...;
    * Execute Windows batch command: `copy $CONFIG_PATH\testConfig.json . && yarn test`; где `$CONFIG_PATH` - путь к файлу конфигурации
  * В разделе `Post-build Actions` добавить действия
    * Set GitHub commit status (universal): 
      * What: 
        * Commit context - Manually entered context name: GDMN CI;
        * Status result - One of default messages and statuses;
    * Publish JUnit test result report:
      * Test report XMLs: packages/*/junit.xml
* Нажать `Save`  

* Далее переходим в Manage Jenkins в раздел `Configure system`:  
    * В разделе `GitHub` добавляем новый сервер `Add GitHub Server`:
        * Name - указываем произвольное имя  
        * API URL - https://api.github.com
        * Credentials: добавляем `Secret text` где в поле `Secret` вводим `Personal access tokens` полученный на GitHub  
        (см. ниже `Настройка GitHub`) в разделе `Developer settings`, и нажимаем `Add`  
    * Manage hooks: выставить флаг  
* Если сервер выступает локальной машиной, то требуется перейти в раздел `Jenkins Location` где:  
    * Jenkins URL: указать сервер с переброщенным портом к примеру с помощью утилиты `ngrok`

## Настройка GitHub
* в`GitHub` переходим на закладку `Settings` аккаунта:
    * На закладке `Developer settings` нажимаем `Generate new token`:
        * Select scopes: repo  
    * нажать `Generate Token` и скопировать в буфер

* Далее в репозитории `GitHub` выбираем трубемый проект и переходим на закладку `Settings`:
    * На закладке `Webhooks` добавляем `add webhook`:
        * Payload URL: указываемый адрес сервера  
        * Content type: application/json
        * Secret: вводим `Personal access tokens` полученный в разделе `Developer settings` 
## Запуск сборки

После настройки и запуска сервера он будет запукать процесс сборки и тестирования после каждого коммита в нужные ветки.
Так же можно запустить процесс сборки в ручную `Build now`.
