FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

EXPOSE 3002

# Update the wait-for-it command to use the correct database host
CMD ["/wait-for-it.sh", "puisi-db:5432", "--", "node", "src/index.js"]