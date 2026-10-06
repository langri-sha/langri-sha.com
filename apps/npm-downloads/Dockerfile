FROM rust:1-slim-trixie AS build

WORKDIR /src

COPY rust-toolchain.toml ./
RUN rustup toolchain install --no-self-update

COPY Cargo.toml Cargo.lock ./
COPY apps/npm-downloads apps/npm-downloads
COPY packages/telemetry packages/telemetry
RUN cargo build --locked --release --package npm-downloads

FROM gcr.io/distroless/cc-debian13:nonroot

COPY --from=build /src/target/release/npm-downloads /usr/local/bin/npm-downloads

ENTRYPOINT ["/usr/local/bin/npm-downloads"]
