FROM node:20-alpine AS b
WORKDIR /a
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build
FROM node:20-alpine
WORKDIR /a
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000
COPY --from=b /a/.next/standalone ./
COPY --from=b /a/.next/static ./.next/static
COPY --from=b /a/public ./public
EXPOSE 3000
CMD ["node","server.js"]
