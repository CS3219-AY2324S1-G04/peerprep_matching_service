FROM node:lts-hydrogen

COPY ./build /peerprep_matching_service_api/
COPY package.json /peerprep_matching_service_api/
COPY package-lock.json /peerprep_matching_service_api/

WORKDIR /peerprep_matching_service_api

RUN npm install --omit=dev -y

CMD node main.js
