
FROM node:lts AS builder
WORKDIR /app
COPY . .
RUN rm package-lock.json
RUN npm install

# Production stage
FROM node:lts AS production
WORKDIR /app
COPY --from=builder /app .
RUN ls -l /app
RUN npm config set registry https://verdaccio.haddoworld.com
RUN npm install wfh-rabbit-utilities@^1.0.81
EXPOSE 8082
CMD ["npm", "start"]
