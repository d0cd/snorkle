import { useState, useEffect } from "react";
import {Button, Card, Col, Form, Input, Row, Result, Spin, Switch} from "antd";
import axios from "axios";
import { useNetwork } from "../../NetworkContext";

export const Join = () => {
    const [joinFeeRecord, setJoinFeeRecord] = useState(null);
    const [recordOne, setRecordOne] = useState(null);
    const [recordTwo, setRecordTwo] = useState(null);
    const [privateFee, setPrivateFee] = useState(false);
    const [loading, setLoading] = useState(false);
    const [privateKey, setPrivateKey] = useState(null);
    const [joinError, setJoinError] = useState(null);
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
            if (ev.data.type == "JOIN_TRANSACTION_COMPLETED") {
                const transactionId = ev.data.joinTransaction;
                setLoading(false);
                setJoinError(null);
                setTransactionID(transactionId);
            } else if (ev.data.type == "ERROR") {
                setJoinError(ev.data.errorMessage);
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

    const join = async () => {
        setLoading(true);
        setTransactionID(null);
        setJoinError(null);

        if (!isCustomEndpointValid || !isCustomNetworkValid) {
            setJoinError("Invalid endpoint or network");
            setLoading(false);
            return;
        }

        await postMessagePromise(worker, {
            type: "ALEO_JOIN",
            recordOne: recordOneString(),
            recordTwo: recordTwoString(),
            fee: 0,
            privateFee: privateFee,
            feeRecord: feeRecordString(),
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
                setJoinError(error);
                setLoading(false);
                setTransactionID(null);
                reject(error);
            };
            worker.postMessage(message);
        });
    }

    const onRecordOneChange = (event) => {
        if (event.target.value !== null) {
            setRecordOne(event.target.value);
        }
        setTransactionID(null);
        setJoinError(null);
        return recordOne;
    };

    const onRecordTwoChange = (event) => {
        if (event.target.value !== null) {
            setRecordTwo(event.target.value);
        }
        setTransactionID(null);
        setJoinError(null);
        return recordTwo;
    };

    const onJoinFeeRecordChange = (event) => {
        if (event.target.value !== null) {
            setJoinFeeRecord(event.target.value);
        }
        setTransactionID(null);
        setJoinError(null);
        return joinFeeRecord;
    };

    const onPrivateKeyChange = (event) => {
        if (event.target.value !== null) {
            setPrivateKey(event.target.value);
        }
        setTransactionID(null);
        setJoinError(null);
        return privateKey;
    };

    const layout = { labelCol: { span: 5 }, wrapperCol: { span: 21 } };
    const privateKeyString = () => (privateKey !== null ? privateKey : "");
    const feeRecordString = () => (joinFeeRecord !== null ? joinFeeRecord : "");
    const recordOneString = () => (recordOne !== null ? recordOne : "");
    const recordTwoString = () => (recordTwo !== null ? recordTwo : "");
    const transactionIDString = () =>
        transactionID !== null ? transactionID : "";
    const joinErrorString = () => (joinError !== null ? joinError : "");

    return (
        <Card
            title="Join Record"
            style={{ width: "100%"}}
        >
            <Form {...layout}>
                <Form.Item
                    label="Record One"
                    colon={false}
                    validateStatus={status}
                >
                    <Input.TextArea
                        name="Record One"
                        size="small"
                        placeholder="First record to join"
                        allowClear
                        onChange={onRecordOneChange}
                        value={recordOneString()}
                    />
                </Form.Item>
                <Form.Item
                    label="Record Two"
                    colon={false}
                    validateStatus={status}
                >
                    <Input.TextArea
                        name="Record Two"
                        size="small"
                        placeholder="Second record to join"
                        allowClear
                        onChange={onRecordTwoChange}
                        value={recordTwoString()}
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
                            placeholder="Record used to pay join fee"
                            allowClear
                            onChange={onJoinFeeRecordChange}
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
                    <Input.TextArea
                        name="private_key"
                        size="small"
                        placeholder="Private Key"
                        allowClear
                        onChange={onPrivateKeyChange}
                        value={privateKeyString()}
                    />
                </Form.Item>
                <Row justify="center">
                    <Col justify="center">
                        <Button
                            type="primary"
                            size="middle"
                            onClick={join}
                            loading={loading}
                        >
                            Join
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
                    <Spin tip="Joining Records..." size="large" />
                )}
                {transactionID !== null && (
                    <Result
                        status="success"
                        title="Join Successful!"
                        subTitle={"Transaction ID: " + transactionIDString()}
                    />
                )}
                {joinError !== null && (
                    <Result
                        status="error"
                        title="Join Error"
                        subTitle={"Error: " + joinErrorString()}
                    />
                )}
            </Row>
        </Card>
    );
};
