import {useMemo, useState} from "react";
import { Card, Divider, Form, Input, Row, Col, Typography } from "antd";
import axios from "axios";
import { CopyButton } from "../../components/CopyButton.jsx";
import { useAleoWASM } from "../../aleo-wasm-hook.js";
import { CodeEditor } from "../develop/execute/CodeEditor.jsx";
import { useNetwork } from "../../NetworkContext";

export const GetTransaction = () => {
    const [transaction, setTransaction] = useState(null);
    const [status, setStatus] = useState("");
    const [parsedTransaction, setParsedTransaction] = useState(null);
    const [recordsString, setRecordsString] = useState("");
    const [verifyingKeys, setVerifyingKeys] = useState([]);
    const [baseFee, setBaseFee] = useState("");
    const [totalFee, setTotalFee] = useState("");
    const [priorityFee, setPriorityFee] = useState("");
    const [wasm] = useAleoWASM();
    const [transitionOutputs, setTransitionOutputs] = useState([]);
    const [transactionType, setTransactionType] = useState("");
    const [deployedProgram, setDeployedProgram] = useState("");
    const { endpointUrl, networkString, isCustomEndpointValid, isCustomNetworkValid } = useNetwork();

    const tryParseTransaction = (txData) => {
        setTransaction(JSON.stringify(txData, null, 2));
        try {
            const parsed = wasm.Transaction.fromString(JSON.stringify(txData));
            setParsedTransaction(parsed);
            setTransactionType(parsed.transactionType());
            try {
                const program = parsed.deployedProgram();
                setDeployedProgram(program ? program.toString() : "");
            } catch (error) {
                setDeployedProgram("");
            }
            const records = parsed.records();
            if (Array.isArray(records)) {
                const formattedRecords = records
                    .map(record => record.record.toString())
                    .join('\n');
                setRecordsString(formattedRecords);
            } else {
                setRecordsString(records.toString());
            }
            const vKeys = parsed.verifyingKeys();
            if (Array.isArray(vKeys)) {
                setVerifyingKeys(vKeys.map(key => ({
                    program: key.program,
                    function: key.function,
                    verifyingKey: key.verifyingKey,
                    certificate: key.certificate
                })));
            } else {
                setVerifyingKeys([]);
            }
            setBaseFee(parsed.baseFeeAmount().toString());
            setPriorityFee(parsed.priorityFeeAmount().toString());
            setTotalFee(parsed.feeAmount().toString());
            const transitions = parsed.transitions();
            const outputs = transitions.map((transition, index) => {
                const transitionOutputs = transition.outputs();
                const transitionInputs = transition.inputs();
                return {
                    transitionIndex: index,
                    programId: transition.programId(),
                    functionName: transition.functionName(),
                    inputs: transitionInputs.map(input => ({
                        type: input.type,
                        id: input.id?.toString() || '',
                        tag: input.tag?.toString() || '',
                        value: input.value?.toString() || ''
                    })),
                    outputs: transitionOutputs.map(output => ({
                        type: output.type,
                        id: output.id?.toString() || '',
                        value: output.value?.toString() || '',
                        checksum: output.checksum?.toString() || '',
                        program: output.program || '',
                        function: output.function || '',
                        arguments: output.arguments?.map(arg => 
                            arg.toString()
                        ) || []
                    }))
                };
            });
            setTransitionOutputs(outputs);
            setStatus("success");
        } catch (error) {
            console.error("Error parsing transaction:", error);
            setStatus("error");
        }
    };

    const tryRequest = (id) => {
        setTransaction(null);
        setParsedTransaction(null);
        setRecordsString("");
        setVerifyingKeys([]);
        setBaseFee("");
        setTotalFee("");
        setPriorityFee("");
        setTransitionOutputs([]);
        setTransactionType("");
        setDeployedProgram("");
        try {
            if (!isCustomEndpointValid || !isCustomNetworkValid) {
                setStatus("error");
                setTransaction("Invalid endpoint or network");
                return;
            }
            if (id) {
                axios
                    .get(`${endpointUrl}/${networkString}/transaction/${id}`)
                    .then((response) => {
                        tryParseTransaction(response.data);
                    })
                    .catch((error) => {
                        console.error(error);
                        setStatus("error");
                    });
            } else {
                setStatus("");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const layout = { labelCol: { span: 4 }, wrapperCol: { span: 21 }, style: { marginBottom: '24px' } };

    const transactionString = useMemo(() => {
        return transaction !== null ? transaction.toString() : ""
    }, [transaction]);

    return (
        <Card
            title="Get Transaction"
            style={{ width: "100%" }}
        >
            <Form {...layout}>
                <Form.Item
                    label="Transaction ID"
                    colon={false}
                    validateStatus={status}
                >
                    <Input.Search
                        name="id"
                        size="large"
                        placeholder="Transaction ID"
                        allowClear
                        onSearch={tryRequest}
                    />
                </Form.Item>
            </Form>
            {transaction !== null && (
                <Form {...layout}>
                    <Divider />
                    {transactionType && (
                        <Form.Item 
                            label={<span style={{ whiteSpace: 'nowrap' }}>Type</span>}
                            colon={false}
                        >
                            <Input
                                size="large"
                                value={transactionType}
                                disabled
                                addonAfter={<CopyButton data={transactionType} />}
                            />
                        </Form.Item>
                    )}
                    <Form.Item 
                        label={<span style={{ whiteSpace: 'nowrap' }}>Transaction</span>}
                        colon={false}
                    >
                        <Input.TextArea
                            size="large"
                            rows={6}
                            placeholder="Transaction"
                            value={transactionString}
                            disabled
                            addonAfter={<CopyButton data={transactionString} />}
                        />
                    </Form.Item>
                    {parsedTransaction && (
                        <>
                            {recordsString && (
                                <Form.Item 
                                    label={<span style={{ whiteSpace: 'nowrap' }}>Records</span>}
                                    colon={false}
                                >
                                    <Input.TextArea
                                        size="large"
                                        rows={4}
                                        value={recordsString}
                                        disabled
                                        addonAfter={<CopyButton data={recordsString} />}
                                    />
                                </Form.Item>
                            )}
                            <Form.Item 
                                label={<span style={{ whiteSpace: 'nowrap' }}>Fees</span>}
                                colon={false}
                                style={{ marginBottom: '24px' }}
                            >
                                <Row gutter={[16, 16]} align="middle">
                                    <Col span={8}>
                                        <Card 
                                            size="small" 
                                            style={{ textAlign: 'center' }}
                                        >
                                            <Typography.Text type="secondary">
                                                Base Fee
                                            </Typography.Text>
                                            <div style={{ margin: '8px 0' }}>
                                                {baseFee || '0'}
                                            </div>
                                            <CopyButton data={baseFee} />
                                        </Card>
                                    </Col>
                                    <Col span={8}>
                                        <Card 
                                            size="small" 
                                            style={{ textAlign: 'center' }}
                                        >
                                            <Typography.Text type="secondary">
                                                Priority Fee
                                            </Typography.Text>
                                            <div style={{ margin: '8px 0' }}>
                                                {priorityFee || '0'}
                                            </div>
                                            <CopyButton data={priorityFee} />
                                        </Card>
                                    </Col>
                                    <Col span={8}>
                                        <Card 
                                            size="small" 
                                            style={{ textAlign: 'center' }}
                                        >
                                            <Typography.Text type="secondary">
                                                Total Fee
                                            </Typography.Text>
                                            <div style={{ margin: '8px 0' }}>
                                                {totalFee || '0'}
                                            </div>
                                            <CopyButton data={totalFee} />
                                        </Card>
                                    </Col>
                                </Row>
                            </Form.Item>
                            {deployedProgram && (
                                <Form.Item 
                                    label={<span style={{ whiteSpace: 'nowrap' }}>Program</span>}
                                    colon={false}
                                >
                                    <CodeEditor
                                        value={deployedProgram}
                                        language="leo"
                                        readOnly={true}
                                        height="300px"
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            )}
                            {verifyingKeys.length > 0 && (
                                <Form.Item 
                                    label={<span style={{ whiteSpace: 'nowrap' }}>Verifying Keys</span>}
                                    colon={false}
                                >
                                    {verifyingKeys.map((key, index) => (
                                        <Card
                                            key={index}
                                            size="small"
                                            style={{ marginBottom: '12px' }}
                                            title={
                                                <Row justify="space-between" align="middle">
                                                    <Col>
                                                        <Typography.Text strong>
                                                            Verifying Key {index + 1}
                                                        </Typography.Text>
                                                    </Col>
                                                    <Col>
                                                        <CopyButton 
                                                            data={JSON.stringify(key, null, 2)} 
                                                            style={{ marginLeft: '8px' }}
                                                        />
                                                    </Col>
                                                </Row>
                                            }
                                        >
                                            <Row gutter={[16, 16]}>
                                                <Col span={12}>
                                                    <Typography.Text type="secondary">Program:</Typography.Text>
                                                    <Input
                                                        value={key.program}
                                                        disabled
                                                        style={{ marginTop: '4px' }}
                                                    />
                                                </Col>
                                                <Col span={12}>
                                                    <Typography.Text type="secondary">Function:</Typography.Text>
                                                    <Input
                                                        value={key.function}
                                                        disabled
                                                        style={{ marginTop: '4px' }}
                                                    />
                                                </Col>
                                                <Col span={24}>
                                                    <Typography.Text type="secondary">Verifying Key:</Typography.Text>
                                                    <Input.TextArea
                                                        value={key.verifyingKey}
                                                        disabled
                                                        rows={2}
                                                        style={{ marginTop: '4px' }}
                                                    />
                                                </Col>
                                                <Col span={24}>
                                                    <Typography.Text type="secondary">Certificate:</Typography.Text>
                                                    <Input.TextArea
                                                        value={key.certificate}
                                                        disabled
                                                        rows={2}
                                                        style={{ marginTop: '4px' }}
                                                    />
                                                </Col>
                                            </Row>
                                        </Card>
                                    ))}
                                </Form.Item>
                            )}
                            {transitionOutputs.length > 0 && (
                                <Form.Item 
                                    label={<span style={{ whiteSpace: 'nowrap' }}>Transitions</span>}
                                    colon={false}
                                >
                                    {transitionOutputs.map((transition, transitionIndex) => (
                                        <Card
                                            key={transitionIndex}
                                            size="small"
                                            style={{ marginBottom: '12px' }}
                                            title={
                                                <Row justify="space-between" align="middle">
                                                    <Col>
                                                        <Typography.Text strong>
                                                            Transition {transition.transitionIndex + 1}
                                                        </Typography.Text>
                                                    </Col>
                                                    <Col>
                                                        <CopyButton 
                                                            data={JSON.stringify(transition, null, 2)} 
                                                            style={{ marginLeft: '8px' }}
                                                        />
                                                    </Col>
                                                </Row>
                                            }
                                        >
                                            <Row gutter={[16, 16]}>
                                                <Col span={12}>
                                                    <Typography.Text type="secondary">Program ID:</Typography.Text>
                                                    <Input
                                                        value={transition.programId}
                                                        disabled
                                                        style={{ marginTop: '4px' }}
                                                    />
                                                </Col>
                                                <Col span={12}>
                                                    <Typography.Text type="secondary">Function Name:</Typography.Text>
                                                    <Input
                                                        value={transition.functionName}
                                                        disabled
                                                        style={{ marginTop: '4px' }}
                                                    />
                                                </Col>
                                            </Row>
                                            {transition.inputs.map((input, inputIndex) => (
                                                <Card
                                                    key={inputIndex}
                                                    size="small"
                                                    style={{ marginTop: '16px', marginBottom: '8px' }}
                                                    title={
                                                        <Row justify="space-between" align="middle">
                                                            <Col>
                                                                <Typography.Text>
                                                                    Input {inputIndex + 1}
                                                                </Typography.Text>
                                                            </Col>
                                                            <Col>
                                                                <CopyButton 
                                                                    data={JSON.stringify(input, null, 2)} 
                                                                    style={{ marginLeft: '8px' }}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    }
                                                >
                                                    <Row gutter={[16, 16]}>
                                                        <Col span={12}>
                                                            <Typography.Text type="secondary">Type:</Typography.Text>
                                                            <Input
                                                                value={input.type}
                                                                disabled
                                                                style={{ marginTop: '4px' }}
                                                            />
                                                        </Col>
                                                        <Col span={12}>
                                                            <Typography.Text type="secondary">ID:</Typography.Text>
                                                            <Input
                                                                value={input.id}
                                                                disabled
                                                                style={{ marginTop: '4px' }}
                                                            />
                                                        </Col>
                                                        {input.tag && (
                                                            <Col span={24}>
                                                                <Typography.Text type="secondary">Tag:</Typography.Text>
                                                                <Input
                                                                    value={input.tag}
                                                                    disabled
                                                                    style={{ marginTop: '4px' }}
                                                                />
                                                            </Col>
                                                        )}
                                                        {input.value && (
                                                            <Col span={24}>
                                                                <Typography.Text type="secondary">Value:</Typography.Text>
                                                                <Input.TextArea
                                                                    value={input.value}
                                                                    disabled
                                                                    rows={2}
                                                                    style={{ marginTop: '4px' }}
                                                                />
                                                            </Col>
                                                        )}
                                                    </Row>
                                                </Card>
                                            ))}
                                            {transition.outputs.map((output, outputIndex) => (
                                                <Card
                                                    key={outputIndex}
                                                    size="small"
                                                    style={{ marginTop: '16px', marginBottom: '8px' }}
                                                    title={
                                                        <Row justify="space-between" align="middle">
                                                            <Col>
                                                                <Typography.Text>
                                                                    Output {outputIndex + 1}
                                                                </Typography.Text>
                                                            </Col>
                                                            <Col>
                                                                <CopyButton 
                                                                    data={JSON.stringify(output, null, 2)} 
                                                                    style={{ marginLeft: '8px' }}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    }
                                                >
                                                    <Row gutter={[16, 16]}>
                                                        <Col span={12}>
                                                            <Typography.Text type="secondary">Type:</Typography.Text>
                                                            <Input
                                                                value={output.type}
                                                                disabled
                                                                style={{ marginTop: '4px' }}
                                                            />
                                                        </Col>
                                                        <Col span={12}>
                                                            <Typography.Text type="secondary">ID:</Typography.Text>
                                                            <Input
                                                                value={output.id}
                                                                disabled
                                                                style={{ marginTop: '4px' }}
                                                            />
                                                        </Col>
                                                        {output.value && (
                                                            <Col span={24}>
                                                                <Typography.Text type="secondary">Value:</Typography.Text>
                                                                <Input.TextArea
                                                                    value={output.value}
                                                                    disabled
                                                                    rows={2}
                                                                    style={{ marginTop: '4px' }}
                                                                />
                                                            </Col>
                                                        )}
                                                        {output.checksum && (
                                                            <Col span={24}>
                                                                <Typography.Text type="secondary">Checksum:</Typography.Text>
                                                                <Input
                                                                    value={output.checksum}
                                                                    disabled
                                                                    style={{ marginTop: '4px' }}
                                                                />
                                                            </Col>
                                                        )}
                                                        {output.program && (
                                                            <Col span={12}>
                                                                <Typography.Text type="secondary">Program:</Typography.Text>
                                                                <Input
                                                                    value={output.program}
                                                                    disabled
                                                                    style={{ marginTop: '4px' }}
                                                                />
                                                            </Col>
                                                        )}
                                                        {output.function && (
                                                            <Col span={12}>
                                                                <Typography.Text type="secondary">Function:</Typography.Text>
                                                                <Input
                                                                    value={output.function}
                                                                    disabled
                                                                    style={{ marginTop: '4px' }}
                                                                />
                                                            </Col>
                                                        )}
                                                        {output.arguments && output.arguments.length > 0 && (
                                                            <Col span={24}>
                                                                <Typography.Text type="secondary">
                                                                    Arguments:
                                                                </Typography.Text>
                                                                <div style={{ marginTop: '4px' }}>
                                                                    {output.arguments.map((arg, argIndex) => (
                                                                        <div 
                                                                            key={argIndex}
                                                                            style={{ 
                                                                                marginBottom: argIndex < output.arguments.length - 1 ? '8px' : 0 
                                                                            }}
                                                                        >
                                                                            <Input
                                                                                addonBefore={`Arg ${argIndex + 1}`}
                                                                                value={arg}
                                                                                disabled
                                                                                addonAfter={
                                                                                    <CopyButton 
                                                                                        data={arg} 
                                                                                        style={{ border: 'none', background: 'none' }}
                                                                                    />
                                                                                }
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </Col>
                                                        )}
                                                    </Row>
                                                </Card>
                                            ))}
                                        </Card>
                                    ))}
                                </Form.Item>
                            )}
                        </>
                    )}
                </Form>
            )}
        </Card>
    );
};
