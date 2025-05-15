# snorkle
snark-friendly oracles on aleo

# Dashboard

The live dashboard for the oracle can be found here: https://snorkle-dashboard-349861721231.northamerica-northeast1.run.app/


## Leo

The Leo programs in this project are built using a preview version of the language.
This version contains the upcoming Leo Test Framework and major improvements to the deploy/execute experience.

To set it up, run:
1. Download the Leo source code: `git clone https://github.com/ProvableHQ/leo.git`
2. Check out the correct branch: `git fetch -a; git checkout preview/leo-test+cli`
3. Install from source: `cargo install --path=.`


## Feedback

- The code completions almost always suggest something after a `.` in a comment. 
  It's an odd place to suggest since you'd almost always press enter after typing the period, which messes up your comment.
- Leo test fails if credits.aleo is a dependency
- Leo CLI overhaul uses explorer as API default, default should be implemented in a different way.
- Provable SDK create-leo-app tutorial links to the an old tutorial.


## Oracle Setup

### Dummy Version
The oracle should compile fine on macOS as well and will simply not generate a report.

### Intel TDX
To run the oracle in an enclave based on Intel's Trusted Domain Extensions (TDX), you need a TDX-enabled virtual machine.
Follow the description [here](https://cloud.google.com/confidential-computing/docs/confidential-computing-overview) and pick Ubuntu 24.04 as your image to create such a VM on Google Cloud.
Finally, set up the `trustservices-cli` using [this guide](https://github.com/canonical/tdx?tab=readme-ov-file#9-perform-remote-attestation-using-intel-tiber-trust-services-cli), which the oracle will call.
