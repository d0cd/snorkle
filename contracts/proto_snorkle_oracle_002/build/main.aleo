program proto_snorkle_oracle_002.aleo;

struct EventData:
    id as field;
    home_team_score as u8;
    away_team_score as u8;

struct Event:
    oracle_id as address;
    timestamp as u32;
    event_data as EventData;

struct OracleData:
    attestation_hash as field;
    registration_timestamp as u32;

mapping registered_oracles:
    key as address.public;
    value as OracleData.public;

mapping registered_oracles_addresses:
    key as u128.public;
    value as address.public;

mapping total_oracles:
    key as u8.public;
    value as u128.public;

mapping events:
    key as field.public;
    value as Event.public;

mapping event_ids:
    key as u128.public;
    value as field.public;

mapping total_events:
    key as u8.public;
    value as u128.public;

function register:
    input r0 as field.private;
    async register self.caller r0 into r1;
    output r1 as proto_snorkle_oracle_002.aleo/register.future;

finalize register:
    input r0 as address.public;
    input r1 as field.public;
    contains registered_oracles[r0] into r2;
    not r2 into r3;
    branch.eq r3 false to end_then_0_0;
    get.or_use total_oracles[0u8] 0u128 into r4;
    set r0 into registered_oracles_addresses[r4];
    add r4 1u128 into r5;
    set r5 into total_oracles[0u8];
    branch.eq true true to end_otherwise_0_1;
    position end_then_0_0;
    position end_otherwise_0_1;
    cast r1 block.height into r6 as OracleData;
    set r6 into registered_oracles[r0];

function submit_event:
    input r0 as EventData.private;
    input r1 as signature.private;
    sign.verify r1 self.caller r0 into r2;
    assert.eq r2 true;
    async submit_event self.caller r0 into r3;
    output r3 as proto_snorkle_oracle_002.aleo/submit_event.future;

finalize submit_event:
    input r0 as address.public;
    input r1 as EventData.public;
    contains registered_oracles[r0] into r2;
    assert.eq r2 true;
    cast 0field 0u32 into r3 as OracleData;
    get.or_use registered_oracles[r0] r3 into r4;
    add r4.registration_timestamp 10000u32 into r5;
    gte r5 block.height into r6;
    assert.eq r6 true;
    contains events[r1.id] into r7;
    not r7 into r8;
    assert.eq r8 true;
    cast r0 block.height r1 into r9 as Event;
    set r9 into events[r1.id];
    get.or_use total_events[0u8] 0u128 into r10;
    set r1.id into event_ids[r10];
    add r10 1u128 into r11;
    set r11 into total_events[0u8];
