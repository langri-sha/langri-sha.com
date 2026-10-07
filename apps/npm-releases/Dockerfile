FROM rust:1-slim-trixie AS build

WORKDIR /src

COPY rust-toolchain.toml ./
RUN rustup toolchain install --no-self-update

COPY Cargo.toml Cargo.lock ./
COPY packages/telemetry packages/telemetry
COPY apps/npm-releases apps/npm-releases

# Cargo won't load a workspace with a member missing, so the other apps leave
# its members.
RUN sed -i '/^  "apps\//{/"apps\/npm-releases"/!d}' Cargo.toml

# Cargo then prunes their crates from Cargo.lock, which --locked forbids. The
# workspace check keeps Cargo.lock current instead.
RUN cargo build --release --package npm-releases

FROM gcr.io/distroless/cc-debian13:nonroot

COPY --from=build /src/target/release/npm-releases /usr/local/bin/npm-releases

ENTRYPOINT ["/usr/local/bin/npm-releases"]
