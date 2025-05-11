import credits.aleo;
import proto_snorkle_bet_000.aleo;
program deposit_and_withdraw.aleo;

function program_cannot_call_deposit:
    call proto_snorkle_bet_000.aleo/deposit 100u64 into r0;
    async program_cannot_call_deposit r0 into r1;
    output r1 as deposit_and_withdraw.aleo/program_cannot_call_deposit.future;

finalize program_cannot_call_deposit:
    input r0 as proto_snorkle_bet_000.aleo/deposit.future;
    await r0;

function program_cannot_call_withdraw:
    call proto_snorkle_bet_000.aleo/withdraw 100u64 into r0;
    async program_cannot_call_withdraw r0 into r1;
    output r1 as deposit_and_withdraw.aleo/program_cannot_call_withdraw.future;

finalize program_cannot_call_withdraw:
    input r0 as proto_snorkle_bet_000.aleo/withdraw.future;
    await r0;
