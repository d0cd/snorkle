import credits.aleo;
import proto_snorkle_oracle_000.aleo;
program proto_snorkle_bet_000.aleo;

struct EventData:
    left_is_winner as boolean;

struct Event:
    id as field;
    emitter as address;
    block_height as u32;
    data as EventData;

struct Wager:
    event_id as field;
    bet as u64;
    to_win as u64;
    vig as u64;
    nonce as field;

struct Bet:
    event_id as field;
    bettor_one as address;
    bettor_two as address;
    wager_key_one as field;
    wager_key_two as field;
    total_to_win as u64;
    total_vig as u64;
    facilitator as address;

struct WagerKey:
    bettor as address;
    nonce as field;

struct WagerEntry:
    wager as Wager;
    bet_id as field;

mapping all_bets:
    key as field.public;
    value as Bet.public;

mapping resolved_bets:
    key as field.public;
    value as boolean.public;

mapping confirmed_wagers:
    key as field.public;
    value as WagerEntry.public;

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

function make_bet:
    input r0 as address.private;
    input r1 as address.private;
    input r2 as Wager.private;
    input r3 as Wager.private;
    input r4 as signature.private;
    input r5 as signature.private;
    assert.eq self.caller self.signer;
    sign.verify r4 r0 r2 into r6;
    assert.eq r6 true;
    sign.verify r5 r1 r3 into r7;
    assert.eq r7 true;
    assert.eq r2.event_id r3.event_id;
    lte r2.vig r2.bet into r8;
    assert.eq r8 true;
    lte r3.vig r3.bet into r9;
    assert.eq r9 true;
    lte r2.bet r2.to_win into r10;
    assert.eq r10 true;
    lte r3.bet r3.to_win into r11;
    assert.eq r11 true;
    add r2.vig r3.vig into r12;
    add r2.bet r3.bet into r13;
    sub r13 r12 into r14;
    assert.eq r2.to_win r3.to_win;
    assert.eq r2.to_win r14;
    div r14 r2.bet into r15;
    gte r15 1u64 into r16;
    div r14 r3.bet into r17;
    lte r17 1u64 into r18;
    assert.eq r16 true;
    assert.eq r18 true;
    cast r0 r2.nonce into r19 as WagerKey;
    hash.bhp1024 r19 into r20 as field;
    cast r1 r2.nonce into r21 as WagerKey;
    hash.bhp1024 r21 into r22 as field;
    cast r2.event_id r0 r1 r20 r22 r14 r12 self.caller into r23 as Bet;
    hash.bhp1024 r23 into r24 as field;
    async make_bet r24 r23 r2 r3 into r25;
    output r25 as proto_snorkle_bet_000.aleo/make_bet.future;

finalize make_bet:
    input r0 as field.public;
    input r1 as Bet.public;
    input r2 as Wager.public;
    input r3 as Wager.public;
    contains proto_snorkle_oracle_000.aleo/events[r1.event_id] into r4;
    not r4 into r5;
    assert.eq r5 true;
    contains all_bets[r0] into r6;
    not r6 into r7;
    assert.eq r7 true;
    contains confirmed_wagers[r1.wager_key_one] into r8;
    not r8 into r9;
    assert.eq r9 true;
    contains confirmed_wagers[r1.wager_key_two] into r10;
    not r10 into r11;
    assert.eq r11 true;
    get.or_use balances[r1.bettor_one] 0u64 into r12;
    get.or_use balances[r1.bettor_two] 0u64 into r13;
    get.or_use balances[proto_snorkle_bet_000.aleo] 0u64 into r14;
    sub r12 r2.bet into r15;
    set r15 into balances[r1.bettor_one];
    sub r13 r3.bet into r16;
    set r16 into balances[r1.bettor_two];
    add r14 r2.bet into r17;
    add r17 r3.bet into r18;
    set r18 into balances[proto_snorkle_bet_000.aleo];
    set r1 into all_bets[r0];
    cast r2 r0 into r19 as WagerEntry;
    set r19 into confirmed_wagers[r1.wager_key_one];
    cast r3 r0 into r20 as WagerEntry;
    set r20 into confirmed_wagers[r1.wager_key_two];

function resolve_bet:
    input r0 as field.private;
    async resolve_bet r0 into r1;
    output r1 as proto_snorkle_bet_000.aleo/resolve_bet.future;

finalize resolve_bet:
    input r0 as field.public;
    contains resolved_bets[r0] into r1;
    not r1 into r2;
    assert.eq r2 true;
    get all_bets[r0] into r3;
    get proto_snorkle_oracle_000.aleo/events[r3.event_id] into r4;
    ternary r4.data.left_is_winner r3.bettor_one r3.bettor_two into r5;
    get.or_use balances[proto_snorkle_bet_000.aleo] 0u64 into r6;
    get.or_use balances[r5] 0u64 into r7;
    get.or_use balances[r3.facilitator] 0u64 into r8;
    sub r6 r3.total_to_win into r9;
    sub r9 r3.total_vig into r10;
    set r10 into balances[proto_snorkle_bet_000.aleo];
    add r7 r3.total_to_win into r11;
    set r11 into balances[r5];
    add r8 r3.total_vig into r12;
    set r12 into balances[r3.facilitator];
    set true into resolved_bets[r0];

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
