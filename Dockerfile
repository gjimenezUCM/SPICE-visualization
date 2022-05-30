# build stage
FROM node:lts-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/css /usr/share/nginx/html/css
COPY --from=build-stage /app/dist /usr/share/nginx/html/dist
COPY --from=build-stage /app/data /usr/share/nginx/html/data
COPY --from=build-stage /app/node_modules /usr/share/nginx/html/node_modules
COPY --from=build-stage /app/index.html /usr/share/nginx/html
WORKDIR /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# docker build -t spice_vis .
# docker run it -p 8080:80 -rm spice_vis