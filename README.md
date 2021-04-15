Tudlů
=====

This is excercise with objective cca:
* make a Todo list app, that loads list of todos and allows marking todo as done
* every todo does have text and information if it is done or not
* todo update should be without reloading page in browser
* todos should be persisted somewhere
* UI doesn't get considered for job

Run for presentation
--------------------
* composer install
* npm install
* set env var `TUDLU_SQLITE_DB_PATH` to path to sqlite file (will be created if doesn't already exists)
* To build front-end run `npm run-script build`
* run some server, php: `php -S 127.0.0.1:888`

Run for development
-------------------
* run php server for example: `php -S 127.0.0.1:888`
* run `npx webpack -w` for webpack watch
* run `npm run-script styles` for scss compilation watch

Usage
-----
* To add todo, fill line with text and press `Enter`.
* To check or uncheck, press inside `[ ]`.
* To change todo text, click on todo text, change, than press `Enter`.

Generating docs
---------------
[Apidoc](https://apidocjs.com/) should be installed globally. 
Then `apidoc -i api/src/ -o apidoc/`.

Simplifications
---------------
There is plenty that can be done, as usual.

* API and UI are in single repo, for simpler presentation - but separated
* There is no possibility to: remove todo, get todo detail...
* Service should be separated to service, mapper and loader - more layers
* For serious usage I would save revisions of todo changes
* If I should keep improving this app, I will make suite of behavioral tests
* Catch exceptions and turn to 500 on api.
