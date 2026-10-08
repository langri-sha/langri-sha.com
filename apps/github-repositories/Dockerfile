FROM rust:1-slim-trixie AS build

WORKDIR /src

COPY rust-toolchain.toml ./
RUN rustup toolchain install --no-self-update

COPY Cargo.toml Cargo.lock ./
COPY packages/telemetry packages/telemetry
COPY apps/github-repositories apps/github-repositories

# Cargo won't load a workspace with a member missing, so the other apps leave
# its members.
RUN sed -i '/^  "apps\//{/"apps\/github-repositories"/!d}' Cargo.toml

# Cargo then prunes their crates from Cargo.lock, which --locked forbids. The
# workspace check keeps Cargo.lock current instead.
RUN cargo build --release --package github-repositories

FROM gcr.io/distroless/cc-debian13:nonroot

COPY --from=build /src/target/release/github-repositories /usr/local/bin/github-repositories

ENTRYPOINT ["/usr/local/bin/github-repositories"]
