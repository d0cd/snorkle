// The 'proto_snorkle_oracle_000' program.
program proto_snorkle_oracle_000.aleo {
    transition main(public a: u32, b: u32) -> u32 {
        let c: u32 = a + b;
        return c;
    }
}
