import { useState, useEffect } from "react";
import {
    Button,
    Card,
    Col,
    Divider,
    Form,
    Input,
    message,
    Row,
    Result,
    Spin,
    Space, Switch,
} from "antd";
import { CodeEditor } from "./execute/CodeEditor.jsx";
import { useAleoWASM } from "../../aleo-wasm-hook.js";
import axios from "axios";
import { useNetwork } from "../../NetworkContext";
import { KeyDropdown } from "../../components/KeyDropdown";

export const Deploy = () => {
    const [form] = Form.useForm();
    const [aleoWASM] = useAleoWASM();
    const [deploymentFeeRecord, setDeploymentFeeRecord] = useState(null);
    const [deployUrl, setDeployUrl] = useState("https://api.explorer.provable.com/v1");
    const [deploymentFeeEstimate, setDeploymentFeeEstimate] = useState("");
    const [loading, setLoading] = useState(false);
    const [feeLoading, setFeeLoading] = useState(false);
    const [privateFee, setPrivateFee] = useState(false);
    const [privateKey, setPrivateKey] = useState(null);
    const [program, setProgram] = useState(null);
    const [deploymentError, setDeploymentError] = useState(null);
    const [status, setStatus] = useState("");
    const [transactionID, setTransactionID] = useState(null);
    const [worker, setWorker] = useState(null);
    const [messageApi, contextHolder] = message.useMessage();
    const { endpointUrl, networkString, isCustomEndpointValid, isCustomNetworkValid } = useNetwork();
    
    function spawnWorker() {
        let worker = new Worker(
            new URL("../../workers/worker.js", import.meta.url),
            { type: "module" },
        );
        worker.addEventListener("message", (ev) => {
            if (ev.data.type == "DEPLOY_TRANSACTION_COMPLETED") {
                let transactionId = ev.data.deployTransaction;
                setFeeLoading(false);
                setLoading(false);
                setDeploymentError(null);
                setTransactionID(transactionId);
                setDeploymentFeeEstimate("");
            } else if (ev.data.type == "DEPLOYMENT_FEE_ESTIMATION_COMPLETED") {
                let fee = ev.data.deploymentFee;
                setFeeLoading(false);
                setLoading(false);
                setDeploymentError(null);
                setTransactionID(null);
                setDeploymentFeeEstimate(fee.toString());
            } else if (ev.data.type == "ERROR") {
                setDeploymentError(ev.data.errorMessage);
                setFeeLoading(false);
                setLoading(false);
                setFeeLoading(false);
                setTransactionID(null);
                setDeploymentFeeEstimate("");
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

    function postMessagePromise(worker, message) {
        return new Promise((resolve, reject) => {
            worker.onmessage = (event) => {
                resolve(event.data);
            };
            worker.onerror = (error) => {
                setDeploymentError(error);
                setFeeLoading(false);
                setLoading(false);
                setTransactionID(null);
                setDeploymentFeeEstimate("");
                reject(error);
            };
            worker.postMessage(message);
        });
    }

    const deploy = async () => {
        setFeeLoading(false);
        setLoading(true);
        setTransactionID(null);
        setDeploymentError(null);
        setDeploymentFeeEstimate("");

        if (!isCustomEndpointValid || !isCustomNetworkValid) {
            setDeploymentError("Invalid endpoint or network");
            setLoading(false);
            return;
        }

        const feeAmount = parseFloat(feeString());

        await postMessagePromise(worker, {
            type: "ALEO_DEPLOY",
            program: programString(),
            privateKey: privateKeyString(),
            fee: feeAmount,
            privateFee: privateFee,
            feeRecord: feeRecordString(),
            url: endpointUrl,
        });
    };

    const estimate = async () => {
        setFeeLoading(true);
        setLoading(false);
        setTransactionID(null);
        setDeploymentError(null);
        setDeploymentFeeEstimate("");
        messageApi.info(
            "Disclaimer: Fee estimation is experimental and may not represent a correct estimate on any current or future network",
        );
        if (!isCustomEndpointValid || !isCustomNetworkValid) {
            setDeploymentError("Invalid endpoint or network");
            setFeeLoading(false);
            return;
        }
        await postMessagePromise(worker, {
            type: "ALEO_ESTIMATE_DEPLOYMENT_FEE",
            program: programString(),
            url: endpointUrl,
        });
    };

    const onLoadProgram = async (value) => {
        if (value) {
            form.setFieldsValue({
                program: value,
            });
            await onProgramChange(value);
        }
    };

    const onUrlChange = (event) => {
        if (event.target.value !== null) {
            setDeployUrl(event.target.value);
        }
        return deployUrl;
    };

    const onProgramChange = (value) => {
        setProgram(value);
        setTransactionID(null);
        setDeploymentError(null);
        setDeploymentFeeEstimate("");
        return program;
    };

    const onDeploymentFeeRecordChange = (event) => {
        if (event.target.value !== null) {
            setDeploymentFeeRecord(event.target.value);
        }
        setTransactionID(null);
        setDeploymentError(null);
        setDeploymentFeeEstimate("");
        return deploymentFeeRecord;
    };

    const onPrivateKeyChange = (event) => {
        if (event.target.value !== null) {
            setPrivateKey(event.target.value);
        }
        setTransactionID(null);
        setDeploymentError(null);
        setDeploymentFeeEstimate("");
        return privateKey;
    };

    const handleDropdownSelect = (val) => {
        setPrivateKey(val);
        setTransactionID(null);
        setDeploymentError(null);
        setDeploymentFeeEstimate("");
    };

    const layout = { labelCol: { span: 5 }, wrapperCol: { span: 21 } };
    const privateKeyString = () => (privateKey !== null ? privateKey : "");
    const programString = () => (program !== null ? program : "");
    const feeRecordString = () =>
        deploymentFeeRecord !== null ? deploymentFeeRecord : "";
    const transactionIDString = () =>
        transactionID !== null ? transactionID : "";
    const deploymentErrorString = () =>
        deploymentError !== null ? deploymentError : "";
    const feeString = () => deploymentFeeEstimate ? deploymentFeeEstimate : "";

    return (
        <Card
            title="Deploy Program"
            style={{ width: "100%"}}
        >
            {contextHolder}
            <Form
                form={form}
                {...layout}>
                <Divider />
                <Form.Item
                    label="Program"
                    colon={false}
                    validateStatus={status}
                >
                    <CodeEditor
                        value={programString()}
                        onChange={onProgramChange}
                        language="aleo"
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
                <Form.Item
                    label="Fee Record"
                    colon={false}
                    validateStatus={status}
                >
                    <Input.TextArea
                        name="feeRecord"
                        size="small"
                        placeholder="Fee record"
                        allowClear
                        onChange={onDeploymentFeeRecordChange}
                        value={feeRecordString()}
                    />
                </Form.Item>
                <Form.Item
                    label="Private Fee"
                    name="private_fee"
                    valuePropName="checked"
                    initialValue={false}
                >
                    <Switch
                        checked={privateFee}
                        onChange={setPrivateFee}
                    />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button
                            type="primary"
                            size="middle"
                            onClick={deploy}
                            loading={loading}
                        >
                            Deploy
                        </Button>
                        <Button
                            size="middle"
                            onClick={estimate}
                            loading={feeLoading}
                        >
                            Estimate Fee
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
            {transactionID !== null && (
                <Form {...layout}>
                    <Divider />
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
            {deploymentError !== null && (
                <Result status="error" title="Error" subTitle={deploymentErrorString()} />
            )}
        </Card>
    );
};
