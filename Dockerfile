FROM node:alpine 

COPY . /app

WORKDIR /app

RUN npm config set registry http://host.docker.internal:4873

RUN npm install

EXPOSE 8082

CMD ["npm", "start"]