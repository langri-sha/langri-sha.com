use std::collections::BTreeMap;

use anyhow::{Context, Result, anyhow};
use base64::{Engine, engine::general_purpose::URL_SAFE_NO_PAD};
use jiff::{Timestamp, ToSpan};
use ring::{rand::SystemRandom, rsa::KeyPair, signature::RSA_PKCS1_SHA256};
use rustls_pki_types::{PrivatePkcs1KeyDer, pem::PemObject};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use ureq::Agent;

use crate::http;

/// A GitHub App, which works with repositories through tokens for one of its
/// installations.
pub struct App {
    client_id: String,
    key: KeyPair,
}

impl App {
    pub fn new(client_id: &str, private_key: &str) -> Result<Self> {
        let der = PrivatePkcs1KeyDer::from_pem_slice(private_key.as_bytes())
            .context("the App's private key isn't an RSA key in PEM")?;
        let key = KeyPair::from_der(der.secret_pkcs1_der())
            .map_err(|error| anyhow!("the App's private key was rejected: {error}"))?;

        Ok(Self {
            client_id: client_id.to_owned(),
            key,
        })
    }

    /// A token for the App's installation on a user account, limited to the
    /// permissions given, at the access given for each, and to the
    /// repositories named, if any. An organization's installation is found
    /// under `/orgs/` rather than `/users/`.
    pub fn installation_token(
        &self,
        agent: &Agent,
        owner: &str,
        permissions: &[(&str, Access)],
        repositories: &[&str],
    ) -> Result<String> {
        #[derive(Deserialize)]
        struct Installation {
            id: u64,
        }

        #[derive(Deserialize)]
        struct Token {
            token: String,
        }

        let authorization = format!("Bearer {}", self.jwt(Timestamp::now())?);

        let url = format!("https://api.github.com/users/{owner}/installation");
        let installation: Installation = http::json(http::call(|| {
            agent
                .get(&url)
                .header("Accept", "application/vnd.github+json")
                .header("Authorization", &authorization)
                .call()
        })?)?;

        let url = format!(
            "https://api.github.com/app/installations/{}/access_tokens",
            installation.id
        );
        let token: Token = http::json(http::call(|| {
            agent
                .post(&url)
                .header("Accept", "application/vnd.github+json")
                .header("Authorization", &authorization)
                .send_json(token_request(permissions, repositories))
        })?)?;

        Ok(token.token)
    }

    fn jwt(&self, now: Timestamp) -> Result<String> {
        let header = URL_SAFE_NO_PAD.encode(json!({ "alg": "RS256", "typ": "JWT" }).to_string());
        let claims = URL_SAFE_NO_PAD.encode(serde_json::to_vec(&claims(&self.client_id, now)?)?);
        let message = format!("{header}.{claims}");

        let mut signature = vec![0; self.key.public().modulus_len()];
        self.key
            .sign(
                &RSA_PKCS1_SHA256,
                &SystemRandom::new(),
                message.as_bytes(),
                &mut signature,
            )
            .map_err(|_| anyhow!("couldn't sign a JWT with the App's private key"))?;

        Ok(format!("{message}.{}", URL_SAFE_NO_PAD.encode(signature)))
    }
}

#[derive(Debug, PartialEq, Serialize)]
struct Claims {
    iat: i64,
    exp: i64,
    iss: String,
}

/// GitHub refuses a JWT that expires more than 10 minutes out, and one issued
/// ahead of its clock, so the issue time is backdated a minute.
fn claims(client_id: &str, now: Timestamp) -> Result<Claims> {
    Ok(Claims {
        iat: now.checked_sub(1.minute())?.as_second(),
        exp: now.checked_add(9.minutes())?.as_second(),
        iss: client_id.to_owned(),
    })
}

/// What a token may do with a permission.
#[derive(Clone, Copy, Debug, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Access {
    Read,
    Write,
}

/// The App can do more than read, so its tokens get only the permissions a job
/// names, at the access it names, and only on the repositories it names, if
/// any.
fn token_request(permissions: &[(&str, Access)], repositories: &[&str]) -> Value {
    let permissions: BTreeMap<_, _> = permissions.iter().copied().collect();

    if repositories.is_empty() {
        json!({ "permissions": permissions })
    } else {
        json!({ "permissions": permissions, "repositories": repositories })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn claims_identify_the_app_for_nine_minutes() {
        assert_eq!(
            claims("Iv23li8Mal7heKr0n", "2026-10-06T15:00:00Z".parse().unwrap()).unwrap(),
            Claims {
                iat: 1_791_298_740,
                exp: 1_791_299_340,
                iss: "Iv23li8Mal7heKr0n".to_owned(),
            },
        );
    }

    #[test]
    fn tokens_get_the_access_asked_for() {
        assert_eq!(
            token_request(
                &[("administration", Access::Read), ("metadata", Access::Read)],
                &[]
            ),
            json!({ "permissions": { "administration": "read", "metadata": "read" } }),
        );
    }

    #[test]
    fn tokens_can_be_limited_to_repositories() {
        assert_eq!(
            token_request(
                &[("contents", Access::Write), ("metadata", Access::Read)],
                &["npm_lazy"]
            ),
            json!({
                "permissions": { "contents": "write", "metadata": "read" },
                "repositories": ["npm_lazy"],
            }),
        );
    }

    #[test]
    fn refuses_what_isnt_a_key() {
        assert!(App::new("Iv23li8Mal7heKr0n", "not a key").is_err());
    }
}
