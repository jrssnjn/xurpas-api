FROM node:17-alpine

RUN npm install -g nodemon pm2

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

EXPOSE 4000

# switch to this command if running in non-dev env.
# CMD ["pm2-runtime", "start", "ecosystem.config.js"]

CMD ["npm", "run", "dev"]
