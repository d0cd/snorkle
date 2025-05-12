import { useKeyVault } from "../KeyVaultContext";
import { Modal, List, Input, Button, Popconfirm, Space, Tooltip, message } from "antd";
import { CopyOutlined, DeleteOutlined, EditOutlined, DownloadOutlined, UploadOutlined, PlusOutlined, EyeInvisibleOutlined, EyeOutlined, DownOutlined, UpOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useAleoWASM } from "../aleo-wasm-hook";

export function ManageKeysModal({ open, onClose }) {
  const { keys, editKey, deleteKey, clearAll, addKey } = useKeyVault();
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [aleo, aleoLoading] = useAleoWASM();
  const [newKeyModalOpen, setNewKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState(null);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [revealedFields, setRevealedFields] = useState({});
  const [nameError, setNameError] = useState("");
  const [expandedAccounts, setExpandedAccounts] = useState({});

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditName(name);
  };
  const handleEditSave = (id) => {
    editKey(id, { name: editName });
    setEditingId(null);
    setEditName("");
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleGenerateRandomKey = async () => {
    if (aleoLoading) {
      message.error("Aleo SDK is still loading. Please wait a moment.");
      return;
    }
    if (!aleo) {
      message.error("Aleo SDK failed to load. Please refresh the page.");
      return;
    }

    setGeneratingKey(true);
    try {
      // Generate a new private key
      const privateKey = new aleo.PrivateKey();
      const key = {
        privateKey: privateKey.to_string(),
        viewKey: privateKey.to_view_key().to_string(),
        address: privateKey.to_address().to_string(),
      };
      setGeneratedKey(key);
      setNewKeyName(`Account ${key.address.slice(0, 6)}`);
      setNewKeyModalOpen(true);
    } catch (error) {
      console.error("Error generating key:", error);
      message.error("Failed to generate key. Please try again.");
    } finally {
      setGeneratingKey(false);
    }
  };

  const toggleFieldReveal = (id, field) => {
    setRevealedFields(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: !prev[id]?.[field]
      }
    }));
  };

  const isDuplicateName = (name) => {
    return keys.some(k => k.name.trim().toLowerCase() === name.trim().toLowerCase());
  };

  const handleSaveNewKey = () => {
    if (!newKeyName.trim()) return;
    if (isDuplicateName(newKeyName)) {
      setNameError("Account name already exists.");
      return;
    }
    setNameError("");
    if (generatedKey) {
      addKey({
        name: newKeyName,
        ...generatedKey
      });
      setNewKeyModalOpen(false);
      setGeneratedKey(null);
      setNewKeyName("");
      message.success("Key saved successfully!");
    }
  };

  // Export keys as JSON
  const handleExport = () => {
    const data = JSON.stringify(keys, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "snorkle-keys.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import keys from JSON
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        if (Array.isArray(imported)) {
          imported.forEach(k => editKey(k.id, k));
        }
      } catch (e) {
        message.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const toggleExpand = (id) => {
    setExpandedAccounts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <>
      <Modal
        title="Manage Keys"
        open={open}
        onCancel={onClose}
        footer={null}
        width={600}
      >
        <Space style={{ marginBottom: 16 }}>
          <Button 
            icon={<PlusOutlined />} 
            onClick={handleGenerateRandomKey}
            loading={generatingKey}
            disabled={aleoLoading}
          >
            Generate Random Key
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>Export</Button>
          <label style={{ display: 'inline-block' }}>
            <Button icon={<UploadOutlined />}>Import</Button>
            <input type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />
          </label>
          <Popconfirm title="Delete all keys?" onConfirm={clearAll} okText="Yes" cancelText="No">
            <Button danger>Clear All</Button>
          </Popconfirm>
        </Space>
        <List
          bordered
          dataSource={keys}
          renderItem={item => (
            <List.Item
              actions={[
                <Button
                  icon={expandedAccounts[item.id] ? <UpOutlined /> : <DownOutlined />}
                  size="small"
                  onClick={() => toggleExpand(item.id)}
                  key="expand"
                />,
                editingId === item.id ? (
                  <Button size="small" type="primary" onClick={() => handleEditSave(item.id)} key="save">Save</Button>
                ) : (
                  <Tooltip title="Edit Name"><Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(item.id, item.name)} key="edit" /></Tooltip>
                ),
                <Popconfirm title="Delete this key?" onConfirm={() => deleteKey(item.id)} okText="Yes" cancelText="No" key="delete">
                  <Button icon={<DeleteOutlined />} size="small" danger />
                </Popconfirm>
              ]}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {editingId === item.id ? (
                  <Input value={editName} onChange={e => setEditName(e.target.value)} onPressEnter={() => handleEditSave(item.id)} />
                ) : (
                  <span style={{ fontWeight: 500 }}>{item.name}</span>
                )}
                {expandedAccounts[item.id] && (
                  <>
                    {/* Private Key Row */}
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ minWidth: 90 }}>Private Key:</span>
                      <div style={{ flex: 1, background: '#222', borderRadius: 6, padding: '6px 10px', fontFamily: 'monospace', wordBreak: 'break-all', color: '#fff', marginLeft: 8, maxWidth: 400, overflowX: 'auto', whiteSpace: 'nowrap' }}>
                        {item.privateKey}
                      </div>
                      <Button icon={<CopyOutlined />} size="small" style={{ marginLeft: 8 }} onClick={() => handleCopy(item.privateKey)} />
                    </div>
                    {/* View Key Row */}
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ minWidth: 90 }}>View Key:</span>
                      <div style={{ flex: 1, background: '#222', borderRadius: 6, padding: '6px 10px', fontFamily: 'monospace', wordBreak: 'break-all', color: '#fff', marginLeft: 8, maxWidth: 400, overflowX: 'auto', whiteSpace: 'nowrap' }}>
                        {item.viewKey}
                      </div>
                      <Button icon={<CopyOutlined />} size="small" style={{ marginLeft: 8 }} onClick={() => handleCopy(item.viewKey)} />
                    </div>
                    {/* Address Row */}
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ minWidth: 90 }}>Address:</span>
                      <div style={{ flex: 1, background: '#222', borderRadius: 6, padding: '6px 10px', fontFamily: 'monospace', wordBreak: 'break-all', color: '#fff', marginLeft: 8, maxWidth: 400, overflowX: 'auto', whiteSpace: 'nowrap' }}>
                        {item.address}
                      </div>
                      <Button icon={<CopyOutlined />} size="small" style={{ marginLeft: 8 }} onClick={() => handleCopy(item.address)} />
                    </div>
                  </>
                )}
              </Space>
            </List.Item>
          )}
        />
      </Modal>
      <Modal
        title="Save New Key"
        open={newKeyModalOpen}
        onOk={handleSaveNewKey}
        onCancel={() => {
          setNewKeyModalOpen(false);
          setGeneratedKey(null);
          setNewKeyName("");
          setNameError("");
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setNewKeyModalOpen(false);
            setGeneratedKey(null);
            setNewKeyName("");
            setNameError("");
          }}>Cancel</Button>,
          <Button key="save" type="primary" onClick={handleSaveNewKey} disabled={!newKeyName.trim()}>Save</Button>
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="Key Name (required)"
            value={newKeyName}
            onChange={e => {
              setNewKeyName(e.target.value);
              setNameError("");
            }}
            maxLength={32}
            status={!newKeyName.trim() || nameError ? "error" : ""}
          />
          {nameError && <div style={{ color: 'red', marginTop: 4 }}>{nameError}</div>}
          {generatedKey && (
            <>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>Address:</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: 1, background: '#222', borderRadius: 6, padding: '6px 10px', fontFamily: 'monospace', wordBreak: 'break-all', color: '#fff', maxWidth: 400, overflowX: 'auto', whiteSpace: 'nowrap' }}>
                    {generatedKey.address}
                  </div>
                  <Button icon={<CopyOutlined />} size="small" style={{ marginLeft: 8 }} onClick={() => handleCopy(generatedKey.address)} />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>Private Key:</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: 1, background: '#222', borderRadius: 6, padding: '6px 10px', fontFamily: 'monospace', wordBreak: 'break-all', color: '#fff', maxWidth: 400, overflowX: 'auto', whiteSpace: 'nowrap' }}>
                    {generatedKey.privateKey}
                  </div>
                  <Button icon={<CopyOutlined />} size="small" style={{ marginLeft: 8 }} onClick={() => handleCopy(generatedKey.privateKey)} />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>View Key:</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: 1, background: '#222', borderRadius: 6, padding: '6px 10px', fontFamily: 'monospace', wordBreak: 'break-all', color: '#fff', maxWidth: 400, overflowX: 'auto', whiteSpace: 'nowrap' }}>
                    {generatedKey.viewKey}
                  </div>
                  <Button icon={<CopyOutlined />} size="small" style={{ marginLeft: 8 }} onClick={() => handleCopy(generatedKey.viewKey)} />
                </div>
              </div>
            </>
          )}
        </Space>
      </Modal>
    </>
  );
} 