FROM node:8.12

COPY . .

RUN npm install

CMD npm start