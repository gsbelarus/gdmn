Добавление в базу слов на примере глагола:

1. Скрипты и исходные данные для создания базы слов находятся в папке **/src/morphology/dict/verbs**. Аналогично, существуют папки и для остальных частей речи.

2. Нужное слово заносим в файл **data-all.txt**:

> {{ШаблонДемо
> |имя=гл ru 2a
> |основа=сортирова
> |основа1=сортиру
> |слова=[[сортировать]]
> }}

3. Склонение по Зализняку мы берем с сайта [ru.wiktionary.org](https://ru.wiktionary.org/wiki/%D1%81%D0%BE%D1%80%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C):

![image](https://user-images.githubusercontent.com/5175764/47228984-3ffc7200-d3cf-11e8-92b2-6d3035951190.png)

4. Далее, в этой папке запускаем скрипт:

`node convert.js`

5. Важно! Для работы скрипта необходим файл с корпусом слов русского языка. Файл должен находиться в папке **/src/morphology/dict** и иметь имя **dict.opcorpora.txt**. Файл можно скачать по этой ссылке: [http://opencorpora.org/files/export/dict/dict.opcorpora.txt.zip](http://opencorpora.org/files/export/dict/dict.opcorpora.txt.zip)

6. После окончания работы скрипта из **rusverb.txt** копируем массив слов в файл **/src/morphology/rusVerbsData.ts**

7. Сравниваем файлы **rusconjugation.txt** и **rusconjend.txt** с предыдущими версиями. Если появились какие-то изменения (возможно, обнаружены новые склонения, неиспользуемые ранее), то стоит внести соответствующие изменения в файлы **/src/morphology/rusVerbEndings.ts** и **src/morphology/types.ts**.
