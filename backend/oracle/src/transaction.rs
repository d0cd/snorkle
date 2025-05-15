use std::str::FromStr;

use rand::rngs::OsRng;

use snarkvm::ledger::store::helpers::memory::ConsensusMemory;
use snarkvm::prelude::store::ConsensusStore;
use snarkvm::prelude::{Network, PrivateKey, Program, Transaction, Value, VM};

use snorkle_oracle_interface::GameData;

/// Generates a transaction for the oracle's private key, event ID, and game data.
pub fn generate_transaction<N: Network>(game_data: GameData) -> Transaction<N> {
    let private_key = ""; //TODO

    // Create the private key.
    let private_key =
        PrivateKey::<N>::from_str(private_key).expect("Failed to initialize private key");

    // Create the game data.
    let game_data = Value::<N>::from_str(&format!(
        r"
{{
    id: {},
    home_team_score: {},
    away_team_score: {},
}}",
        game_data.event_id, game_data.home_score, game_data.away_score
    ))
    .expect("Failed to create game data");

    // Initialize the program.
    let program = Program::<N>::from_str(include_str!(
        "../../resources/proto_snorkle_oracle_001.aleo"
    ))
    .expect("Failed to create the program");

    // Initialize a VM.
    let vm = VM::<N, ConsensusMemory<N>>::from(
        ConsensusStore::open(0).expect("Failed to initialize the consensus store"),
    )
    .expect("Failed to initialize the VM");

    // Add the oracle program to the process.
    vm.process()
        .write()
        .add_program(&program)
        .expect("Failed to add program");

    // Create the transaction.
    vm.execute(
        &private_key,
        (program.id(), "submit_event"),
        [game_data].into_iter(),
        None,
        0,
        None,
        &mut OsRng,
    )
    .expect("Failed to create a transaction")
}
