FROM nginx:alpine

# Cloud Run injects PORT. The default keeps `docker run` and Compose working.
ENV PORT=8080

# Rendered over the stock `default.conf` so the image serves the site and
# nothing else.
COPY preview-origin.conf.template /etc/nginx/templates/default.conf.template

COPY dist /usr/share/nginx/html

EXPOSE 8080
