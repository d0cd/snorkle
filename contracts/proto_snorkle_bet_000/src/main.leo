// The 'proto_snorkle_bet_000' program.
// This is a first attempt at a betting contract.

import credits.aleo;

program proto_snorkle_bet_000.aleo {
    
    // A wager that is placed on a bet.
    struct Wager {
        // The ID of the event.
        event_id: field,
        // The amount wagered.
        bet: u64,
        // The amount to win.
        to_win: u64,
        // The vig 🤌. 
        vig: u64,
        // The wager nonce.
        nonce: field,
    }

    // A bet that is placed on an event.
    struct Bet {
        // The ID of the event.
        event_id: field,
        // The first bettor.
        bettor_one: address,
        // The second bettor.
        bettor_two: address,
        // The hash of the first bettor's wager key.
        wager_key_one: field,
        // The hash of the second bettor's wager key.
        wager_key_two: field,
        // The total payout.
        total_to_win: u64,
        // The total vig.
        total_vig: u64,
        // The facilitator's address.
        facilitator: address,
    }

    // The wager key.
    struct WagerKey {
        // The bettor.
        bettor: address,
        // The wager nonce.
        nonce: field,
    }

    // The wager entry.
    struct WagerEntry {
        // The wager.
        wager: Wager,
        // The bet ID.
        bet_id: field
    }

    // The set of all bets.
    // The key is the bet ID and the value is the bet data.
    mapping all_bets: field => Bet;

    // Whether or not the bet has been resolved.
    mapping resolved_bets: field => bool;

    // The set of all wagers that have been added to a bet.
    mapping confirmed_wagers: field => WagerEntry;

    // The balances of the bettors.
    mapping balances: address => u64;

    // Deposit credits.
    async transition deposit(amount: u64) -> Future {
        // Only allow this function to be invoked by externally owned accounts.
        // This is a temporary measure until we have a better way to handle this.
        assert_eq(self.caller, self.signer);
        // Transfer public credits from the signer to this program.
        let f: Future = credits.aleo/transfer_public_as_signer(self.address, amount);
        // Pass the future into an async context to be awaited.
        return deposit_(f);
    }

    async function deposit_(f: Future) {
        // Await the future.
        f.await();
        // Get the user's address from the future's arguments.
        let user: address = f.0;
        // Get the amount to deposit from the future's arguments.
        let amount: u64 = f.2;
        // Get the user's current balance.
        let current_balance: u64 = balances.get_or_use(user, 0u64);
        // Increment the user's balance.
        // If the new balance overflows, the program will error.
        let new_balance: u64 = current_balance + amount;
        // Update the user's balance.
        balances.set(user, new_balance);
    }

    // Make a bet.
    // TODO (@d0cd): Consider wrapping into one input for fewer constraints.
    async transition make_bet(
        bettor_one: address,
        bettor_two: address,
        wager_one: Wager,
        wager_two: Wager,
        sig_one: signature,
        sig_two: signature,
    ) -> Future {
        // Only allow this function to be invoked by externally owned accounts.
        // This is a temporary measure until we have a better way to handle this.
        assert_eq(self.caller, self.signer);

        // Check that the signatures on the wagers are valid.
        assert(sig_one.verify(bettor_one, wager_one));
        assert(sig_two.verify(bettor_two, wager_two));

        // Check that the wagers are well-formed.
        assert_eq(wager_one.event_id, wager_two.event_id);
        assert(wager_one.vig <= wager_one.bet);
        assert(wager_two.vig <= wager_two.bet);
        assert(wager_one.bet <= wager_one.to_win);
        assert(wager_two.bet <= wager_two.to_win);

        // Check that the wagers are even.
        let total_vig: u64 = wager_one.vig + wager_two.vig;
        let total_bet: u64 = wager_one.bet + wager_two.bet;
        let total_to_win: u64 = total_bet - total_vig;
        assert_eq(wager_one.to_win, wager_two.to_win);
        assert_eq(wager_one.to_win, total_to_win);

        // Check that the first bettor has plus odds and that the second bettor has minus odds.
        // This enforces structure onto the bet to make resolution more simple.
        let first_is_plus: bool = (total_to_win / wager_one.bet) >= 1u64;
        let second_is_minus: bool = (total_to_win / wager_two.bet) <= 1u64;
        assert(first_is_plus);
        assert(second_is_minus);

        // Create the wager keys.
        let wager_key_one: field = BHP1024::hash_to_field(WagerKey {
            bettor: bettor_one,
            nonce: wager_one.nonce
        });
        let wager_key_two: field = BHP1024::hash_to_field(WagerKey {
            bettor: bettor_two,
            nonce: wager_one.nonce
        });

        // Create the bet.
        let bet: Bet = Bet {
            event_id: wager_one.event_id,
            bettor_one,
            bettor_two,
            wager_key_one,
            wager_key_two,
            total_to_win,
            total_vig,
            facilitator: self.caller,
        };

        // Get the bet ID.
        let bet_id: field = BHP1024::hash_to_field(bet);

        // Invoke the async function.
        return make_bet_(bet_id, bet, wager_one, wager_two);
    }

    async function make_bet_(
        bet_id: field,
        bet: Bet,
        wager_one: Wager,
        wager_two: Wager,
    ) {
        // TODO: Check that the oracle is valid.

        // Check that the bet does not already exist.
        // TODO (@d0cd): Prove the non-existence is implied by the checks below.
        assert(!all_bets.contains(bet_id));

        // Check that the wager has not been used.
        assert(!confirmed_wagers.contains(bet.wager_key_one));
        assert(!confirmed_wagers.contains(bet.wager_key_two));

        // Decrement appropriate balances.
        let balance_one: u64 = balances.get_or_use(bet.bettor_one, 0u64);
        let balance_two: u64 = balances.get_or_use(bet.bettor_two, 0u64);
        let balance_self: u64 = balances.get_or_use(self.address, 0u64);
        balances.set(bet.bettor_one, balance_one - wager_one.bet);
        balances.set(bet.bettor_two, balance_two - wager_two.bet);
        balances.set(self.address, balance_self + wager_one.bet + wager_two.bet);

        // Store the bet.
        all_bets.set(bet_id, bet);
        confirmed_wagers.set(bet.wager_key_one, WagerEntry { wager: wager_one, bet_id});
        confirmed_wagers.set(bet.wager_key_two, WagerEntry { wager: wager_two, bet_id});
    }

    // Resolve a bet.
    async transition resolve_bet(bet_id: field) -> Future {
        return resolve_bet_(bet_id);
    } 

    async function resolve_bet_(bet_id: field) {
        // Check that the bet was not already resolved.
        assert(!resolved_bets.contains(bet_id));

        // Get the bet data.
        let bet: Bet = all_bets.get(bet_id);

        // TODO (@d0cd) get the oracle data.
        let one_is_winner: bool = true;

        // Select the winner.
        let winner: address = one_is_winner ? bet.bettor_one : bet.bettor_two;

        // Handle the payout and collect the vig.
        let balance_self: u64 = balances.get_or_use(self.address, 0u64);
        let balance_winner: u64 = balances.get_or_use(winner, 0u64);
        let balance_facilitator: u64 = balances.get_or_use(bet.facilitator, 0u64);
        balances.set(self.address, balance_self - bet.total_to_win - bet.total_vig);
        balances.set(winner, balance_winner + bet.total_to_win);
        balances.set(bet.facilitator, balance_facilitator + bet.total_vig);

        // Set that the bet was resolved.
        resolved_bets.set(bet_id, true);
    }


    // Withdraw credits.
    async transition withdraw(amount: u64) -> Future {
        // Only allow this function to be invoked by externally owned accounts.
        // This is a temporary measure until we have a better way to handle this.
        assert_eq(self.caller, self.signer);
        // Transfer public credits from this program to the signer.
        let f: Future = credits.aleo/transfer_public(self.signer, amount);
        // Pass the future into an async context to be awaited.
        return withdraw_(f);
    }

    async function withdraw_(f: Future) {
        // Get the user's address from the future's arguments.
        let user: address = f.1;
        // Get the amount to withdraw from the future's arguments.
        let amount: u64 = f.2;
        // Get the user's current balance.
        // If the user has no balance, `get` will implicitly error.
        let current_balance: u64 = balances.get(user);
        // Decrement the user's balance.
        let new_balance: u64 = current_balance - amount;
        // Update the user's balance.
        // If the new balance overflows, the program will error.
        balances.set(user, new_balance);
        // Await the future.
        // Note: It's good practice to update the internal state before changing the calling context.
        // This is a common way to avoid re-entrancy attacks in smart contracts, though this program
        // would not be vulnerable to such an attack.
        f.await();

    }
    
}
