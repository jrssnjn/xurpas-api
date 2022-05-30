#!/usr/bin/bash
set -e

build_name=app_api

while getopts b: option
do
case "${option}"
in
b) build_name=${OPTARG};;
esac
done

docker run -p 3000:3000 --env-file .env $build_name