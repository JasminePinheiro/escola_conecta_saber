FROM node:18-slim

WORKDIR /usr/app

COPY package.json ./

COPY . .

RUN npm install

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
