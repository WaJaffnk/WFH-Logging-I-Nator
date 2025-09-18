# Use official Node.js image as the build environment
FROM node:lts AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:lts AS production
WORKDIR /app
COPY --from=builder /app .
RUN ls -l /app
RUN npm config set registry https://verdaccio.haddoworld.com
RUN npm install wfh-rabbit-utilities@^1.0.81    

EXPOSE 4173
CMD ["npm", "run", "dev"]

