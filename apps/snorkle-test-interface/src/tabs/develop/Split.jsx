import { useState, useEffect } from "react";
import { Button, Card, Col, Form, Input, Row, Result, Spin, Space } from "antd";
import axios from "axios";
import { useNetwork } from "../../NetworkContext";
import { KeyDropdown } from "../../components/KeyDropdown";

export const Split = () => {
    const [amountRecord, setAmountRecord] = useState(null);
    const [splitAmount, setSplitAmount] = useState("1.0");
    const [loading, setLoading] = useState(false);
    const [privateKey, setPrivateKey] = useState(null);
    const [splitError, setSplitError] = useState(null);
    const [status, setStatus] = useState("");
    const [transactionID, setTransactionID] = useState(null);
    const [worker, setWorker] = useState(null);
    const { endpointUrl, networkString, isCustomEndpointValid, isCustomNetworkValid } = useNetwork();

    function spawnWorker() {
        let worker = new Worker(
            new URL("../../workers/worker.js", import.meta.url),
            { type: "module" },
        );
        worker.addEventListener("message", (ev) => {
            if (ev.data.type == "SPLIT_TRANSACTION_COMPLETED") {
                const transactionId = ev.data.splitTransaction;
                setLoading(false);
                setSplitError(null);
                setTransactionID(transactionId);
            } else if (ev.data.type == "ERROR") {
                setSplitError(ev.data.errorMessage);
                setLoading(false);
                setTransactionID(null);
            }
        });
        return worker;
    }

    useEffect(() => {
        if (worker === null) {
            const spawnedWorker = spawnWorker();
            setWorker(spawnedWorker);
            return () => {
                spawnedWorker.terminate();
            };
        }
    }, []);

    const split = async () => {
        setLoading(true);
        setTransactionID(null);
        setSplitError(null);

        const amount = parseFloat(amountString());
        if (isNaN(amount)) {
            setSplitError("Amount is not a valid number");
            setLoading(false);
            return;
        } else if (amount <= 0) {
            setSplitError("Amount must be greater than 0");
            setLoading(false);
            return;
        }

        if (!isCustomEndpointValid || !isCustomNetworkValid) {
            setSplitError("Invalid endpoint or network");
            setLoading(false);
            return;
        }

        await postMessagePromise(worker, {
            type: "ALEO_SPLIT",
            splitAmount: amount,
            record: amountRecordString(),
            privateKey: privateKeyString(),
            url: endpointUrl,
        });
    };

    function postMessagePromise(worker, message) {
        return new Promise((resolve, reject) => {
            worker.onmessage = (event) => {
                resolve(event.data);
            };
            worker.onerror = (error) => {
                setSplitError(error);
                setLoading(false);
                setTransactionID(null);
                reject(error);
            };
            worker.postMessage(message);
        });
    }

    const onAmountChange = (event) => {
        if (event.target.value !== null) {
            setSplitAmount(event.target.value);
        }
        setTransactionID(null);
        setSplitError(null);
        return splitAmount;
    };

    const onAmountRecordChange = (event) => {
        if (event.target.value !== null) {
            setAmountRecord(event.target.value);
        }
        setTransactionID(null);
        setSplitError(null);
        return amountRecord;
    };

    const onPrivateKeyChange = (event) => {
        if (event.target.value !== null) {
            setPrivateKey(event.target.value);
        }
        setTransactionID(null);
        setSplitError(null);
        return privateKey;
    };

    const handleDropdownSelect = (val) => {
        setPrivateKey(val);
        setTransactionID(null);
        setSplitError(null);
    };

    const layout = { labelCol: { span: 5 }, wrapperCol: { span: 21 } };
    const amountString = () => (splitAmount !== null ? splitAmount : "");
    const privateKeyString = () => (privateKey !== null ? privateKey : "");
    const amountRecordString = () =>
        amountRecord !== null ? amountRecord : "";
    const transactionIDString = () =>
        transactionID !== null ? transactionID : "";
    const splitErrorString = () => (splitError !== null ? splitError : "");

    return (
        <Card
            title="Split Record"
            style={{ width: "100%"}}
        >
            <Form {...layout}>
                <Form.Item
                    label="Amount"
                    colon={false}
                    validateStatus={status}
                >
                    <Input
                        name="amount"
                        size="middle"
                        placeholder="Amount to split"
                        allowClear
                        onChange={onAmountChange}
                        value={amountString()}
                    />
                </Form.Item>
                <Form.Item
                    label="Record"
                    colon={false}
                    validateStatus={status}
                >
                    <Input.TextArea
                        name="Record"
                        size="small"
                        placeholder="Record to split"
                        allowClear
                        onChange={onAmountRecordChange}
                        value={amountRecordString()}
                    />
                </Form.Item>
                <Form.Item
                    label="Private Key"
                    colon={false}
                    validateStatus={status}
                >
                    <Input
                        name="privateKey"
                        size="middle"
                        placeholder="Private key"
                        allowClear
                        onChange={onPrivateKeyChange}
                        value={privateKeyString()}
                        addonAfter={<KeyDropdown type="privateKey" onSelect={handleDropdownSelect} />}
                    />
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        size="middle"
                        onClick={split}
                        loading={loading}
                    >
                        Split
                    </Button>
                </Form.Item>
            </Form>
            {transactionID !== null && (
                <Form {...layout}>
                    <Form.Item
                        label="Transaction ID"
                        colon={false}
                    >
                        <Input
                            size="large"
                            placeholder="Transaction ID"
                            value={transactionIDString()}
                            disabled
                            addonAfter={<CopyButton data={transactionIDString()} />}
                        />
                    </Form.Item>
                </Form>
            )}
            {splitError !== null && (
                <Result status="error" title="Error" subTitle={splitErrorString()} />
            )}
        </Card>
    );
};
