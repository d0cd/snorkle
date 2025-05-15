use std::str::FromStr;

use rand::rngs::OsRng;

use anyhow::Context;

use snarkvm::ledger::store::helpers::memory::ConsensusMemory;
use snarkvm::prelude::store::ConsensusStore;
use snarkvm::prelude::*;

use snorkle_oracle_interface::GameData;

use super::Oracle;

/// Generates a transaction for the oracle's private key, event ID, and game data.
impl<N: Network> Oracle<N> {
    pub fn init_program() -> Program<N> {
        Program::<N>::from_str(include_str!(
            "../../resources/proto_snorkle_oracle_001.aleo"
        ))
        .expect("Failed to create the program")
    }

    pub fn generate_transaction(&self, game_data: GameData) -> anyhow::Result<Transaction<N>> {
        // Create the game data.
        let data_str = format!(
            r"
{{
    id: {},
    home_team_score: {}u8,
    away_team_score: {}u8
}}",
            game_data.event_id, game_data.home_score, game_data.away_score
        );

        let game_data = Value::<N>::from_str(&data_str).expect("Failed to create game data");

        let signature = self.key.sign(&game_data.to_fields()?, &mut OsRng)?;
        let signature = Value::<N>::from_str(&signature.to_string())?;

        // Initialize a VM.
        let vm = VM::<N, ConsensusMemory<N>>::from(
            ConsensusStore::open(0).expect("Failed to initialize the consensus store"),
        )
        .expect("Failed to initialize the VM");

        // Add the oracle program to the process.
        vm.process()
            .write()
            .add_program(&self.program)
            .expect("Failed to add program");

        // Create the transaction.
        vm.execute(
            &self.key,
            (self.program.id(), "submit_event"),
            [game_data, signature].into_iter(),
            None,
            0,
            None,
            &mut OsRng,
        )
        .with_context(|| "Failed to create a transaction")
    }
}
