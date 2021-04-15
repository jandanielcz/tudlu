Tudlů
=====

This is excercise with objective cca:
* make a TODO list, that loads list of todos and allows to change todo as done
* every task does have text and information if it is done or not
* status update should be without reloading page in browser
* todos should be presisted somewhere

Installation
------------
* composer install
* npm install
* set env var `TUDLU_SQLITE_DB_PATH` to path to sqlite file (will be created if doesn't already exists)

Run in dev
----------
* run php for example: `php -S 127.0.0.1:888`
* run `npx webpack -w` for webpack watch
* run `npm run-script styles` for scss compilation watching

Simplifications
---------------

* API and UI are in signle repo, for simpler presentation - but separated
* There is no possibility to: remove todo, get todo detail...