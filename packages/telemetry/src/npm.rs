use anyhow::Result;
use serde::Deserialize;
use ureq::Agent;

use crate::http;

pub struct Package {
    pub name: String,
    /// Where the source lives, as a web address.
    pub repository: Option<String>,
}

/// The packages a user maintains, by name.
pub fn maintained_packages(agent: &Agent, maintainer: &str) -> Result<Vec<Package>> {
    #[derive(Deserialize)]
    struct Page {
        objects: Vec<Object>,
        total: usize,
    }

    #[derive(Deserialize)]
    struct Object {
        package: Listing,
    }

    #[derive(Deserialize)]
    struct Listing {
        name: String,
        #[serde(default)]
        links: Links,
    }

    #[derive(Default, Deserialize)]
    struct Links {
        repository: Option<String>,
    }

    let text = format!("maintainer:{maintainer}");
    let mut packages = Vec::new();

    loop {
        let from = packages.len().to_string();
        let response = http::call(|| {
            agent
                .get("https://registry.npmjs.org/-/v1/search")
                .query("text", &text)
                .query("size", "250")
                .query("from", &from)
                .call()
        })?;
        let page: Page = http::json(response)?;

        if page.objects.is_empty() {
            break;
        }

        packages.extend(page.objects.into_iter().map(|Object { package }| Package {
            name: package.name,
            repository: package.links.repository.as_deref().map(web_address),
        }));

        if packages.len() >= page.total {
            break;
        }
    }

    packages.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(packages)
}

/// The web address of a repository, from the `repository` URL npm keeps for
/// it, e.g. `git+https://github.com/langri-sha/projen.git`.
fn web_address(url: &str) -> String {
    let url = url.strip_prefix("git+").unwrap_or(url);
    let url = url.strip_suffix(".git").unwrap_or(url);

    for scheme in ["ssh://git@", "git://"] {
        if let Some(rest) = url.strip_prefix(scheme) {
            return format!("https://{rest}");
        }
    }

    url.to_owned()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn web_addresses() {
        for url in [
            "git+https://github.com/langri-sha/projen.git",
            "git+ssh://git@github.com/langri-sha/projen.git",
            "git://github.com/langri-sha/projen.git",
            "https://github.com/langri-sha/projen",
        ] {
            assert_eq!(web_address(url), "https://github.com/langri-sha/projen");
        }
    }
}
