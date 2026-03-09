FROM node:24.8.0-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./

COPY .yarn ./.yarn

RUN yarn install --immutable

COPY . .

RUN yarn build --base-href=/${PREFIX_PATH}/ --deploy-url=/${PREFIX_PATH}/

FROM nginx:stable-alpine

RUN touch /var/run/nginx.pid && \
  chown -R 101:101 /var/run/nginx.pid /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

RUN rm /etc/nginx/conf.d/default.conf

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/meu-app/browser /usr/share/nginx/html

RUN chown -R 101:101 /usr/share/nginx/html

USER 101

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
