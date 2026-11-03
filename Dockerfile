# NODE_EXTRA_CA_CERTS e usado apenas no passo de instalacao, com o bundle de CAs
# do host montado via build context (gere com scripts/export-corporate-ca.ps1).
# Necessario quando o proxy corporativo intercepta TLS; em rede sem proxy o
# bundle fica vazio e nada muda.

# ---------------------------------------------------------------- base
FROM node:20-slim AS base
WORKDIR /app
COPY package*.json ./

# ---------------------------------------------------------------- dev
FROM base AS development
ENV NODE_ENV=development
RUN --mount=type=bind,from=certs,target=/certs,ro \
    NODE_EXTRA_CA_CERTS=/certs/corporate-ca.pem npm install --no-audit --no-fund
COPY . .
EXPOSE 5273
CMD ["npm", "run", "dev"]

# ---------------------------------------------------------------- build
FROM base AS build
RUN --mount=type=bind,from=certs,target=/certs,ro \
    NODE_EXTRA_CA_CERTS=/certs/corporate-ca.pem npm install --no-audit --no-fund
COPY . .
ARG VITE_API_URL=http://localhost:3333/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---------------------------------------------------------------- prod
FROM nginx:1.27-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
