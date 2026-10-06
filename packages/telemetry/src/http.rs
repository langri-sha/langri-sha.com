use std::{thread, time::Duration};

use anyhow::{Result, bail};
use serde::de::DeserializeOwned;
use ureq::{
    Body, ResponseExt,
    http::{Response, StatusCode, header::RETRY_AFTER},
};

const ATTEMPTS: u32 = 5;

/// Make a request, retrying it while it is throttled or failing.
///
/// npm's Cloudflare rate limit turns a client away for a minute or two while
/// its `Retry-After` asks for next to nothing, so the backoff — a few minutes
/// all told — sets the floor on how long to wait.
pub fn call(request: impl Fn() -> Result<Response<Body>, ureq::Error>) -> Result<Response<Body>> {
    let mut backoff = Duration::from_secs(10);

    for attempt in 1..=ATTEMPTS {
        let wait = match request() {
            Ok(response) if !retryable(response.status()) || attempt == ATTEMPTS => {
                return Ok(response);
            }
            Ok(response) => {
                let wait = retry_after(&response).unwrap_or_default().max(backoff);

                eprintln!(
                    "{} from {}, retrying in {}s",
                    response.status(),
                    response.get_uri(),
                    wait.as_secs(),
                );

                wait
            }
            Err(error) if attempt == ATTEMPTS => return Err(error.into()),
            Err(error) => {
                eprintln!("{error}, retrying in {}s", backoff.as_secs());

                backoff
            }
        };

        thread::sleep(wait);
        backoff *= 2;
    }

    unreachable!()
}

/// Fail on an unsuccessful response, with its body for the reason.
pub fn check(mut response: Response<Body>) -> Result<Response<Body>> {
    let status = response.status();

    if !status.is_success() {
        let uri = response.get_uri().clone();
        let body = response.body_mut().read_to_string().unwrap_or_default();

        bail!("{status} from {uri}: {body}");
    }

    Ok(response)
}

pub fn json<T: DeserializeOwned>(response: Response<Body>) -> Result<T> {
    Ok(check(response)?.body_mut().read_json()?)
}

fn retryable(status: StatusCode) -> bool {
    status == StatusCode::TOO_MANY_REQUESTS || status.is_server_error()
}

fn retry_after(response: &Response<Body>) -> Option<Duration> {
    let seconds = response.headers().get(RETRY_AFTER)?.to_str().ok()?;

    Some(Duration::from_secs(seconds.parse().ok()?))
}
