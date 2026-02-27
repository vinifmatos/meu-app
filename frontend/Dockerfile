# ---------- BUILD ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

ARG PR_PATH

RUN yarn build

# ---------- NGINX ----------
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/meu-app/browser /usr/share/nginx/html
