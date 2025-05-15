use std::str::FromStr;
use rand_core::OsRng;
use snarkvm::ledger::store::helpers::memory::ConsensusMemory;
use snarkvm::prelude::{Address, Network, PrivateKey, Program, TestnetV0, Transaction, Value, VM};
use snarkvm::prelude::store::{ConsensusStore};

pub struct GameData {
    pub event_id: String,
    pub away_score: u8,
    pub home_score: u8,
}

const DEVNET_PRIVATE_KEY: &str = "APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH";

fn main() {
    // Define the game data.
    let game_data = GameData {
        event_id: "0field".to_string(),
        away_score: 3,
        home_score: 2,
    };
    // Generate the transaction.
    let transaction = generate_transaction::<TestnetV0>(DEVNET_PRIVATE_KEY, game_data);
    // Print the transaction.
    println!("Transaction: {:?}", transaction);
}

// Generates a transaction for the oracle's private key, event ID, and game data.
fn generate_transaction<N: Network>(private_key: &str, game_data: GameData) -> Transaction<N> {
    // Create the private key.
    let private_key = PrivateKey::<N>::from_str(private_key).expect("Failed to initialize private key");
    // Get the oracle address.
    let _oracle_address = Address::try_from(&private_key).expect("Failed to create oracle address");
    
    // Create the game data.
    let game_data = Value::<N>::from_str(&format!(r"
{{
    id: {},
    home_team_score: {},
    away_team_score: {},
}}", game_data.event_id, game_data.home_score, game_data.away_score)).expect("Failed to create game data");
    
    // Initialize the program.
    let program = Program::<N>::from_str(include_str!("../resources/proto_snorkle_oracle_001.aleo")).expect("Failed to create the program");    
    
    // Initialize a VM.
    let vm= VM::<N, ConsensusMemory<N>>::from(ConsensusStore::open(0).expect("Failed to initialize the consensus store")).expect("Failed to initialize the VM");
    
    // Add the oracle program to the process.
    vm.process().write().add_program(&program).expect("Failed to add program");
    
    // Create the transaction.
    let transaction = vm.execute(&private_key, (program.id(), "submit_event"), [game_data].into_iter(), None, 0, None, &mut OsRng).expect("Failed to create a transaction");
    
    // Return the transaction.
    transaction
}


