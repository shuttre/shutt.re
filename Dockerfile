FROM node:10 AS build-env-node

# Copy csproj and restore projects
WORKDIR /app/shutt.re
COPY . ./
RUN npm install
RUN npm run build

# Build runtime image
FROM nginx
WORKDIR /app/shutt.re
COPY --from=build-env-node /app/shutt.re/build ./build
COPY ./scripts/docker/extra/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./scripts/docker/extra/env2file_on_start.sh ./
RUN chmod +x /app/shutt.re/env2file_on_start.sh

ENTRYPOINT ["/app/shutt.re/env2file_on_start.sh"]
CMD ["nginx", "-g", "daemon off;"]
