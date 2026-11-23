FROM node:22-alpine
WORKDIR /app
COPY package.json .
RUN npm install --omit=dev
COPY server.js .
# Pasta de log pertencente ao usuário "node" (sem privilégio de root)
RUN mkdir -p /var/log/lab-api && chown node:node /var/log/lab-api
USER node
EXPOSE 3000
CMD ["node", "server.js"]
