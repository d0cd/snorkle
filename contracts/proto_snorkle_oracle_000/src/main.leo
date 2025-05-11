// The 'proto_snorkle_oracle_000' program.
// This is a centralized oracle for one-time, events.

program proto_snorkle_oracle_000.aleo {

    // The event data.
    // This event represents the winner of a two-sided bit.
    // We wil arbitrarily assign the "left" side of a bet
    // to the "plus" odds.
    struct EventData {
        // Whether the "left" side is the winner.
        left_is_winner: bool
    }

    // The event.
    struct Event {
        // The event ID.
        id: field,
        // The event emitter.
        emitter: address,
        // The block height at which the event was emitted.
        block_height: u32,
        // The event data.
        data: EventData,
    }
    
    // A mapping of event IDs to the event data.
    mapping events: field => Event;

    // Emit an event 
    async transition emit_event(id: field, data: EventData) -> Future {
        return emit_event_(id, self.caller, data);
    }

    async function emit_event_(id: field, emitter: address, data: EventData) {
        // Check that the event has not been emitted yet.
        assert(!events.contains(id));
        // Construct the event.
        let event: Event = Event {
            id,
            emitter,
            block_height: block.height,
            data
        };
        // Store the event.
        events.set(event.id, event);
    }
}
