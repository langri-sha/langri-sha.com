ARG alpine_version
ARG google_cloud_sdk_version
ARG terraform_version

FROM google/cloud-sdk:${google_cloud_sdk_version}-alpine as google_cloud_sdk
FROM hashicorp/terraform:${terraform_version} as terraform

FROM alpine:${alpine_version}

ARG uid

ENV PATH "/google-cloud-sdk/bin:$PATH"

COPY --from=terraform /bin/terraform /bin/terraform
COPY --from=google_cloud_sdk /google-cloud-sdk /google-cloud-sdk

RUN apk add --update \
		ca-certificates \
		git \
		jq \
		openssh \
		openssl \
		python3 \
		python3-dev \
	&& addgroup -g $uid -S terraform \
	&& adduser -S -u $uid -G terraform terraform  \
	&& rm -rf /var/cache/apk/*

USER terraform

RUN gcloud config set core/disable_usage_reporting true \
	&& gcloud config set component_manager/disable_update_check true \
	&& gcloud config set metrics/environment github_docker_image \
	&& gcloud --version \
	&& terraform --version

ENTRYPOINT ['terraform']
