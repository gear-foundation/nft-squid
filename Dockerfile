FROM node:20-alpine

WORKDIR /app

ARG DB_PASSWORD
ENV DB_PASSWORD=${DB_PASSWORD} 

COPY . .
RUN npm install
RUN npm run build

CMD ["npm", "start"]
