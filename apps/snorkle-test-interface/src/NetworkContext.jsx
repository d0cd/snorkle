import React, { createContext, useContext, useState, useEffect } from "react";

const defaultNetworks = [
  { label: "mainnet", value: "mainnet" },
  { label: "testnet", value: "testnet" },
  { label: "canary", value: "canary" },
];

const defaultEndpoints = [
  { label: "Provable", value: "provable", url: "https://api.explorer.provable.com/v1" },
  { label: "devnet", value: "devnet", url: "http://localhost:3030" },
  { label: "custom", value: "custom" },
];

const NetworkContext = createContext();

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider = ({ children }) => {
  // Try to load from localStorage, else use defaults
  const [network, setNetwork] = useState(() => localStorage.getItem("snorkle_network") || "testnet");
  const [endpoint, setEndpoint] = useState(() => localStorage.getItem("snorkle_endpoint") || "provable");
  const [customEndpoint, setCustomEndpoint] = useState(() => localStorage.getItem("snorkle_customEndpoint") || "");

  useEffect(() => {
    localStorage.setItem("snorkle_network", network);
  }, [network]);
  useEffect(() => {
    localStorage.setItem("snorkle_endpoint", endpoint);
  }, [endpoint]);
  useEffect(() => {
    localStorage.setItem("snorkle_customEndpoint", customEndpoint);
  }, [customEndpoint]);

  // Get the actual network string
  const networkString = network;
  // Get the actual endpoint URL
  const endpointObj = defaultEndpoints.find(e => e.value === endpoint);
  const endpointUrl = endpoint === "custom" ? customEndpoint : (endpointObj ? endpointObj.url : "");

  // Validate custom endpoint (basic check)
  const isCustomEndpointValid = endpoint !== "custom" || /^https?:\/\//.test(customEndpoint);

  return (
    <NetworkContext.Provider
      value={{
        network,
        setNetwork,
        endpoint,
        setEndpoint,
        customEndpoint,
        setCustomEndpoint,
        networkString,
        endpointUrl,
        isCustomEndpointValid,
        defaultNetworks,
        defaultEndpoints,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}; 