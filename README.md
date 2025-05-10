# snorkle
snark-friendly oracles on aleo


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
