FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY src ./src

# gecmis.json ve kesintiler.json burada tutulur; docker-compose'da volume'a bağlanır.
RUN mkdir -p /app/data

EXPOSE 8080

CMD ["node", "src/daemon.js"]
