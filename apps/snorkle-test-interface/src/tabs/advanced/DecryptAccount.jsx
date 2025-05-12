import { useState } from "react";
import { Card, Divider, Form, Input } from "antd";
import { CopyButton } from "../../components/CopyButton";
import { useAleoWASM } from "../../aleo-wasm-hook";
import { KeyDropdown } from "../../components/KeyDropdown";

export const DecryptAccount = () => {
    const [accountFromCiphertext, setAccountFromCiphertext] = useState(null);
    const [ciphertext, setCiphertext] = useState("");
    const [password, setPassword] = useState("");
    const [aleo] = useAleoWASM();

    const onCiphertextChange = (event) => {
        setCiphertext(event.target.value);
        setAccountFromCiphertext(null);
    };

    const onPasswordChange = (event) => {
        setPassword(event.target.value);
        setAccountFromCiphertext(null);
        try {
            if (ciphertext && event.target.value) {
                setAccountFromCiphertext(
                    aleo.PrivateKey.fromCiphertext(
                        ciphertext,
                        event.target.value,
                    ),
                );
            }
        } catch (error) {
            console.error(error);
        }
    };

    const validateStatusAccount = () => {
        if (accountFromCiphertext !== null) {
            return "success";
        } else if (password !== "") {
            return "error";
        } else {
            return "";
        }
    };

    const layout = { labelCol: { span: 3 }, wrapperCol: { span: 21 } };

    if (aleo !== null) {
        const privateKey = () =>
            accountFromCiphertext !== null
                ? accountFromCiphertext.to_string()
                : "";
        const viewKey = () =>
            accountFromCiphertext !== null
                ? accountFromCiphertext.to_view_key().to_string()
                : "";
        const address = () =>
            accountFromCiphertext !== null
                ? accountFromCiphertext.to_address().to_string()
                : "";

        return (
            <Card
                title="Decrypt Account Ciphertext with Password"
                style={{ width: "100%" }}
            >
                <Form {...layout}>
                    <Form.Item label="Private Key Ciphertext" colon={false}>
                        <Input
                            name="privateKeyCiphertext"
                            size="large"
                            placeholder="Private Key Ciphertext"
                            allowClear
                            onChange={onCiphertextChange}
                            value={ciphertext}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        colon={false}
                        hasFeedback
                        validateStatus={validateStatusAccount()}
                    >
                        <Input
                            name="password"
                            size="large"
                            placeholder="Password"
                            type="password"
                            onChange={onPasswordChange}
                            value={password}
                        />
                    </Form.Item>
                </Form>
                {accountFromCiphertext !== null ? (
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
                    </Form>
                ) : null}
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
