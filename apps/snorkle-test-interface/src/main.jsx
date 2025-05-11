import "./App.css";
import { useEffect, useState } from "react";
import { App, ConfigProvider, Layout, Menu, Switch, theme, Select, AutoComplete } from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { NetworkProvider, useNetwork } from "./NetworkContext";
import { Tooltip } from "antd";

import {
    ApiOutlined,
    CodeOutlined,
    PlusOutlined,
    ProfileOutlined,
    SwapOutlined,
    ToolOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { WasmLoadingMessage } from "./components/WasmLoadingMessage.jsx";

const { Content, Footer, Sider } = Layout;

const menuItems = [
    {
        label: <Link to="/account">Account</Link>,
        key: "/account",
        icon: <UserOutlined />,
    },
    {
        label: <Link to="/record">Record</Link>,
        key: "/record",
        icon: <ProfileOutlined />,
    },
    {
        label: <Link to="/rest">REST API</Link>,
        key: "/rest",
        icon: <ApiOutlined />,
    },
    {
        label: <Link to="/develop">Develop</Link>,
        key: "/develop",
        icon: <CodeOutlined />,
    },
    {
        label: <Link to="/transfer">Transfer</Link>,
        key: "transfer",
        icon: <SwapOutlined />,
    },
];

function SidebarNetworkControls() {
    const {
        network, setNetwork, defaultNetworks,
        endpoint, setEndpoint, defaultEndpoints
    } = useNetwork();
    // Only include non-custom endpoints in the options
    const endpointOptions = defaultEndpoints
        .filter(opt => opt.value !== 'custom')
        .map(opt => ({ value: opt.url || opt.value, label: opt.label }));
    // Find the selected endpoint object
    const endpointObj = defaultEndpoints.find(e => e.value === endpoint);
    // If endpoint is not a preset, treat as custom
    const isPreset = endpointObj && endpointObj.url;
    const endpointValue = isPreset ? endpointObj.url : endpoint;
    return (
        <div style={{ marginTop: 24, marginBottom: 24 }}>
            <div style={{ marginBottom: 20 }}>
                <span style={{ fontWeight: 500, color: '#888' }}>Select Network</span>
                <Select
                    value={network}
                    onChange={setNetwork}
                    style={{ width: '100%', marginTop: 8 }}
                    options={defaultNetworks}
                    autoComplete="off"
                    autoFocus={false}
                    allowClear={false}
                    tabIndex={-1}
                    data-lpignore="true"
                />
            </div>
            <div style={{ marginBottom: 0 }}>
                <span style={{ fontWeight: 500, color: '#888' }}>API Endpoint</span>
                <AutoComplete
                    value={endpointValue}
                    options={endpointOptions}
                    style={{ width: '100%', marginTop: 8, marginBottom: 8 }}
                    onChange={val => {
                        // If the value matches a preset URL, set the endpoint to that preset
                        const preset = defaultEndpoints.find(e => e.url === val);
                        if (preset) {
                            setEndpoint(preset.value);
                        } else {
                            setEndpoint(val);
                        }
                    }}
                    data-lpignore="true"
                    filterOption={(inputValue, option) =>
                        option?.value?.toLowerCase().includes(inputValue.toLowerCase()) ||
                        option?.label?.toLowerCase().includes(inputValue.toLowerCase())
                    }
                />
            </div>
        </div>
    );
}

function Main() {
    const [menuIndex, setMenuIndex] = useState("account");

    const navigate = useNavigate();
    const location = useLocation();
    const onClick = (e) => {
        navigate(e.key);
    };

    useEffect(() => {
        setMenuIndex(location.pathname);
        // if (location.pathname === "/") {
        //     navigate("/account");
        // }
    }, [location, navigate]);

    const [darkMode, setDarkMode] = useState(true);

    return (
        <ConfigProvider
            theme={{
                algorithm: darkMode
                    ? theme.darkAlgorithm
                    : theme.defaultAlgorithm,
                token: {
                    colorPrimary: "#18e48f",
                },
            }}
        >
            <App>
                <WasmLoadingMessage />
                <Layout style={{ minHeight: "100vh" }}>
                    <Sider breakpoint="lg" collapsedWidth="0" theme="light" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
                            <h1 className={darkMode ? "headerDark": "headerLight"} style={{ margin: 0, textAlign: 'center', fontSize: 40, lineHeight: 1.1 }}>
                                <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                                    snorkle<br />test
                                </Link>
                            </h1>
                        </div>
                        <div>
                            <Menu
                                theme="light"
                                mode="inline"
                                selectedKeys={[menuIndex]}
                                items={menuItems}
                                onClick={onClick}
                            />
                            <Switch
                                style={{
                                    marginTop: "24px",
                                    marginLeft: "24px",
                                }}
                                checked={darkMode}
                                onChange={(value) => setDarkMode(value)}
                                checkedChildren="Dark"
                                unCheckedChildren="Light"
                            />
                            <SidebarNetworkControls />
                        </div>
                    </Sider>
                    <Layout>
                        <Content style={{ padding: "50px 50px", margin: "0 auto", minWidth: "850px" }}>
                            <Outlet />
                        </Content>
                    </Layout>
                </Layout>
            </App>
        </ConfigProvider>
    );
}

export default function AppWithNetworkProvider() {
    return (
        <NetworkProvider>
            <Main />
        </NetworkProvider>
    );
}
