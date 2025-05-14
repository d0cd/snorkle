// Tests deposit and withdraw functionality of the program.
import credits.aleo;
import proto_snorkle_bet_000.aleo;

program deposit_and_withdraw.aleo {

    @native_test(private_key = "APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH")
    @should_fail
    async transition program_cannot_call_deposit() -> Future {
        let f: Future = proto_snorkle_bet_000.aleo/deposit(100u64);
        return await_one(f);
    }

    

    @native_test(private_key = "APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH")
    @should_fail
    async transition program_cannot_call_withdraw() -> Future {
        let f: Future = proto_snorkle_bet_000.aleo/withdraw(100u64);
        return await_one(f);
    }

    async function await_one(f: Future) {
        // Await the future.
        f.await();
    }
}