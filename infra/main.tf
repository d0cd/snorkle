terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Enable required Google Cloud APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "compute.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "iam.googleapis.com",
    "container.googleapis.com"
  ])
  
  project = var.project_id
  service = each.key

  disable_dependent_services = false
  disable_on_destroy        = false
}

# Grant owner access to specified users
resource "google_project_iam_member" "owners" {
  for_each = toset([
    "mohammad@provable.com",
    "pranav@provable.com",
    "kai@provable.com"
  ])
  
  project = var.project_id
  role    = "roles/owner"
  member  = "user:${each.key}"
}

# Create VPC network
resource "google_compute_network" "vpc" {
  name                    = "snorkle-vpc"
  auto_create_subnetworks = false
  project                 = var.project_id
}

# Create subnet in zone a
resource "google_compute_subnetwork" "subnet_a" {
  name          = "snorkle-subnet-a"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id
  project       = var.project_id

  private_ip_google_access = true
}

# Create subnet in zone b
resource "google_compute_subnetwork" "subnet_b" {
  name          = "snorkle-subnet-b"
  ip_cidr_range = "10.0.2.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id
  project       = var.project_id

  private_ip_google_access = true
}

# Create firewall rule to allow internal traffic
resource "google_compute_firewall" "allow_internal" {
  name    = "allow-internal"
  network = google_compute_network.vpc.name
  project = var.project_id

  allow {
    protocol = "tcp"
  }
  allow {
    protocol = "udp"
  }
  allow {
    protocol = "icmp"
  }

  source_ranges = ["10.0.0.0/8"]
}

# Create firewall rule to allow SSH
resource "google_compute_firewall" "allow_ssh" {
  name    = "allow-ssh"
  network = google_compute_network.vpc.name
  project = var.project_id

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["ssh"]
}

# Reserve a static external IP address
resource "google_compute_address" "snorkle_static_ip" {
  name    = "snorkle-instance-ip"
  project = var.project_id
  region  = var.region
}

data "google_compute_image" "ubuntu_2204" {
  family  = "ubuntu-2204-lts"
  project = "ubuntu-os-cloud"
}

resource "google_compute_instance" "snorkle" {
  project      = var.project_id
  zone         = "us-west1-b" # Note: This is different from the provider's default zone
  name         = "snorkle-01"
  machine_type = "c3-standard-8"

  boot_disk {
    initialize_params {
      image = data.google_compute_image.ubuntu_2204.self_link
    }
  }

  network_interface {
    network    = google_compute_network.vpc.id
    subnetwork = google_compute_subnetwork.subnet_a.id
    access_config {
      // Assign the reserved static IP. If this block is empty, an ephemeral IP is used.
      nat_ip = google_compute_address.snorkle_static_ip.address
    }
  }

  confidential_instance_config {
    enable_confidential_compute = true
    confidential_instance_type  = "TDX" # This is the default if enable_confidential_compute is true, but explicit for clarity
  }

  scheduling {
    on_host_maintenance = "TERMINATE"
  }

  tags = ["ssh"]
} 

