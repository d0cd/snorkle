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

    const layout = { labelCol: { span: 4 }, wrapperCol: { span: 21 }};

    if (aleo !== null) {
        const recordPlaintext = () =>
            plaintext !== null ? plaintext.toString() : "";
        const viewKeyString = () =>
            viewKey !== null ? viewKey.toString() : "";
        const recordCipherTextString = () =>
            ciphertext !== null ? ciphertext.toString() : "";

        return (
            <div className="container record-decrypt-container">
                <Card
                    className="record-decrypt-card"
                    title={<span style={{ fontSize: 22, fontWeight: 600 }}>Decrypt Record</span>}
                    style={{ width: "100%", borderRadius: 16, boxShadow: "0 4px 24px 0 rgba(0,0,0,0.15)", background: "#18181c", border: "1px solid #222" }}
                    headStyle={{ borderRadius: "16px 16px 0 0", background: "#18181c" }}
                >
                    <Form {...layout} style={{ marginTop: 24 }}>
                        <Form.Item label="Ciphertext" colon={false} style={{ marginBottom: 24 }}>
                            <Input
                                name="recordCiphertext"
                                size="large"
                                placeholder="Record (Ciphertext)"
                                allowClear
                                onChange={onCiphertextChange}
                                value={recordCipherTextString()}
                                style={{ borderRadius: 8, background: "#222", color: "#fff" }}
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
                                style={{ borderRadius: 8, background: "#222", color: "#fff" }}
                            />
                        </Form.Item>
                    </Form>
                    {ciphertext || viewKey ? (
                        <Row justify="center" style={{ marginBottom: 24 }}>
                            <Col>
                                <Button size="large" onClick={clearForm} style={{ borderRadius: 8, width: 120 }}>
                                    Clear
                                </Button>
                            </Col>
                        </Row>
                    ) : null}
                    {
                        <Form {...layout}>
                            <Divider />
                            <Form.Item label={<span style={{ fontWeight: 500 }}>Plaintext</span>} colon={false} style={{ marginBottom: 0 }}>
                                {ciphertext ? (
                                    plaintext ? (
                                        <Row align="middle">
                                            <Col span={23}>
                                                <Input.TextArea
                                                    size="large"
                                                    rows={10}
                                                    placeholder="Record (Plaintext)"
                                                    value={recordPlaintext()}
                                                    disabled
                                                    style={{ borderRadius: 8, background: "#222", color: "#fff" }}
                                                />
                                            </Col>
                                            <Col span={1} align="middle">
                                                <CopyButton
                                                    data={recordPlaintext()}
                                                />
                                            </Col>
                                        </Row>
                                    ) : (
                                        <Skeleton active />
                                    )
                                ) : (
                                    <Input.TextArea
                                        size="large"
                                        rows={10}
                                        placeholder="Record (Plaintext)"
                                        value={"Enter a ciphertext above to decrypt a record."}
                                        disabled
                                        style={{ borderRadius: 8, background: "#222", color: "#6b6b6b" }}
                                    />
                                )}
                            </Form.Item>
                        </Form>
                    }
                </Card>
            </div>
        );
    } else {
        return (
            <h3>
                <center>Loading...</center>
            </h3>
        );
    }
};
