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
    Switch,
    Space,
} from "antd";
import { FormGenerator } from "../../components/InputForm";
import axios from "axios";
import { useAleoWASM } from "../../aleo-wasm-hook.js";
import { CodeEditor } from "./execute/CodeEditor.jsx";
import { useNetwork } from "../../NetworkContext";
import { KeyDropdown } from "../../components/KeyDropdown";
import { CopyButton } from "../../components/CopyButton";

export const ExecuteLegacy = () => {
    const [form] = Form.useForm();
    const [executionFeeRecord, setExecutionFeeRecord] = useState(null);
    const [executeUrl, setExecuteUrl] = useState("https://api.explorer.provable.com/v1");
    const [functionID, setFunctionID] = useState(null);
    const [executionFee, setExecutionFee] = useState("1");
    const [inputs, setInputs] = useState(null);
    const [feeLoading, setFeeLoading] = useState(false);
    const [privateFee, setPrivateFee] = useState(false);
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [privateKey, setPrivateKey] = useState(null);
    const [program, setProgram] = useState(null);
    const [programResponse, setProgramResponse] = useState(null);
    const [executionError, setExecutionError] = useState(null);
    const [programID, setProgramID] = useState(null);
    const [status, setStatus] = useState("");
    const [transactionID, setTransactionID] = useState(null);
    const [worker, setWorker] = useState(null);
    const [executeOnline, setExecuteOnline] = useState(false);
    const [programInputs, setProgramInputs] = useState(null);
    const [tip, setTip] = useState("Executing Program...");
    const { endpointUrl, networkString, isCustomEndpointValid, isCustomNetworkValid } = useNetwork();
    const [aleo] = useAleoWASM();

    const getProgramInputs = () => {
        const programManifest = [];
        if (program) {
            try {
                const aleoProgram = aleo.Program.fromString(program);
                const functions = aleoProgram.getFunctions();
                for (let i = 0; i < functions.length; i++) {
                    const functionManifest = { functionID: functions[i] };
                    try {
                        const functionInputs = aleoProgram.getFunctionInputs(
                            functions[i],
                        );
                        functionManifest["inputs"] = functionInputs;
                        programManifest.push(functionManifest);
                    } catch (e) {
                        console.error(e);
                    }
                }
                setProgramInputs(programManifest);
                return programManifest;
            } catch (e) {
                console.error(e);
            }
        }
    };

    function spawnWorker() {
        let worker = new Worker(
            new URL("../../workers/worker.js", import.meta.url),
            { type: "module" },
        );
        worker.addEventListener("message", (ev) => {
            if (ev.data.type == "OFFLINE_EXECUTION_COMPLETED") {
                setFeeLoading(false);
                setLoading(false);
                setTransactionID(null);
                setExecutionError(null);
                setProgramResponse(ev.data.outputs.outputs);
                setTip("Executing Program...");
            } else if (ev.data.type == "EXECUTION_TRANSACTION_COMPLETED") {
                const transactionId = ev.data.executeTransaction;
                setFeeLoading(false);
                setLoading(false);
                setProgramResponse(null);
                setExecutionError(null);
                setTip("Executing Program...");
                setTransactionID(transactionId);
            } else if (ev.data.type == "EXECUTION_FEE_ESTIMATION_COMPLETED") {
                let fee = ev.data.executionFee;
                setFeeLoading(false);
                setLoading(false);
                setProgramResponse(null);
                setExecutionError(null);
                setTransactionID(null);
                setTip("Executing Program...");
                setExecutionFee(fee.toString());
            } else if (ev.data.type == "ERROR") {
                setFeeLoading(false);
                setLoading(false);
                setProgramResponse(null);
                setTransactionID(null);
                setTip("Executing Program...");
                setExecutionError(ev.data.errorMessage);
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
                setExecutionError(error);
                setFeeLoading(false);
                setLoading(false);
                setProgramResponse(null);
                setTransactionID(null);
                setTip("Executing Program...");
                reject(error);
            };
            worker.postMessage(message);
        });
    }

    const execute = async () => {
        setFeeLoading(false);
        setLoading(true);
        setProgramResponse(null);
        setTransactionID(null);
        setExecutionError(null);
        setTip("Executing Program...");
        let functionInputs = [];
        try {
            if (inputs) {
                functionInputs = inputs.split(" ");
            }
        } catch (e) {
            setExecutionError("Inputs are not valid");
            setFeeLoading(false);
            setLoading(false);
            setTip("Executing Program...");
            return;
        }

        if (!isCustomEndpointValid || !isCustomNetworkValid) {
            setExecutionError("Invalid endpoint or network");
            setLoading(false);
            return;
        }

        if (executeOnline) {
            await postMessagePromise(worker, {
                type: "ALEO_EXECUTE_PROGRAM_ON_CHAIN",
                remoteProgram: programString(),
                aleoFunction: functionIDString(),
                inputs: functionInputs,
                privateKey: privateKeyString(),
                fee: feeAmount,
                feeRecord: feeRecordString(),
                url: endpointUrl,
            });
        } else {
            await postMessagePromise(worker, {
                type: "ALEO_EXECUTE_PROGRAM_LOCAL",
                localProgram: programString(),
                aleoFunction: functionIDString(),
                inputs: functionInputs,
                privateKey: privateKeyString(),
            });
        }
    };

    const estimate = async () => {
        setFeeLoading(true);
        setLoading(false);
        setProgramResponse(null);
        setTransactionID(null);
        setExecutionError(null);
        messageApi.info(
            "Disclaimer: Fee estimation is experimental and may not represent a correct estimate on any current or future network",
        );
        setTip("Estimating Execution Fee...");
        let functionInputs = [];
        try {
            if (inputs) {
                functionInputs = inputs.split(" ");
            }
        } catch (e) {
            setExecutionError("Inputs are not valid");
            setFeeLoading(false);
            setLoading(false);
            setTip("Executing Program...");
            return;
        }

        if (!isCustomEndpointValid || !isCustomNetworkValid) {
            setExecutionError("Invalid endpoint or network");
            setFeeLoading(false);
            return;
        }

        if (executeOnline) {
            await postMessagePromise(worker, {
                type: "ALEO_ESTIMATE_EXECUTION_FEE",
                remoteProgram: programString(),
                privateKey: privateKeyString(),
                aleoFunction: functionIDString(),
                inputs: functionInputs,
                url: endpointUrl,
            });
        }
    };

    const onUrlChange = (event) => {
        if (event.target.value !== null) {
            setExecuteUrl(event.target.value);
        }
        return executeUrl;
    };

    const onFunctionChange = (event) => {
        if (event.target.value !== null) {
            setFunctionID(event.target.value);
        }
        setTransactionID(null);
        setExecutionError(null);
        setProgramResponse(null);
        return functionID;
    };

    const onProgramChange = (value) => {
        setProgram(value);
        setTransactionID(null);
        setExecutionError(null);
        setProgramResponse(null);
        getProgramInputs();
        return program;
    };

    const onExecutionFeeChange = (event) => {
        if (event.target.value !== null) {
            setExecutionFee(event.target.value);
        }
        setTransactionID(null);
        setExecutionError(null);
        setProgramResponse(null);
        return executionFee;
    };

    const onExecutionFeeRecordChange = (event) => {
        if (event.target.value !== null) {
            setExecutionFeeRecord(event.target.value);
        }
        setTransactionID(null);
        setExecutionError(null);
        setProgramResponse(null);
        return executionFeeRecord;
    };

    const onInputsChange = (event) => {
        if (event.target.value !== null) {
            setInputs(event.target.value);
        }
        setTransactionID(null);
        setExecutionError(null);
        setProgramResponse(null);
        return inputs;
    };

    const onPrivateKeyChange = (event) => {
        if (event.target.value !== null) {
            setPrivateKey(event.target.value);
        }
        setTransactionID(null);
        setExecutionError(null);
        setProgramResponse(null);
        return privateKey;
    };

    const handleDropdownSelect = (val) => {
        setPrivateKey(val);
        setTransactionID(null);
        setExecutionError(null);
        setProgramResponse(null);
    };

    const onSearch = (value) => {
        setProgramID(null);
        setProgram(null);
        setTransactionID(null);
        setExecutionError(null);
        setProgramResponse(null);
        try {
            if (value) {
                axios
                    .get(`${endpointUrl}/${networkString}/program/${value}`)
                    .then((response) => {
                        setProgramID(value);
                        setProgram(response.data);
                        getProgramInputs();
                    })
                    .catch((error) => {
                        console.error(error);
                        setExecutionError("Program not found");
                    });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const layout = { labelCol: { span: 5 }, wrapperCol: { span: 21 } };
    const functionIDString = () => (functionID !== null ? functionID : "");
    const inputsString = () => (inputs !== null ? inputs : "");
    const privateKeyString = () => (privateKey !== null ? privateKey : "");
    const programString = () => (program !== null ? program : "");
    const programIDString = () => (programID !== null ? programID : "");
    const feeRecordString = () =>
        executionFeeRecord !== null ? executionFeeRecord : "";
    const transactionIDString = () =>
        transactionID !== null ? transactionID : "";
    const executionErrorString = () =>
        executionError !== null ? executionError : "";
    const outputString = () =>
        programResponse !== null ? programResponse.toString() : "";
    const feeString = () => (executionFee !== null ? executionFee : "");

    return (
        <Card
            title="Execute Program"
            style={{ width: "100%" }}
        >
            {contextHolder}
            <Form {...layout}>
                <Form.Item
                    label="Program ID"
                    colon={false}
                    validateStatus={status}
                >
                    <Input.Search
                        name="programID"
                        size="middle"
                        placeholder="Program ID"
                        allowClear
                        onSearch={onSearch}
                    />
                </Form.Item>
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
                    label="Function"
                    colon={false}
                    validateStatus={status}
                >
                    <Input
                        name="function"
                        size="middle"
                        placeholder="Function name"
                        allowClear
                        onChange={onFunctionChange}
                        value={functionIDString()}
                    />
                </Form.Item>
                <Form.Item
                    label="Inputs"
                    colon={false}
                    validateStatus={status}
                >
                    <Input
                        name="inputs"
                        size="middle"
                        placeholder="Space-separated inputs"
                        allowClear
                        onChange={onInputsChange}
                        value={inputsString()}
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
                    label="Execute Online"
                    name="execute_online"
                    valuePropName="checked"
                    initialValue={false}
                >
                    <Switch
                        checked={executeOnline}
                        onChange={setExecuteOnline}
                    />
                </Form.Item>
                {executeOnline && (
                    <>
                        <Form.Item
                            label="Fee"
                            colon={false}
                            validateStatus={status}
                        >
                            <Input
                                name="fee"
                                size="middle"
                                placeholder="Execution fee"
                                allowClear
                                onChange={onExecutionFeeChange}
                                value={feeString()}
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
                                onChange={onExecutionFeeRecordChange}
                                value={feeRecordString()}
                            />
                        </Form.Item>
                    </>
                )}
                <Form.Item>
                    <Space>
                        <Button
                            type="primary"
                            size="middle"
                            onClick={execute}
                            loading={loading}
                        >
                            Execute
                        </Button>
                        {executeOnline && (
                            <Button
                                size="middle"
                                onClick={estimate}
                                loading={feeLoading}
                            >
                                Estimate Fee
                            </Button>
                        )}
                    </Space>
                </Form.Item>
            </Form>
            {programResponse !== null && (
                <Form {...layout}>
                    <Form.Item
                        label="Output"
                        colon={false}
                    >
                        <Input.TextArea
                            size="large"
                            rows={4}
                            value={outputString()}
                            disabled
                            addonAfter={<CopyButton data={outputString()} />}
                        />
                    </Form.Item>
                </Form>
            )}
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
            {executionError !== null && (
                <Result status="error" title="Error" subTitle={executionErrorString()} />
            )}
        </Card>
    );
};
