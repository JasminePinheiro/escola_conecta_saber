FROM node:22-alpine

WORKDIR /usr/app

COPY package.json ./

COPY . .

RUN npm install

ARG MONGO_URI
ARG JWT_SECRET

ENV MONGO_URI=${MONGO_URI}

RUN echo "MONGO_URI=${MONGO_URI}" > .env
RUN echo "JWT_SECRET=${JWT_SECRET}" > .env

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]

