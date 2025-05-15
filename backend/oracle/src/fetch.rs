use ureq::config::Config;

use ureq::unversioned::transport::DefaultConnector;

use snarkvm::prelude::Network;

use super::Oracle;
use crate::http::Resolver;

const GAME_URL: &str = "https://scores-api-349861721231.northamerica-northeast1.run.app/games";

#[allow(dead_code)]
#[derive(serde::Deserialize)]
struct GameInfo {
    id: String,
    home_team_id: String,
    away_team_id: String,
    home_team_score: Option<u8>,
    away_team_score: Option<u8>,
    game_date: String,
    status: String,
}

impl<N: Network> Oracle<N> {
    /// Fetches data from a public API
    ///
    /// Note: Currently this just contacts example.com and then returns random data
    pub fn fetch_scores(&self, game_id: &str) -> anyhow::Result<(u8, u8)> {
        let config = Config::builder().build();
        let resolver = Resolver::default();
        let connector = DefaultConnector::new();

        let agent = ureq::Agent::with_parts(config, connector, resolver);

        println!("Got response from (mock) API");
        let mut response = agent.get(GAME_URL).call()?;
        let data: Vec<GameInfo> = response.body_mut().read_json()?;

        for game in data {
            if game.id == game_id {
                println!("Found game with id={game_id}");
                let home = game.home_team_score.expect("Game not finished yet");
                let away = game.away_team_score.expect("Game not finished yet");

                return Ok((home, away));
            }
        }

        anyhow::bail!("Game with id={game_id} not found");
    }
}
