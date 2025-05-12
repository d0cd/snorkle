import { useKeyVault } from "../KeyVaultContext";
import { Dropdown, Button, Menu } from "antd";
import { KeyOutlined, DownOutlined } from "@ant-design/icons";

export function KeyDropdown({ type, onSelect, buttonType = 'default', size = 'middle' }) {
  const { keys } = useKeyVault();
  const filtered = keys.filter(k => !!k[type]);
  const menu = (
    <Menu>
      {filtered.length === 0 ? (
        <Menu.Item disabled>No saved keys</Menu.Item>
      ) : (
        filtered.map(k => (
          <Menu.Item key={k.id} onClick={() => onSelect(k[type])}>
            <span style={{ fontWeight: 500 }}>{k.name}</span>
            <span style={{ color: '#888', marginLeft: 8, fontSize: 12 }}>
              {type === 'address' ? k.address.slice(0, 8) + '...' : k[type].slice(0, 8) + '...'}
            </span>
          </Menu.Item>
        ))
      )}
    </Menu>
  );
  return (
    <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
      <Button icon={<KeyOutlined />} size={size} type={buttonType} style={{ marginLeft: 4 }}>
        <DownOutlined />
      </Button>
    </Dropdown>
  );
} 