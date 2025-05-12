import { useState } from "react";
import { Card, Divider, Form, Input, Modal } from "antd";
import { CopyButton } from "../../components/CopyButton";
import { useAleoWASM } from "../../aleo-wasm-hook";
import { KeyDropdown } from "../../components/KeyDropdown";

export const EncryptAccount = () => {
    const [account, setAccount] = useState(null);
    const [encryptedAccount, setEncryptedAccount] = useState(null);
    const [password, setPassword] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [aleo] = useAleoWASM();

    const onKeyChange = (event) => {
        setInputValue(event.target.value);
        setAccount(null);
        setEncryptedAccount(null);
        try {
            setAccount(aleo.PrivateKey.from_string(event.target.value));
        } catch (error) {
            console.error(error);
        }
    };

    const handleDropdownSelect = (val) => {
        setInputValue(val);
        setAccount(null);
        setEncryptedAccount(null);
        try {
            setAccount(aleo.PrivateKey.from_string(val));
        } catch (error) {
            console.error(error);
        }
    };

    const encryptAccount = async () => {
        if (password && account) {
            try {
                setEncryptedAccount(account.toCiphertext(passwordString()));
                setPassword(null);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const onPasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const privateKey = () => (account !== null ? account.to_string() : "");
    const viewKey = () =>
        account !== null ? account.to_view_key().to_string() : "";
    const address = () =>
        account !== null ? account.to_address().to_string() : "";
    const encryptedPrivateKey = () =>
        encryptedAccount !== null ? encryptedAccount.toString() : "";
    const passwordString = () => (password !== null ? password : "");

    const layout = { labelCol: { span: 3 }, wrapperCol: { span: 21 } };

    if (aleo !== null) {
        return (
            <Card
                title="Encrypt Account"
                style={{ width: "100%" }}
            >
                <Form {...layout}>
                    <Form.Item label="Private Key" colon={false}>
                        <Input
                            name="privateKey"
                            size="large"
                            placeholder="Private Key"
                            allowClear
                            onChange={onKeyChange}
                            value={inputValue}
                            addonAfter={<KeyDropdown type="privateKey" onSelect={handleDropdownSelect} />}
                        />
                    </Form.Item>
                </Form>
                {account && (
                    <Form {...layout}>
                        <Divider />
                        <Form.Item label="Private Key" colon={false}>
                            <Input
                                size="large"
                                placeholder="Private Key"
                                value={privateKey()}
                                addonAfter={<CopyButton data={privateKey()} />}
                                disabled
                            />
                        </Form.Item>
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
                        <Divider />
                        <Form.Item label="Password" colon={false}>
                            <Input
                                name="password"
                                size="large"
                                placeholder="Password"
                                type="password"
                                onChange={onPasswordChange}
                                value={passwordString()}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Input
                                size="large"
                                placeholder="Encrypted Private Key"
                                value={encryptedPrivateKey()}
                                addonAfter={<CopyButton data={encryptedPrivateKey()} />}
                                disabled
                            />
                        </Form.Item>
                    </Form>
                )}
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
