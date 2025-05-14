// The 'proto_snorkle_oracle_000' program.
// This is a centralized oracle for one-time, events.

program proto_snorkle_oracle_000.aleo {
    // The event data which include the event ID and and the respective scores of the home team and away team.
    struct EventData {
        // The ID of the event
        id: field,

        // The scores
        home_team_score: u8, 
        away_team_score: u8, 
    }

    // All the info in an Event 
    struct Event {
        // The `address` of the oracle submitting the event.
        oracle: address,

        // The block height at which the event was submitted.
        timestamp: u32,

        // The event data.
        event_data: EventData,
    }

    // A mapping of registered oracle addresses to the hash of their attestations
    mapping registered_oracles: address => field;

    // A mapping of event IDs to the events themselves.
    mapping events: field => Event;

    // A mapping that behaves like a vector where the key is a `u128` index and the value is a `field`
    // representing an event ID.
    mapping event_ids: u128 => field;

    // This really refers to a single value that contains the size of the vector `event_ids` at key `0`. Other keys are
    // not meant to be used.
    mapping total_events: u8 => u128;

    // Register a new oracle
    async transition register(attestation_hash: field) -> Future {
        return finalize_register(self.caller, attestation_hash);
    }

    async function finalize_register(oracle: address, attestation_hash: field) {
        // Ensure that the oracle is not attempting to register again
        assert(!registered_oracles.contains(oracle));
        
        registered_oracles.set(oracle, attestation_hash);
    }

    // Submit an event 
    async transition submit_event(event_data: EventData, sig: signature) -> Future {
        // Ensure that the caller provided the correct signature
        assert(sig.verify(self.caller, event_data));

        // Actually store the event in the `events` mapping.
        return finalize_submit_event(self.caller, event_data);
    }

    async function finalize_submit_event(oracle: address, event_data: EventData) {
        let event_id: field = event_data.id;

        // Ensure that the oracle is registered
        assert(registered_oracles.contains(oracle));

        // Check that the event has not been submitted yet.
        assert(!events.contains(event_id));


        // Construct the event
        let event: Event = Event {
            oracle,
            timestamp: block.height,
            event_data
        };

        // Store the event into the `events` mapping
        events.set(event_id, event);
        
        // The size of vector `event_ids` which is stored in a separate mapping
        let current_total_events: u128 = total_events.get_or_use(0u8, 0u128);

        // Append the event ID into the vector `total_events`
        event_ids.set(current_total_events, event_id);

        // Update the total number of events
        total_events.set(0u8, current_total_events + 1u128);
    }
}
