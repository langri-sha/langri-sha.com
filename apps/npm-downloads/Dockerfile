FROM rust:1-slim-trixie AS build

WORKDIR /src

COPY rust-toolchain.toml ./
RUN rustup toolchain install --no-self-update

COPY Cargo.toml Cargo.lock ./
COPY packages/telemetry packages/telemetry
COPY apps/npm-downloads apps/npm-downloads

# Cargo won't load a workspace with a member missing, so the other apps leave
# its members.
RUN sed -i '/^  "apps\//{/"apps\/npm-downloads"/!d}' Cargo.toml
RUN cargo build --locked --release --package npm-downloads

FROM gcr.io/distroless/cc-debian13:nonroot

COPY --from=build /src/target/release/npm-downloads /usr/local/bin/npm-downloads

ENTRYPOINT ["/usr/local/bin/npm-downloads"]
