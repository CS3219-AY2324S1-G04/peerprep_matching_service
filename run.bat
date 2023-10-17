@echo off
cd ./api/matchingAPI
call npm run build
:: npm run start:dev

call docker build -t matching_service .


cd ./api/matchingAPI
call npm run build
call docker build -t room_service .

cd ..
docker-compose up
