FROM nginx:alpine

# Cloud Run injects PORT. The default keeps `docker run` and Compose working.
ENV PORT=8080

# The metadata server is DNS on Cloud Run. Compose overrides this with Docker's
# embedded resolver; see the `resolver` directive in the template.
ENV RESOLVER=169.254.169.254

# Rendered over the stock `default.conf` so the image serves the router and
# nothing else.
COPY preview-router.conf.template /etc/nginx/templates/default.conf.template

# Runs before the entrypoint renders the template, and writes the locations the
# template includes. It lives here because the checks build the image with the
# template alone for context.
COPY --chmod=755 <<'SCRIPT' /docker-entrypoint.d/15-preview-apps.sh
#!/bin/sh
# Writes the pull request locations of the apps in PREVIEW_APPS, a list of
# `<name>=<service host>` pairs separated by spaces or commas, to the file the
# router template includes. An app is served at `/pull/<n>/<name>/` from the
# `pull-<n>` revision of its own Cloud Run service. With no apps the file is
# empty.

set -eu

out=/etc/nginx/preview-apps.conf

: > "$out"

for app in $(printf '%s' "${PREVIEW_APPS:-}" | tr ',' ' '); do
  name=${app%%=*}
  host=${app#*=}

  case "$app" in
    *=*) ;;
    *)
      echo "$0: '$app' is not <name>=<host>" >&2
      exit 1
      ;;
  esac

  case "$name" in
    '' | -* | voice-editor | *[!a-z0-9-]*)
      echo "$0: '$name' is not a name an app can have" >&2
      exit 1
      ;;
  esac

  case "$host" in
    '' | .* | *[!a-z0-9.-]*)
      echo "$0: '$host' is not a service host" >&2
      exit 1
      ;;
  esac

  cat >> "$out" <<LOCATIONS
location ~ "^/pull/([1-9][0-9]{0,6})/$name/(.*)\$" {
  set \$service pull-\$1---$host;
  proxy_pass    https://\$service/\$2\$is_args\$args;
}

location ~ "^/pull/([1-9][0-9]{0,6})/$name\$" {
  return 308 /pull/\$1/$name/\$is_args\$args;
}

LOCATIONS

  echo "$0: routing /pull/<n>/$name/ to pull-<n>---$host"
done
SCRIPT

EXPOSE 8080
