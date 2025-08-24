# syntax=docker/dockerfile:1

ARG alpine_version

FROM node:20.18-alpine3.19

ARG uid

RUN <<EOF
apk add --no-cache --update --upgrade \
	ca-certificates \
	g++ \
	git \
	make \
	openssh \
	python3 \
	wget \

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
