use anyhow::Result;
use serde::Serialize;
use serde_json::json;
use ureq::Agent;

use crate::http;

/// Events per request, well under the batch endpoint's 20 MB limit.
const BATCH_SIZE: usize = 1000;

/// Send events through the batch endpoint.
///
/// `historical` routes them through the pipeline PostHog keeps for imports,
/// which spares a backfill the rate limit live events see per distinct ID.
pub fn capture(
    agent: &Agent,
    host: &str,
    token: &str,
    events: &[impl Serialize],
    historical: bool,
) -> Result<()> {
    let url = format!("{}/batch/", host.trim_end_matches('/'));

    for batch in events.chunks(BATCH_SIZE) {
        let body = json!({
            "api_key": token,
            "historical_migration": historical,
            "batch": batch,
        });

        http::check(http::call(|| agent.post(&url).send_json(&body))?)?;
    }

    Ok(())
}
