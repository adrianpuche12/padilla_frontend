# Stage 1 — Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# PRO-008: vacio por defecto = URLs relativas (/api/...) que resuelve el proxy de nginx.
# Antes el default era el backend de PROD (http://100.84.196.79:9080).
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2 — Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# PRO-008: nginx como template; el backend se elige por ambiente con BACKEND_UPSTREAM
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
RUN rm -f /etc/nginx/conf.d/default.conf
ENV BACKEND_UPSTREAM=padilla-backend-dev:8080
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
