import { useState, useEffect } from "react";
import {
    Button,
    Card,
    Col,
    Select,
    Dropdown,
    Form,
    Input,
    Row,
    Result,
    Space,
    Spin,
    Switch,
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNetwork } from "../../NetworkContext";
import { KeyDropdown } from "../../components/KeyDropdown";

export const Transfer = () => {
    const [transferFeeRecord, setTransferFeeRecord] = useState(null);
    const [amountRecord, setAmountRecord] = useState(null);
    const [transferAmount, setTransferAmount] = useState("1.0");
    const [privateFee, setPrivateFee] = useState(false);
    const [recipient, setRecipient] = useState(null);
    const [loading, setLoading] = useState(false);
    const [privateKey, setPrivateKey] = useState(null);
    const [transferError, setTransferError] = useState(null);
    const [status, setStatus] = useState("");
    const [transactionID, setTransactionID] = useState(null);
    const [visibility, setVisibility] = useState("private");
    const [worker, setWorker] = useState(null);
    const { endpointUrl, networkString, isCustomEndpointValid, isCustomNetworkValid } = useNetwork();

    function spawnWorker() {
        let worker = new Worker(
            new URL("../../workers/worker.js", import.meta.url),
            { type: "module" },
        );
        worker.addEventListener("message", (ev) => {
            if (ev.data.type === "TRANSFER_TRANSACTION_COMPLETED") {
                const transactionId = ev.data.transferTransaction;
                setLoading(false);
                setTransferError(null);
                setTransactionID(transactionId);
            } else if (ev.data.type === "ERROR") {
                setTransferError(ev.data.errorMessage);
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

    const transfer = async () => {
        setLoading(true);
        setTransactionID(null);
        setTransferError(null);

        const amount = parseFloat(amountString());
        if (isNaN(amount)) {
            setTransferError("Amount is not a valid number");
            setLoading(false);
            return;
        } else if (amount <= 0) {
            setTransferError("Amount must be greater than 0");
            setLoading(false);
            return;
        }

        if (!isCustomEndpointValid || !isCustomNetworkValid) {
            setTransferError("Invalid endpoint or network");
            setLoading(false);
            return;
        }

        await postMessagePromise(worker, {
            type: "ALEO_TRANSFER",
            transferAmount: amount,
            record: amountRecordString(),
            recipient: recipientString(),
            fee: 0,
            privateFee: privateFee,
            feeRecord: feeRecordString(),
            privateKey: privateKeyString(),
            url: endpointUrl,
            visibility: visibilityString(),
        });
    };

    function postMessagePromise(worker, message) {
        return new Promise((resolve, reject) => {
            worker.onmessage = (event) => {
                resolve(event.data);
            };
            worker.onerror = (error) => {
                setTransferError(error);
                setLoading(false);
                setTransactionID(null);
                reject(error);
            };
            worker.postMessage(message);
        });
    }

    const onAmountChange = (event) => {
        if (event.target.value !== null) {
            setTransferAmount(event.target.value);
        }
        setTransactionID(null);
        setTransferError(null);
        return transferAmount;
    };

    const onAmountRecordChange = (event) => {
        if (event.target.value !== null) {
            setAmountRecord(event.target.value);
        }
        setTransactionID(null);
        setTransferError(null);
        return amountRecord;
    };

    const onTransferFeeRecordChange = (event) => {
        if (event.target.value !== null) {
            setTransferFeeRecord(event.target.value);
        }
        setTransactionID(null);
        setTransferError(null);
        return transferFeeRecord;
    };

    const onRecipientChange = (event) => {
        if (event.target.value !== null) {
            setRecipient(event.target.value);
        }
        setTransactionID(null);
        setTransferError(null);
        return recipient;
    };

    const onPrivateKeyChange = (event) => {
        if (event.target.value !== null) {
            setPrivateKey(event.target.value);
        }
        setTransactionID(null);
        setTransferError(null);
        return privateKey;
    };

    const handleDropdownSelect = (val) => {
        setPrivateKey(val);
        setTransactionID(null);
        setTransferError(null);
    };

    const onClick = ({ value }) => {
        setTransactionID(null);
        setTransferError(null);
        setVisibility(value);
        console.log("Visibility changed to: ", value);
        if (value === "public" || value === "publicToPrivate") {
            setAmountRecord(null);
        }
    };

    const onVisibilityChange = (value) => {
        setTransactionID(null);
        setTransferError(null);
        setVisibility(value);
        console.log("Visibility changed to: ", value);
        if (value === "public" || value === "publicToPrivate") {
            setAmountRecord(null);
        }
    };

    const layout = { labelCol: { span: 5 }, wrapperCol: { span: 21 } };
    const amountString = () => (transferAmount !== null ? transferAmount : "");
    const recipientString = () => (recipient !== null ? recipient : "");
    const privateKeyString = () => (privateKey !== null ? privateKey : "");
    const feeRecordString = () =>
        transferFeeRecord !== null ? transferFeeRecord : "";
    const amountRecordString = () =>
        amountRecord !== null ? amountRecord : "";
    const transactionIDString = () =>
        transactionID !== null ? transactionID : "";
    const transferErrorString = () =>
        transferError !== null ? transferError : "";
    const visibilityString = () =>
        visibility !== null ? visibility : "private";

    return (
        <Card
            title="Transfer Record"
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
                        placeholder="Amount to transfer"
                        allowClear
                        onChange={onAmountChange}
                        value={amountString()}
                    />
                </Form.Item>
                <Form.Item
                    label="Recipient"
                    colon={false}
                    validateStatus={status}
                >
                    <Input
                        name="recipient"
                        size="middle"
                        placeholder="Recipient address"
                        allowClear
                        onChange={onRecipientChange}
                        value={recipientString()}
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
                        placeholder="Record to transfer"
                        allowClear
                        onChange={onAmountRecordChange}
                        value={amountRecordString()}
                    />
                </Form.Item>
                <Form.Item
                    label="Private Fee"
                    name="private_fee"
                    valuePropName="checked"
                    initialValue={false}
                >
                    <Switch onChange={setPrivateFee} />
                </Form.Item>
                {privateFee && (
                    <Form.Item
                        label="Fee Record"
                        name="fee_record"
                        colon={false}
                        validateStatus={status}
                    >
                        <Input.TextArea
                            name="Fee Record"
                            size="small"
                            placeholder="Record used to pay transfer fee"
                            allowClear
                            onChange={onTransferFeeRecordChange}
                            value={feeRecordString()}
                        />
                    </Form.Item>
                )}
                <Form.Item
                    label="Private Key"
                    name="private_key"
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
                <Form.Item
                    label="Visibility"
                    name="visibility"
                    initialValue="private"
                >
                    <Select
                        options={[
                            { label: "Private", value: "private" },
                            { label: "Private to Public", value: "privateToPublic" },
                            { label: "Public", value: "public" },
                            { label: "Public to Private", value: "publicToPrivate" },
                        ]}
                        onChange={onVisibilityChange}
                    />
                </Form.Item>
                <Row justify="center">
                    <Col justify="center">
                        <Button
                            type="primary"
                            size="middle"
                            onClick={transfer}
                            loading={loading}
                        >
                            Transfer
                        </Button>
                    </Col>
                </Row>
            </Form>
            <Row
                justify="center"
                gutter={[16, 32]}
                style={{ marginTop: "48px" }}
            >
                {loading === true && (
                    <Spin tip="Transferring Record..." size="large" />
                )}
                {transactionID !== null && (
                    <Result
                        status="success"
                        title="Transfer Successful!"
                        subTitle={"Transaction ID: " + transactionIDString()}
                    />
                )}
                {transferError !== null && (
                    <Result
                        status="error"
                        title="Transfer Error"
                        subTitle={"Error: " + transferErrorString()}
                    />
                )}
            </Row>
        </Card>
    );
};
