program proto_snorkle_oracle_000.aleo;

struct EventData:
    left_is_winner as boolean;

struct Event:
    id as u128;
    emitter as address;
    block_height as u32;
    data as EventData;

mapping events:
    key as u128.public;
    value as Event.public;

function emit_event:
    input r0 as u128.private;
    input r1 as EventData.private;
    async emit_event r0 self.caller r1 into r2;
    output r2 as proto_snorkle_oracle_000.aleo/emit_event.future;

finalize emit_event:
    input r0 as u128.public;
    input r1 as address.public;
    input r2 as EventData.public;
    contains events[r0] into r3;
    not r3 into r4;
    assert.eq r4 true;
    cast r0 r1 block.height r2 into r5 as Event;
    set r5 into events[r5.id];
