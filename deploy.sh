#!/bin/sh

docker stop pipeline || true && docker rm pipeline || true
docker build --tag pipeline .
docker run --env "VIRTUAL_HOST=pipeline.scaffold.cloud" --env "LETSENCRYPT_HOST=pipeline.scaffold.cloud" --name pipeline -d -p 8086:8080 pipeline