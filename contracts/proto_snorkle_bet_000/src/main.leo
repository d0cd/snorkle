// The 'proto_snorkle_bet_000' program.
// This is a first attempt at a betting contract.

import credits.aleo;

program proto_snorkle_bet_000.aleo {
    
    // A wager that is placed on a bet.
    struct Wager {
        // The ID of the event.
        event_id: u128,
        // The amount wagered.
        bet: u64,
        // The amount to win.
        to_win: u64,
        // The vig 🤌. 
        vig: u64,
    }

    // A bet that is placed on an event.
    struct Bet {
        // The ID of the event.
        event_id: u128,
        // The first bettor.
        bettor_one: address,
        // The second bettor.
        bettor_two: address,
        // The first bettor's bet.
        bet_one: u64,
        // The second bettor's bet.
        bet_two: u64,
        // The total vig 🤌. 
        vig: u64,
        // The first bettor's signature.
        sig_one: field,
        // The second bettor's signature.
        sig_two: field,
        // The facilitator's address.
        facilitator: address,
    }

    // The set of active bets.
    // The key is the bet ID, and the value is a boolean indicating whether the bet is active.
    mapping active_bets: field => bool;

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

    // Resolve a bet.

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
