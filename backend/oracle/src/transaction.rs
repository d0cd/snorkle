use std::str::FromStr;

use rand::rngs::OsRng;

use anyhow::Context;

use snarkvm::ledger::store::helpers::memory::ConsensusMemory;
use snarkvm::prelude::store::ConsensusStore;
use snarkvm::prelude::*;

use super::Oracle;

/// Generates a transaction for the oracle's private key, event ID, and game data.
impl<N: Network> Oracle<N> {
    pub fn init_vm() -> anyhow::Result<VM<N, ConsensusMemory<N>>> {
        VM::<N, ConsensusMemory<N>>::from(
            ConsensusStore::open(0).expect("Failed to initialize the consensus store"),
        )
        .with_context(|| "Failed to initialize the VM")
    }

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
        let query = Some(snarkvm::prelude::query::Query::from(
            "https://api.explorer.provable.com/v1",
        ));

        #[cfg(feature = "reuse-vm")]
        let vm = &self.vm;

        #[cfg(not(feature = "reuse-vm"))]
        let vm = Self::init_vm()?;

        // Add the oracle program to the process.
        vm.process()
            .write()
            .add_program(&self.program)
            .with_context(|| "Failed to add program to VM")?;

        // Create the transaction.
        let txn = vm
            .execute(
                &self.key,
                (self.program.id(), transition),
                args.iter(),
                None,
                0,
                query,
                &mut OsRng,
            )
            .with_context(|| "Failed to create a transaction")?;

        #[cfg(feature = "extra-verify")]
        vm.process().read().verify_execution(
            snarkvm::algorithms::snark::varuna::VarunaVersion::V2,
            txn.execution().unwrap(),
        )?;

        Ok(txn)
    }
}
