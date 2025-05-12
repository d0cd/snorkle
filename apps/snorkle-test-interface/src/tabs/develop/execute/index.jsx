import {
    Alert,
    Button,
    Card,
    Collapse,
    Divider,
    Empty,
    Form,
    Input,
    Modal,
    Result,
    Select,
    Skeleton,
    Switch,
    Space,
    message,
} from "antd";
import { LoadProgram } from "./LoadProgram.jsx";
import { CodeEditor } from "./CodeEditor.jsx";
import { useAleoWASM } from "../../../aleo-wasm-hook";
import { useEffect, useState } from "react";
import { KeyDropdown } from "../../../components/KeyDropdown";
import { CopyButton } from "../../../components/CopyButton";
import { useNetwork } from "../../../NetworkContext";
import axios from "axios";

const layout = { labelCol: { span: 5 }, wrapperCol: { span: 18 } };

export const Execute = () => {
    const [form] = Form.useForm();
    const [functions, setFunctions] = useState([]);
    const [aleoWASM] = useAleoWASM();
    const [modalOpen, setModalModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalResult, setModalResult] = useState({
        status: "warning",
        subTitle: "Sorry, something went wrong.",
    });
    const [feeLoading, setFeeLoading] = useState(false);
    const [programValue, setProgramValue] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState("");
    const { endpointUrl, networkString } = useNetwork();
    const [messageApi, contextHolder] = message.useMessage();
    const [selectedFunction, setSelectedFunction] = useState(null);
    const [functionInputs, setFunctionInputs] = useState([]);

    const handleOk = () => {
        setModalModalOpen(false);
    };

    const parseProgram = async (value) => {
        setFunctions([]);
        setSelectedFunction(null);
        setFunctionInputs([]);
        try {
            const program = await aleoWASM.Program.fromString(value);
            const functionNames = program.getFunctions();
            const functionItems = functionNames.map((func) => {
                return {
                    name: func,
                    inputs: program.getFunctionInputs(func),
                };
            });
            setFunctions(functionItems);
            if (functionItems.length > 0) {
                setSelectedFunction(functionItems[0].name);
                setFunctionInputs(functionItems[0].inputs);
            }
        } catch (e) {
            setFunctions([]);
            setSelectedFunction(null);
            setFunctionInputs([]);
        }
    };

    const onProgramChange = async (value) => {
        setProgramValue(value);
        setSearchError("");
        await parseProgram(value);
    };

    const onSearch = async (programId) => {
        setSearchLoading(true);
        setSearchError("");
        try {
            const url = `${endpointUrl}/${networkString}/program/${programId}`;
            const response = await axios.get(url);
            setProgramValue(response.data);
            form.setFieldValue("program", response.data);
            await parseProgram(response.data);
        } catch (error) {
            setSearchError("Program not found on network");
            messageApi.error("Program not found on network");
        } finally {
            setSearchLoading(false);
        }
    };

    const onFunctionSelect = (funcName) => {
        setSelectedFunction(funcName);
        const func = functions.find((f) => f.name === funcName);
        setFunctionInputs(func ? func.inputs : []);
        form.resetFields(["inputs", "private_key"]);
    };

    const renderInputFields = () => {
        if (!functionInputs || functionInputs.length === 0) return null;
        return functionInputs.map((input, idx) => (
            <Form.Item
                key={idx}
                name={["inputs", idx]}
                label={input.name || input.register || `Input ${idx + 1}`}
                rules={[{ required: true, message: "Required" }]}
            >
                <Input placeholder={input.type} />
            </Form.Item>
        ));
    };

    const getInputString = (inputsArr) => {
        if (!Array.isArray(inputsArr)) return "";
        return inputsArr.join(" ");
    };

    const onFinish = (values) => {
        setLoading(true);
        setModalModalOpen(true);
        setModalResult({
            status: "warning",
            subTitle: "Executing program...",
        });
        try {
            const result = aleoWASM.executeProgram(
                programValue,
                selectedFunction,
                values.private_key,
                getInputString(values.inputs)
            );
            setModalResult({
                status: "success",
                subTitle: "Program executed successfully!",
                result: result,
            });
        } catch (e) {
            setModalResult({
                status: "error",
                subTitle: "Error executing program: " + e.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const onEstimateFee = async () => {
        setFeeLoading(true);
        setModalModalOpen(true);
        try {
            const values = form.getFieldsValue();
            const fee = aleoWASM.estimateExecutionFee(
                programValue,
                selectedFunction,
                values.private_key,
                getInputString(values.inputs)
            );
            setModalResult({
                status: "success",
                subTitle: "Fee estimated successfully!",
                result: fee,
            });
        } catch (e) {
            setModalResult({
                status: "error",
                subTitle: "Error estimating fee: " + e.message,
            });
        } finally {
            setFeeLoading(false);
        }
    };

    return (
        <Card title="Execute Program">
            {contextHolder}
            <Form layout="vertical">
                <Form.Item label="Program Search" help="Search for a program by ID on the current network.">
                    <Input.Search
                        placeholder="Enter program ID and search"
                        enterButton="Search"
                        loading={searchLoading}
                        onSearch={onSearch}
                        allowClear
                    />
                </Form.Item>
                {searchError && (
                    <Alert message={searchError} type="error" showIcon style={{ marginBottom: 16 }} />
                )}
            </Form>
            <Divider />
            <div style={{ maxHeight: 240, overflow: "auto", marginBottom: 16, borderRadius: 6, border: "1px solid #222" }}>
                <CodeEditor
                    value={programValue}
                    onChange={onProgramChange}
                    language="aleo"
                    options={{ readOnly: true }}
                />
            </div>
            {functions.length > 0 && (
                <>
                    <Form layout="vertical">
                        <Form.Item label="Function">
                            <Select
                                value={selectedFunction}
                                onChange={onFunctionSelect}
                                options={functions.map((f) => ({ label: f.name, value: f.name }))}
                                style={{ width: 320 }}
                            />
                        </Form.Item>
                    </Form>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        style={{ maxWidth: 480 }}
                    >
                        {renderInputFields()}
                        <Form.Item
                            name="private_key"
                            label="Private Key"
                            rules={[{ required: true, message: "Please input your private key!" }]}
                        >
                            <Input
                                placeholder="Private key"
                                addonAfter={<KeyDropdown type="privateKey" onSelect={(val) => form.setFieldValue("private_key", val)} />}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Space>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                >
                                    Execute
                                </Button>
                                <Button
                                    onClick={onEstimateFee}
                                    loading={feeLoading}
                                >
                                    Estimate Fee
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </>
            )}
            <Modal
                title="Execution Result"
                open={modalOpen}
                onOk={handleOk}
                onCancel={handleOk}
                footer={[
                    <Button key="ok" type="primary" onClick={handleOk}>
                        OK
                    </Button>,
                ]}
            >
                <p>{modalResult.subTitle}</p>
                {modalResult.result && (
                    <Input.TextArea
                        value={modalResult.result}
                        rows={4}
                        disabled
                        addonAfter={<CopyButton data={modalResult.result} />}
                    />
                )}
            </Modal>
        </Card>
    );
};

const renderInput = (input, inputIndex, nameArray = []) => {
    if (input.members) {
        const members = input.members;
        return (
            <div key={inputIndex}>
                <Divider orientation="left" dashed plain>
                    {input.struct_id} {input.name || input.register}:
                </Divider>
                {members.map((member, memberIndex) =>
                    renderInput(
                        member,
                        memberIndex,
                        [].concat(nameArray).concat(input.name || inputIndex)
                    )
                )}
            </div>
        );
    } else {
        return (
            <Form.Item
                key={inputIndex}
                label={input.name ? input.name : input.register}
                name={[].concat(nameArray).concat(input.name || inputIndex)}
                rules={[{ required: true, message: "Please input a value" }]}
            >
                <Input placeholder={`${input.type}`} />
            </Form.Item>
        );
    }
};
