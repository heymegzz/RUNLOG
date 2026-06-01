FROM node:20.19-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
EXPOSE 5005
CMD ["npm", "start"]
