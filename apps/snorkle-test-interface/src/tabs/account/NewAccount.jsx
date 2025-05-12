import { useState } from "react";
import { Card, Divider, Form, Input, Modal } from "antd";
import { CopyButton } from "../../components/CopyButton";
import { useAleoWASM } from "../../aleo-wasm-hook";
import { useKeyVault } from "../../KeyVaultContext";
import { KeyDropdown } from "../../components/KeyDropdown";

export const NewAccount = () => {
    const [account, setAccount] = useState(null);
    const [saveModal, setSaveModal] = useState(false);
    const [saveName, setSaveName] = useState("");
    const [aleo] = useAleoWASM();
    const { addKey } = useKeyVault();

    const handleDropdownSelect = (val) => {
        try {
            setAccount(aleo.PrivateKey.from_string(val));
        } catch (error) {
            console.error(error);
            setAccount(null);
        }
    };

    const privateKey = () => (account !== null ? account.to_string() : "");
    const viewKey = () =>
        account !== null ? account.to_view_key().to_string() : "";
    const address = () =>
        account !== null ? account.to_address().to_string() : "";

    const layout = { labelCol: { span: 3 }, wrapperCol: { span: 21 } };

    const handleSave = () => {
        addKey({
            name: saveName || `Account ${address().slice(0, 6)}`,
            privateKey: privateKey(),
            viewKey: viewKey(),
            address: address(),
        });
        setSaveModal(false);
        setSaveName("");
    };

    if (aleo !== null) {
        return (
            <Card
                title="Load Account"
                style={{ width: "100%" }}
            >
                <Form {...layout}>
                    <Form.Item label="Private Key" colon={false}>
                        <Input
                            size="large"
                            placeholder="Enter or select a private key"
                            value={privateKey()}
                            addonAfter={<KeyDropdown type="privateKey" onSelect={handleDropdownSelect} />}
                            disabled
                        />
                    </Form.Item>
                </Form>
                {account && (
                    <Form {...layout}>
                        <Divider />
                        <Form.Item label="View Key" colon={false}>
                            <Input
                                size="large"
                                placeholder="View Key"
                                value={viewKey()}
                                addonAfter={<CopyButton data={viewKey()} />}
                                disabled
                            />
                        </Form.Item>
                        <Form.Item label="Address" colon={false}>
                            <Input
                                size="large"
                                placeholder="Address"
                                value={address()}
                                addonAfter={<CopyButton data={address()} />}
                                disabled
                            />
                        </Form.Item>
                        <Form.Item>
                            <Input
                                placeholder="Account Name"
                                value={saveName}
                                onChange={e => setSaveName(e.target.value)}
                                maxLength={32}
                                style={{ marginBottom: 12 }}
                                addonAfter={
                                    <Input
                                        type="button"
                                        value="Save to Vault"
                                        onClick={() => setSaveModal(true)}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                                    />
                                }
                            />
                        </Form.Item>
                    </Form>
                )}
                <Modal
                    title="Save Account to Vault"
                    open={saveModal}
                    onOk={handleSave}
                    onCancel={() => setSaveModal(false)}
                    okText="Save"
                >
                    <div style={{ fontSize: 12, color: '#888' }}>
                        Private Key, View Key, and Address will be saved locally in your browser.
                    </div>
                </Modal>
            </Card>
        );
    } else {
        return (
            <h3>
                <center>Loading...</center>
            </h3>
        );
    }
};
