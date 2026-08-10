FROM nginx:alpine

# Cloud Run injects PORT. The default keeps `docker run` and Compose working.
ENV PORT=8080

# The metadata server is DNS on Cloud Run. Compose overrides this with Docker's
# embedded resolver; see the `resolver` directive in the template.
ENV RESOLVER=169.254.169.254

# Rendered over the stock `default.conf` so the image serves the router and
# nothing else.
COPY preview-router.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 8080
