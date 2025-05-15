use std::str::FromStr;

use rand::rngs::OsRng;

use anyhow::Context;

use snarkvm::ledger::store::helpers::memory::ConsensusMemory;
use snarkvm::prelude::store::ConsensusStore;
use snarkvm::prelude::*;

use super::Oracle;

/// Generates a transaction for the oracle's private key, event ID, and game data.
impl<N: Network> Oracle<N> {
    pub fn init_program() -> Program<N> {
        Program::<N>::from_str(include_str!(
            "../../resources/proto_snorkle_oracle_002.aleo"
        ))
        .expect("Failed to create the program")
    }

    pub fn generate_transaction(
        &self,
        transition: &str,
        args: &[Value<N>],
    ) -> anyhow::Result<Transaction<N>> {
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
            (self.program.id(), transition),
            args.iter(),
            None,
            0,
            None,
            &mut OsRng,
        )
        .with_context(|| "Failed to create a transaction")
    }
}
