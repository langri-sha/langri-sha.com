# syntax=docker/dockerfile:1

ARG alpine_version
ARG node_version

FROM node:${node_version}-alpine${alpine_version}

ARG uid
ARG glibc_version

RUN <<EOF
rm -rf /opt/yarn* /usr/local/bin/yarn*
wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub
wget -q https://github.com/sgerrand/alpine-pkg-glibc/releases/download/${glibc_version}/glibc-${glibc_version}.apk
apk add --no-cache --update --upgrade \
	ca-certificates \
	g++ \
	git \
	make \
	openssh \
	python3 \
	wget \
	yarn \
	glibc-${glibc_version}.apk
rm glibc-${glibc_version}.apk

npm install -g pnpm

if [[ -z "$uid" ]] && [[ "$uid" != "0" ]]; then
	rm -rf /home/node
	addgroup -g $uid node
	adduser -u $uid -G node -s /bin/sh -D node;
elif [[ "$uid" == "0" ]]; then
	addgroup node root;
fi
EOF

USER node

ENTRYPOINT ["pnpm"]
