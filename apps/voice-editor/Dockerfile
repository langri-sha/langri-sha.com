FROM nginx:1.31.9-alpine@sha256:fb4658584bd9a916ffb6f6e365f97c25cfdb2923801f551ea08356e695f14ff7

ENV PORT=8080

COPY preview-origin.conf.template /etc/nginx/templates/default.conf.template

COPY dist /usr/share/nginx/html

EXPOSE 8080
