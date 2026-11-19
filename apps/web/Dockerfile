FROM nginx:1.31.9-alpine@sha256:90b6bd2aec278b16b98221d64deb1d6d35d164567f507ab0716e6053878315aa

# Cloud Run injects PORT. The default keeps `docker run` and Compose working.
ENV PORT=8080

# Rendered over the stock `default.conf` so the image serves the site and
# nothing else.
COPY preview-origin.conf.template /etc/nginx/templates/default.conf.template

COPY dist /usr/share/nginx/html

EXPOSE 8080
