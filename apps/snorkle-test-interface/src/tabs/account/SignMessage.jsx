import {useMemo, useState} from "react";
import { Card, Divider, Form, Input } from "antd";
import { CopyButton } from "../../components/CopyButton";
import { useAleoWASM } from "../../aleo-wasm-hook";
import { KeyDropdown } from "../../components/KeyDropdown";

export const SignMessage = () => {
    const [signingAccount, setSigningAccount] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [messageString, setMessageString] = useState("");
    const [signatureString, setSignatureString] = useState("");
    const [aleo] = useAleoWASM();
    const textEncoder = new TextEncoder();

    const onKeyChange = (event) => {
        setInputValue(event.target.value);
        setSigningAccount(null);
        try {
            setSigningAccount(aleo.PrivateKey.from_string(event.target.value));
            onMessageChange();
        } catch (error) {
            console.error(error);
        } finally {
            setMessageString(null);
            setSignatureString(null);
        }
    };

    const handleDropdownSelect = (val) => {
        setInputValue(val);
        try {
            setSigningAccount(aleo.PrivateKey.from_string(val));
            onMessageChange();
        } catch (error) {
            console.error(error);
        }
    };

    const signString = (str) => {
        if ((str === "") | (signingAccount === null)) return;
        return signingAccount.sign(textEncoder.encode(str)).to_string();
    };

    const onMessageChange = (event) => {
        setMessageString(event.target.value);
        try {
            setSignatureString(signString(event.target.value));
        } catch (error) {
            console.error(error);
        }
    };

    const layout = { labelCol: { span: 3 }, wrapperCol: { span: 21 } };

    if (aleo !== null) {
        return (
            <Card
                title="Sign a Message"
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
                    <Form.Item label="Message" colon={false}>
                        <Input
                            name="Message"
                            size="large"
                            placeholder="Message"
                            value={messageString}
                            allowClear={true}
                            onChange={onMessageChange}
                        />
                    </Form.Item>
                </Form>
                {signingAccount ? (
                    <Form {...layout}>
                        <Divider />
                        <Form.Item label="Signature" colon={false}>
                            <Input
                                size="large"
                                placeholder="Signature"
                                value={signatureString}
                                addonAfter={
                                    <CopyButton data={signatureString} />
                                }
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
