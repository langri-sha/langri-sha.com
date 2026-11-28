FROM nginx:1.31.9-alpine@sha256:fb4658584bd9a916ffb6f6e365f97c25cfdb2923801f551ea08356e695f14ff7

# Cloud Run injects PORT. The default keeps `docker run` and Compose working.
ENV PORT=8080

# Rendered over the stock `default.conf` so the image serves the site and
# nothing else.
COPY preview-origin.conf.template /etc/nginx/templates/default.conf.template

COPY dist /usr/share/nginx/html

EXPOSE 8080
