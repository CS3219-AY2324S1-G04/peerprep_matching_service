@echo off
cd ./api
docker build -t matching_service .

cd ..
docker-compose up
