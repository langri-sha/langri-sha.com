FROM nginx:alpine

ENV PORT=8080

ENV RESOLVER=169.254.169.254

ENV POSTHOG_ASSETS_HOST=eu-assets.i.posthog.com
ENV POSTHOG_INGESTION_HOST=eu.i.posthog.com

COPY posthog-proxy.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 8080
