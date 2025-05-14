program proto_snorkle_oracle_000.aleo;

struct EventData:
    id as field;
    home_team_score as u8;
    away_team_score as u8;

struct Event:
    oracle as address;
    timestamp as u32;
    event_data as EventData;

mapping registered_oracles:
    key as address.public;
    value as field.public;

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
    output r1 as proto_snorkle_oracle_000.aleo/register.future;

finalize register:
    input r0 as address.public;
    input r1 as field.public;
    contains registered_oracles[r0] into r2;
    not r2 into r3;
    assert.eq r3 true;
    set r1 into registered_oracles[r0];

function submit_event:
    input r0 as EventData.private;
    input r1 as signature.private;
    sign.verify r1 self.caller r0 into r2;
    assert.eq r2 true;
    async submit_event self.caller r0 into r3;
    output r3 as proto_snorkle_oracle_000.aleo/submit_event.future;

finalize submit_event:
    input r0 as address.public;
    input r1 as EventData.public;
    contains registered_oracles[r0] into r2;
    assert.eq r2 true;
    contains events[r1.id] into r3;
    not r3 into r4;
    assert.eq r4 true;
    cast r0 block.height r1 into r5 as Event;
    set r5 into events[r1.id];
    get.or_use total_events[0u8] 0u128 into r6;
    set r1.id into event_ids[r6];
    add r6 1u128 into r7;
    set r7 into total_events[0u8];
