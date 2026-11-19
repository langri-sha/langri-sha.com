#!/usr/bin/env bash
set -euo pipefail

: "${SERVICE:?}"
: "${IMAGE:?}"
: "${IMAGE_TAG:?}"
: "${PROJECT:?}"
: "${REGION:?}"

TRAFFIC_TAG="${TRAFFIC_TAG:-}"

if [ -n "$TRAFFIC_TAG" ]; then
  gcloud run deploy "$SERVICE" \
    --image "$IMAGE:$IMAGE_TAG" \
    --no-traffic \
    --project "$PROJECT" \
    --quiet \
    --region "$REGION" \
    --tag "$TRAFFIC_TAG"
  exit 0
fi

: "${GITHUB_RUN_ID:?}"
GITHUB_RUN_ATTEMPT="${GITHUB_RUN_ATTEMPT:-1}"

REVISION_SUFFIX="run-${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}"
REVISION="${SERVICE}-${REVISION_SUFFIX}"

gcloud run deploy "$SERVICE" \
  --image "$IMAGE:$IMAGE_TAG" \
  --no-traffic \
  --project "$PROJECT" \
  --quiet \
  --region "$REGION" \
  --revision-suffix "$REVISION_SUFFIX"

gcloud run revisions describe "$REVISION" \
  --format 'json(status.conditions)' \
  --project "$PROJECT" \
  --quiet \
  --region "$REGION" \
  | jq -e 'any(.status.conditions[]?; .type=="Ready" and .status=="True")' \
  || { echo "ERROR: revision $REVISION is not Ready" >&2; exit 1; }

echo "Routing 100% traffic to revision: $REVISION"

gcloud run services update-traffic "$SERVICE" \
  --project "$PROJECT" \
  --quiet \
  --region "$REGION" \
  --to-revisions="$REVISION=100"

CONFIRMED=false
for attempt in 1 2 3; do
  if gcloud run services describe "$SERVICE" \
      --format 'json(status.traffic)' \
      --project "$PROJECT" \
      --quiet \
      --region "$REGION" \
      | jq -e --arg revision "$REVISION" \
          'any(.status.traffic[]?; .revisionName == $revision and .percent == 100)'; then
    echo "Confirmed: $REVISION serving 100% traffic"
    CONFIRMED=true
    break
  fi
  if [ "$attempt" -lt 3 ]; then
    sleep 5
  fi
done

if [ "$CONFIRMED" = "false" ]; then
  echo "ERROR: revision $REVISION not confirmed at 100% traffic after $attempt checks" >&2
  exit 1
fi
