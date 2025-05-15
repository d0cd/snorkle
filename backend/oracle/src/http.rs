/// Helpers for HTTP requests

// Issue queries with hardcoded DNS for SGX
#[cfg(target_env = "sgx")]
mod sgx {
    use std::net::{IpAddr, Ipv4Addr, SocketAddr};
    use std::string::String;

    use ureq::http::Uri;

    use ureq::unversioned::resolver::{ArrayVec, ResolvedSocketAddrs};
    use ureq::unversioned::transport::NextTimeout;

    #[derive(Debug)]
    pub struct Resolver {
        known_hosts: HashMap<String, IpAddr>,
    }

    impl Default for Resovler {
        fn default() -> Self {
            Self::new()
        }
    }

    impl Resolver {
        pub fn new() -> Self {
            // Sets up mapping of known hosts.
            let mut result = HashMap::default();
            result.insert(
                "example.com".to_string(),
                IpAddr::V4(Ipv4Addr::new(23, 215, 0, 138)),
            );

            Self {
                known_hosts: result,
            }
        }
    }

    impl ureq::unversioned::resolver::Resolver for Resolver {
        fn resolve(
            &self,
            uri: &Uri,
            _config: &ureq::config::Config,
            _timeout: NextTimeout,
        ) -> Result<ResolvedSocketAddrs, ureq::Error> {
            let Some(hostname) = uri.host() else {
                return Err(ureq::Error::HostNotFound);
            };

            let ip = if let Some(ip) = self.known_hosts.get(hostname) {
                *ip
            } else {
                return Err(ureq::Error::HostNotFound);
            };

            let addr = SocketAddr::new(ip, uri.port_u16().unwrap_or(443));
            let mut result = ArrayVec::from_fn(|_| {
                SocketAddr::new(IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)), 8080)
            });
            result.push(addr);

            Ok(result)
        }
    }
}

#[cfg(target_env = "sgx")]
pub use sgx::*;

/// Issue queries with hardcoded DNS for SGX
#[cfg(not(target_env = "sgx"))]
mod tdx {
    pub type Resolver = ureq::unversioned::resolver::DefaultResolver;
}

#[cfg(not(target_env = "sgx"))]
pub use tdx::*;
