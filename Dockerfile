FROM node:20-alpine AS base

WORKDIR /app
COPY . .

RUN npm install

# Variáveis de ambiente
ENV NEXT_PUBLIC_SERVER_URL=https://api_staging.procstudio.com.br/api/v1
ENV NEXTAUTH_SECRET=procstudio

RUN npm run build

# Stage de produção
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
