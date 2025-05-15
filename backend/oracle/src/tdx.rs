use std::process::Command;

use anyhow::Context;

// Function to run the `trustauthority-cli quote` command
pub fn generate_report(user_data: &str) -> anyhow::Result<String> {
    // Create the command
    let output = Command::new("sudo")
        .arg("trustauthority-cli")
        .arg("quote")
        .arg("--user-data")
        .arg(user_data) // Pass user_data argument
        .output() // Execute the command
        .with_context(|| "Failed to execute trustauthority-cli")?;

    // Check if the command executed successfully
    if !output.status.success() {
        // If the command failed, return the stderr output as an error
        let error_msg = String::from_utf8_lossy(&output.stderr);
        anyhow::bail!("trustauthority-cli failed: {error_msg}");
    }

    // Return the output from the command if successful
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
