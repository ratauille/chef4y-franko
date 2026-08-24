FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV PORT=8080
ENV HOST=0.0.0.0
ENV GOOGLE_CLOUD_PROJECT=chefos-502422

EXPOSE 8080

CMD ["npx", "tsx", "src/server.ts"]
