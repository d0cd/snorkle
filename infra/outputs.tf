output "docker_artifact_registry_repository_url" {
  description = "The Docker Artifact Registry repository URL."
  value       = "${google_artifact_registry_repository.docker.location}-docker.pkg.dev/${google_artifact_registry_repository.docker.project}/${google_artifact_registry_repository.docker.repository_id}"
}