FROM node:20-alpine

# Instala certificados SSL necessários para MongoDB Atlas
RUN apk add --no-cache openssl ca-certificates

WORKDIR /usr/app

COPY package.json ./

COPY . .

RUN npm install

RUN npm run build

EXPOSE 3000


CMD ["node", "dist/main"]
