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

docker start $build_name