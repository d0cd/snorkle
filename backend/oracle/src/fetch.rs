use ureq::config::Config;

use ureq::unversioned::transport::DefaultConnector;

use snarkvm::prelude::Network;

use super::Oracle;
use crate::http::Resolver;

impl<N: Network> Oracle<N> {
    /// Fetches data from a public API
    ///
    /// Note: Currently this just contacts example.com and then returns random data
    pub fn fetch_scores(&self) -> anyhow::Result<(u8, u8)> {
        let config = Config::builder().build();
        let resolver = Resolver::default();
        let connector = DefaultConnector::new();

        let agent = ureq::Agent::with_parts(config, connector, resolver);
        let _response = agent.get("https://example.com".to_string()).call()?;

        println!("Got response from (mock) API");
        Ok((rand::random(), rand::random()))
    }
}
