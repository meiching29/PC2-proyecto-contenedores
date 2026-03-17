FROM node:20-alpine

# Instalar Docker CLI dentro del contenedor
RUN apk add --no-cache docker-cli

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

EXPOSE 4000

CMD ["node", "index.js"]