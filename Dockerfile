FROM node:20-alpine

WORKDIR /app
COPY . .
RUN rm .env*
RUN npm install
RUN npm run build

CMD ["npm", "start"]
