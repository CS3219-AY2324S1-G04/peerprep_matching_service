#!/bin/bash
matching_service_image_name='peerprep_matching_service_api'
matching_service_mongo='peerprep_matching_service_mongo_init'

cd ./matchingApi
npm run build 

if [ $? -eq 0 ]; then
    # Step 3: If npm run build succeeded, run docker build
    docker build -t "$matching_service_image_name" . --no-cache
else
    # Step 4: If npm run build failed, display an error message
    echo "npm run build failed. Aborting Docker build."
    exit 1
fi

cd ..

cd ./matchingMongoInit
npm run build 

if [ $? -eq 0 ]; then
    # Step 3: If npm run build succeeded, run docker build
    docker build -t "$matching_service_mongo" . 
else
    # Step 4: If npm run build failed, display an error message
    echo "npm run build failed. Aborting Docker build."
    exit 1
fi

cd ..
docker-compose create
