import { useState } from "react";
import { Button, Card, Col, Divider, Form, Input, Row, Skeleton } from "antd";
import { CopyButton } from "../../components/CopyButton";
import { useAleoWASM } from "../../aleo-wasm-hook";
import "./DecryptRecord.css";

export const DecryptRecord = () => {
    const [ciphertext, setCiphertext] = useState(null);
    const [viewKey, setViewKey] = useState(null);
    const [plaintext, setPlaintext] = useState(null);
    const [_isOwner, setIsOwner] = useState(null);
    const [aleo] = useAleoWASM();

    const onCiphertextChange = (event) => {
        setCiphertext(null);
        try {
            setCiphertext(event.target.value);
            tryDecrypt(event.target.value, viewKey);
        } catch (error) {
            console.error(error);
        }
    };
    const onViewKeyChange = (event) => {
        setViewKey(null);
        try {
            setViewKey(event.target.value);
            tryDecrypt(ciphertext, event.target.value);
        } catch (error) {
            console.error(error);
        }
    };
    const tryDecrypt = (ciphertext, viewKey) => {
        setPlaintext(null);
        try {
            if (ciphertext && viewKey) {
                setPlaintext(
                    aleo.ViewKey.from_string(viewKey).decrypt(ciphertext),
                );
                setIsOwner(true);
            }
        } catch (error) {
            console.warn(error);
            try {
                aleo.RecordCiphertext.fromString(ciphertext);
                setIsOwner(false);
            } catch (error) {
                setIsOwner(null);
                console.warn(error);
            }
            if (plaintext !== null) {
                setPlaintext(null);
            }
        }
    };
    const clearForm = async () => {
        setCiphertext(null);
        setViewKey(null);
        setPlaintext(null);
        setIsOwner(null);
    };

    const layout = { labelCol: { span: 5 }, wrapperCol: { span: 18 } };

    if (aleo !== null) {
        const recordPlaintext = () =>
            plaintext !== null ? plaintext.toString() : "";
        const viewKeyString = () =>
            viewKey !== null ? viewKey.toString() : "";
        const recordCipherTextString = () =>
            ciphertext !== null ? ciphertext.toString() : "";

        return (
            <Card
                title={<span style={{ fontSize: 22, fontWeight: 600 }}>Decrypt Record</span>}
                style={{ width: "100%", fontFamily: 'inherit' }}
            >
                <Form {...layout} style={{ marginTop: 24, fontFamily: 'inherit' }}>
                    <Form.Item label="Ciphertext" colon={false} style={{ marginBottom: 24 }}>
                        <Input
                            name="recordCiphertext"
                            size="large"
                            placeholder="Record (Ciphertext)"
                            allowClear
                            onChange={onCiphertextChange}
                            value={recordCipherTextString()}
                        />
                    </Form.Item>
                    <Form.Item label="View Key" colon={false} style={{ marginBottom: 24 }}>
                        <Input
                            name="viewKey"
                            size="large"
                            placeholder="View Key"
                            allowClear
                            onChange={onViewKeyChange}
                            value={viewKeyString()}
                        />
                    </Form.Item>
                </Form>
                <Divider />
                <Form {...layout} style={{ fontFamily: 'inherit' }}>
                    <Form.Item label={<span style={{ fontWeight: 500 }}>Plaintext</span>} colon={false} style={{ marginBottom: 0 }}>
                        <Input.TextArea
                            size="large"
                            rows={10}
                            placeholder="Record (Plaintext)"
                            value={ciphertext ? (plaintext ? recordPlaintext() : "Decrypting...") : "Enter a ciphertext above to decrypt a record."}
                            disabled
                            addonAfter={ciphertext && plaintext ? <CopyButton data={recordPlaintext()} /> : null}
                        />
                    </Form.Item>
                </Form>
                {(ciphertext || viewKey) && (
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0 0 0' }}>
                        <Button size="large" onClick={clearForm} style={{ borderRadius: 8, width: 120 }}>
                            Clear
                        </Button>
                    </div>
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
