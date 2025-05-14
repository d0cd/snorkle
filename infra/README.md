# Google Cloud Terraform Configuration

This repository contains Terraform configurations for managing Google Cloud resources for the snorkle-2025 project.

## Prerequisites

1. Install [Terraform](https://www.terraform.io/downloads.html) (version >= 1.0.0)
2. Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
3. Authenticate with Google Cloud:
   ```bash
   gcloud auth application-default login
   ```

## Project Structure

- `main.tf` - Main Terraform configuration file
- `variables.tf` - Variable definitions
- `terraform.tfvars` - Variable values
- `README.md` - This file

## Infrastructure Components

The configuration currently sets up:

1. IAM Configuration
   - Project Owner access granted to:
     - mohammad@provable.com
     - pranav@provable.com
     - kai@provable.com

2. VPC Network (`snorkle-vpc`)
   - Custom subnet mode (no auto-created subnets)
   - Two subnets in different availability zones:
     - `snorkle-subnet-a` (10.0.1.0/24) in zone a
     - `snorkle-subnet-b` (10.0.2.0/24) in zone b
   - Private Google Access enabled for both subnets

3. Firewall Rules
   - `allow-internal`: Allows all internal traffic between instances in the VPC
   - `allow-ssh`: Allows SSH access from anywhere (tagged instances only)

4. Google Compute Engine (GCE) Instance
   - `snorkle-01`:
     - Machine Type: `c3-standard-8`
     - Image: Ubuntu 22.04 LTS
     - Network: `snorkle-vpc`, Subnet: `snorkle-subnet-a`
     - Zone: `us-west1-b`
     - Static External IP: Enabled (reserved as `snorkle-instance-ip`)
     - Confidential Compute: Enabled (TDX)
     - Maintenance Policy: Terminate
     - Tags: `ssh`

## Usage

1. Initialize Terraform:
   ```