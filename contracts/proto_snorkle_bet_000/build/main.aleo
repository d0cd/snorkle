import credits.aleo;
program proto_snorkle_bet_000.aleo;

mapping active_bets:
    key as field.public;
    value as boolean.public;

mapping balances:
    key as address.public;
    value as u64.public;

function deposit:
    input r0 as u64.private;
    assert.eq self.caller self.signer;
    call credits.aleo/transfer_public_as_signer proto_snorkle_bet_000.aleo r0 into r1;
    async deposit r1 into r2;
    output r2 as proto_snorkle_bet_000.aleo/deposit.future;

finalize deposit:
    input r0 as credits.aleo/transfer_public_as_signer.future;
    await r0;
    get.or_use balances[r0[0u32]] 0u64 into r1;
    add r1 r0[2u32] into r2;
    set r2 into balances[r0[0u32]];

function withdraw:
    input r0 as u64.private;
    assert.eq self.caller self.signer;
    call credits.aleo/transfer_public self.signer r0 into r1;
    async withdraw r1 into r2;
    output r2 as proto_snorkle_bet_000.aleo/withdraw.future;

finalize withdraw:
    input r0 as credits.aleo/transfer_public.future;
    get balances[r0[1u32]] into r1;
    sub r1 r0[2u32] into r2;
    set r2 into balances[r0[1u32]];
    await r0;
