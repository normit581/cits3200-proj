#!/bin/sh

envfile="./release.env"
virtualenv=".venv/bin/activate"
appdir="app"

start_app() {
  source "${virtualenv}"

  pip install --upgrade pip 1> /dev/null
  pip install -r requirements.txt 1> /dev/null

  set -a
  source "${envfile}"
  set +a

  flask --app "${appdir}" run
}

case $1 in
  -d) envfile="./debug.env" ;;
esac

start_app
