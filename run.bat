@echo off
cd ./api
call npm run build
:: npm run start:dev

call docker build -t matching_service .

cd ..
docker-compose up
