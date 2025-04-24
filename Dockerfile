FROM node:20-alpine AS base

WORKDIR /app
COPY . .

RUN npm install

RUN npm run build

# Stage de produção
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public

EXPOSE 3002
CMD ["npm", "start"]
