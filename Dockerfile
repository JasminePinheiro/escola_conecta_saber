FROM node:20-alpine

WORKDIR /usr/app

COPY package.json ./

COPY . .

RUN npm install

ARG MONGO_URI
ARG JWT_SECRET

ENV MONGO_URI=${MONGO_URI}
ENV JWT_SECRET=${JWT_SECRET}

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]

