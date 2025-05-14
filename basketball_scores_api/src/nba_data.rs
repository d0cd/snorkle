// use crate::db::AppState; // This was unused as db_pool is passed directly
use crate::models::Team;
use lazy_static::lazy_static;
use sqlx::PgPool;
use uuid::Uuid;

struct NbaTeamInfo {
    city: &'static str,
    name: &'static str,
}

lazy_static! {
    static ref NBA_TEAMS_INFO: Vec<NbaTeamInfo> = vec![
        NbaTeamInfo { city: "Atlanta", name: "Hawks" },
        NbaTeamInfo { city: "Boston", name: "Celtics" },
        NbaTeamInfo { city: "Brooklyn", name: "Nets" },
        NbaTeamInfo { city: "Charlotte", name: "Hornets" },
        NbaTeamInfo { city: "Chicago", name: "Bulls" },
        NbaTeamInfo { city: "Cleveland", name: "Cavaliers" },
        NbaTeamInfo { city: "Dallas", name: "Mavericks" },
        NbaTeamInfo { city: "Denver", name: "Nuggets" },
        NbaTeamInfo { city: "Detroit", name: "Pistons" },
        NbaTeamInfo { city: "Golden State", name: "Warriors" },
        NbaTeamInfo { city: "Houston", name: "Rockets" },
        NbaTeamInfo { city: "Indiana", name: "Pacers" },
        NbaTeamInfo { city: "Los Angeles", name: "Clippers" },
        NbaTeamInfo { city: "Los Angeles", name: "Lakers" },
        NbaTeamInfo { city: "Memphis", name: "Grizzlies" },
        NbaTeamInfo { city: "Miami", name: "Heat" },
        NbaTeamInfo { city: "Milwaukee", name: "Bucks" },
        NbaTeamInfo { city: "Minnesota", name: "Timberwolves" },
        NbaTeamInfo { city: "New Orleans", name: "Pelicans" },
        NbaTeamInfo { city: "New York", name: "Knicks" },
        NbaTeamInfo { city: "Oklahoma City", name: "Thunder" },
        NbaTeamInfo { city: "Orlando", name: "Magic" },
        NbaTeamInfo { city: "Philadelphia", name: "76ers" },
        NbaTeamInfo { city: "Phoenix", name: "Suns" },
        NbaTeamInfo { city: "Portland", name: "Trail Blazers" },
        NbaTeamInfo { city: "Sacramento", name: "Kings" },
        NbaTeamInfo { city: "San Antonio", name: "Spurs" },
        NbaTeamInfo { city: "Toronto", name: "Raptors" },
        NbaTeamInfo { city: "Utah", name: "Jazz" },
        NbaTeamInfo { city: "Washington", name: "Wizards" },
    ];
}

pub async fn initialize_nba_teams(db_pool: &PgPool) -> Result<Vec<Team>, sqlx::Error> {
    let mut created_teams = Vec::new();
    let mut transaction = db_pool.begin().await?; // Start a transaction

    for team_info in NBA_TEAMS_INFO.iter() {
        let team_id = Uuid::new_v4();
        let query_result = sqlx::query!(
            "INSERT INTO teams (id, name, city) VALUES ($1, $2, $3) ON CONFLICT (name, city) DO NOTHING RETURNING id, name, city",
            team_id,
            team_info.name,
            team_info.city
        )
        .fetch_optional(&mut *transaction) // Use &mut *transaction for borrowing
        .await?;

        if let Some(record) = query_result {
             let team = Team {
                id: record.id,
                name: record.name,
                city: record.city,
            };
            created_teams.push(team);
            tracing::debug!("Initialized or found NBA Team: {} {}", team_info.city, team_info.name);
        } else {
            // If ON CONFLICT DO NOTHING and team existed, we might want to fetch it to return, or just skip.
            // For simplicity, we only add newly inserted ones to created_teams or those explicitly returned.
            tracing::debug!("NBA Team already exists or no new data: {} {}", team_info.city, team_info.name);
        }
    }
    transaction.commit().await?; // Commit the transaction
    Ok(created_teams)
}

// We can add functions to create mock games here later if needed. 