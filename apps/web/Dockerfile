FROM nginx:1.31.10-alpine@sha256:7fc0fb4af7bf006aeb31aea88069976060f8f0a0a86b667126742cc17f4e31ae

# Cloud Run injects PORT. The default keeps `docker run` and Compose working.
ENV PORT=8080

# Rendered over the stock `default.conf` so the image serves the site and
# nothing else.
COPY preview-origin.conf.template /etc/nginx/templates/default.conf.template

COPY dist /usr/share/nginx/html

EXPOSE 8080
