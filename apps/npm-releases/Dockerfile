FROM rust:1-slim-trixie AS build

WORKDIR /src

COPY rust-toolchain.toml ./
RUN rustup toolchain install --no-self-update

COPY Cargo.toml Cargo.lock ./
COPY apps/npm-downloads apps/npm-downloads
COPY apps/npm-releases apps/npm-releases
COPY packages/telemetry packages/telemetry
RUN cargo build --locked --release --package npm-releases

FROM gcr.io/distroless/cc-debian13:nonroot

COPY --from=build /src/target/release/npm-releases /usr/local/bin/npm-releases

ENTRYPOINT ["/usr/local/bin/npm-releases"]
