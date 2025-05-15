variable "project_id" {
  description = "The Google Cloud project ID"
  type        = string
  default     = "snorkle-2025"
}

variable "region" {
  description = "The Google Cloud region"
  type        = string
  default     = "northamerica-northeast1"
}

variable "zone" {
  description = "The Google Cloud zone"
  type        = string
  default     = "northamerica-northeast1-a"
}

variable "machine_type" {
  description = "The instance machine type to use"
  type        = string
  default     = "c3-standard-8"
}

variable "boot_disk_size" {
  description = "Size in GB of the boot disk"
  type        = number
  default     = 20
}

### Docker repo
variable "location" {
  description = "Specific region or location for multi-region to deploy registry."
  type        = string
  default     = "us"
}

variable "repository_id" {
  description = "Name for the repository"
  type        = string
  default     = "gcr.io"
}

variable "repository_name" {
  description = "Name for the repository"
  type        = string
  default     = "docker"
}

variable "description" {
  description = "Description of the repository"
  type        = string
  default     = "Docker registry for images"
}

variable "db_password" {
  description = "Password for the Cloud SQL PostgreSQL user"
  type        = string
  sensitive   = true
}
