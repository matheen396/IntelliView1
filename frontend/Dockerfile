FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ARG VITE_API_URL
ARG VITE_ENABLE_REAL_AUTH=true
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_ENABLE_REAL_AUTH=${VITE_ENABLE_REAL_AUTH}
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
