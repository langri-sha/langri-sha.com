# syntax=docker/dockerfile:1

ARG alpine_version

FROM google/cloud-sdk:483.0.0-alpine as google_cloud_sdk
FROM hashicorp/terraform:1.9.0 as terraform

FROM alpine:3.20 as kubernetes

ARG kubernetes_version

RUN <<EOF
set -e

apk add --no-cache \
	curl

curl -LO https://dl.k8s.io/release/v1.24.3/bin/linux/amd64/kubectl
echo "8a45348bdaf81d46caf1706c8bf95b3f431150554f47d444ffde89e8cdd712c1  kubectl" | sha256sum -c
chmod +x kubectl
EOF


FROM alpine:3.20

ARG uid

ENV PATH "/google-cloud-sdk/bin:$PATH"

COPY --from=terraform /bin/terraform /bin/terraform
COPY --from=google_cloud_sdk /google-cloud-sdk /google-cloud-sdk
COPY --from=kubernetes kubectl /bin/kubectl

RUN <<EOF
apk add --update \
		ca-certificates \
		git \
		jq \
		openssh \
		openssl \
		python3 \
		python3-dev
addgroup -g $uid -S terraform
adduser -S -u $uid -G terraform terraform
rm -rf /var/cache/apk/*
EOF

USER terraform

RUN <<EOF
set -e

gcloud config set core/disable_usage_reporting true
gcloud config set component_manager/disable_update_check true
gcloud config set metrics/environment github_docker_image
gcloud --version
kubectl version --client
terraform --version
EOF

ENTRYPOINT ["terraform"]
