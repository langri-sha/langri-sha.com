# syntax=docker/dockerfile:1

ARG alpine_version
ARG google_cloud_sdk_version
ARG kubernetes_version
ARG terraform_version

FROM google/cloud-sdk:${google_cloud_sdk_version}-alpine as google_cloud_sdk
FROM hashicorp/terraform:${terraform_version} as terraform

FROM alpine:${alpine_version} as kubernetes

RUN <<EOF
apk add --no-cache \
	curl

curl -LO https://dl.k8s.io/release/v${kubernetes_version}/bin/linux/amd64/kubectl
echo "8a45348bdaf81d46caf1706c8bf95b3f431150554f47d444ffde89e8cdd712c1  kubectl" | sha256sum --check
chmod +x kubectl
EOF


FROM alpine:${alpine_version}

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
gcloud config set core/disable_usage_reporting true
gcloud config set component_manager/disable_update_check true
gcloud config set metrics/environment github_docker_image
gcloud --version
kubectl version --client
terraform --version
EOF

ENTRYPOINT ["terraform"]
