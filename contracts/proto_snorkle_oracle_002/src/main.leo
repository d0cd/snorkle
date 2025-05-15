// The 'proto_snorkle_oracle_002' program.
// This is a centralized oracle for one-time, events.

program proto_snorkle_oracle_002.aleo {
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
        oracle_id: address,

        // The block height at which the event was submitted.
        timestamp: u32,

        // The event data.
        event_data: EventData,
    }

    // The relevant data for an oracle
    struct OracleData {
        attestation_hash: field,
        registration_timestamp: u32,
    }

    // How many blocks each oracle is valid before it has to register again. This basically implies an expiry date for
    // each oracle.
    const TIME_LIMIT: u32 = 10000u32;

    // A mapping of registered oracle addresses to the hash of their attestations and the time of their registration
    mapping registered_oracles: address => OracleData;

    // A mapping that behaves like a vector where the key is a `u128` index and the value is an `address` representing
    // an oracle ID.
    mapping registered_oracles_addresses: u128 => address;

    // This really refers to a single value that contains the size of the vector `registered_oracles_addresses` at key
    // `1`. Other keys are not meant to be used.
    mapping total_oracles: u8 => u128;

    // A mapping of event IDs to the events themselves.
    mapping events: field => Event;

    // A mapping that behaves like a vector where the key is a `u128` index and the value is a `field` representing an
    // event ID.
    mapping event_ids: u128 => field;

    // This really refers to a single value that contains the size of the vector `event_ids` at key `1`. Other keys are
    // not meant to be used.
    mapping total_events: u8 => u128;

    // Register a new oracle
    async transition register(attestation_hash: field) -> Future {
        return finalize_register(self.caller, attestation_hash);
    }

    async function finalize_register(oracle_id: address, attestation_hash: field) {
        // Registering an oracle multiple times is allowed. This can be useful to refresh the registration_timestamp. 
        if !registered_oracles.contains(oracle_id) {
            // Only update the vector of oracle addresses if we haven't seen this oracle before

            // The size of vector `registered_oracles_addresses` which is stored in a separate mapping
            let current_total_oracles: u128 = total_oracles.get_or_use(0u8, 0u128);

            // Append the event ID into the vector `total_events`
            registered_oracles_addresses.set(current_total_oracles, oracle_id);

            // Update the total number of events
            total_oracles.set(0u8, current_total_oracles + 1u128);
        }

        // Now add the oracle data to the `registered_oracles` mapping. Overwrite the old data to update the timestamp.
        registered_oracles.set(oracle_id, OracleData {
            attestation_hash,
            registration_timestamp: block.height,
        });
    }

    // Submit an event 
    async transition submit_event(event_data: EventData, sig: signature) -> Future {
        // Ensure that the caller provided the correct signature
        assert(sig.verify(self.caller, event_data));

        // Actually store the event in the `events` mapping.
        return finalize_submit_event(self.caller, event_data);
    }

    async function finalize_submit_event(oracle_id: address, event_data: EventData) {
        let event_id: field = event_data.id;

        // Ensure that the oracle is registered
        assert(registered_oracles.contains(oracle_id));
       
        // Grab the time stamp at which the oracle was registered
        let oracle_registration_timestamp: u32 = registered_oracles.get_or_use(oracle_id, OracleData {
            attestation_hash: 0field,
            registration_timestamp: 0u32,
        }).registration_timestamp;
      
        // Make sure the oracle hasn't expired yet
        assert(oracle_registration_timestamp + TIME_LIMIT >= block.height);

        // Check that the event has not been submitted yet.
        assert(!events.contains(event_id));

        // Store the event into the `events` mapping
        events.set(event_id, Event {
            oracle_id,
            timestamp: block.height,
            event_data
        });
        
        // The size of vector `event_ids` which is stored in a separate mapping
        let current_total_events: u128 = total_events.get_or_use(0u8, 0u128);

        // Append the event ID into the vector `total_events`
        event_ids.set(current_total_events, event_id);

        // Update the total number of events
        total_events.set(0u8, current_total_events + 1u128);
    }
}
