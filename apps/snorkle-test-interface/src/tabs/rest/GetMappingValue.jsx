import {useMemo, useState} from "react";
import { Card, Divider, Form, Input, Result, Row, Col } from "antd";
import axios from "axios";
import { CopyButton } from "../../components/CopyButton";
import { useNetwork } from "../../NetworkContext";

export const GetMappingValue = () => {
    const [programID, setProgramID] = useState(null);
    const [mappingName, setMappingName] = useState(null);
    const [mappingKey, setMappingKey] = useState(null);
    const [mappingValue, setMappingValue] = useState(null);
    const [mappingError, setMappingError] = useState(null);
    const { endpointUrl, networkString } = useNetwork();

    const onProgramIDChange = (event) => {
        setProgramID(null);
        try {
            setProgramID(event.target.value);
        } catch (error) {
            console.error(error);
        }
    };

    const onMappingNameChange = (event) => {
        setMappingName(null);
        try {
            setMappingName(event.target.value);
        } catch (error) {
            console.error(error);
        }
    };
    const onMappingKeyChange = (event) => {
        setMappingKey(null);
        try {
            setMappingKey(event.target.value);
        } catch (error) {
            console.error(error);
        }
    };

    const mappingErrorString = useMemo(() => {
        return mappingError !== null ? mappingError : ""
    }, [mappingError]);

    const tryRequest = () => {
        setMappingError(null);
        if (programID && mappingName && mappingKey) {
            axios
                .get(
                    `${endpointUrl}/${networkString}/program/${programID}/mapping/${mappingName}/${mappingKey}`,
                )
                .then((response) => {
                    if (response.data === null) {
                        setMappingValue("Key Not Found");
                    } else {
                        setMappingValue(response.data);
                    }
                })
                .catch((error) => {
                    setMappingValue(null);
                    setMappingError(error.message || "API/network error");
                });
        } else {
            setMappingValue(null);
        }
    };

    const layout = { labelCol: { span: 4 }, wrapperCol: { span: 21 } };
    const programIDString = () => (programID !== null ? programID : "");
    const mappingNameString = () => (mappingName !== null ? mappingName : "");
    const mappingKeyString = () => (mappingKey !== null ? mappingKey : "");
    const mappingValueString = () =>
        mappingValue !== null ? mappingValue : "";

    return (
        <Card
            title="Get Mapping Value"
            style={{ width: "100%" }}
        >
            <Form {...layout}>
                <Form.Item label="Program ID" colon={false}>
                    <Input
                        name="programID"
                        size="large"
                        placeholder="Program ID"
                        value={programIDString()}
                        allowClear={true}
                        onChange={onProgramIDChange}
                    />
                </Form.Item>
                <Form.Item label="Mapping Name" colon={false}>
                    <Input
                        name="mappingName"
                        size="large"
                        placeholder="Name"
                        value={mappingNameString()}
                        allowClear={true}
                        onChange={onMappingNameChange}
                    />
                </Form.Item>
                <Form.Item label="Mapping Key" colon={false}>
                    <Input
                        name="mappingKey"
                        size="large"
                        placeholder="Key"
                        value={mappingKeyString()}
                        allowClear={true}
                        onChange={onMappingKeyChange}
                    />
                </Form.Item>
            </Form>
            <Row justify="center">
                <Col>
                    <Form.Item>
                        <button type="button" onClick={tryRequest} style={{ marginTop: 8, padding: '6px 16px', borderRadius: 6, background: '#18e48f', color: '#222', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Get Value</button>
                    </Form.Item>
                </Col>
            </Row>
            {mappingValue !== null && (
                <Form {...layout}>
                    <Divider />
                    <Row align="middle">
                        <Col span={23}>
                            <Form.Item label="Value" colon={false}>
                                <Input.TextArea
                                    size="large"
                                    rows={6}
                                    placeholder="Value"
                                    value={mappingValueString()}
                                    disabled
                                />
                            </Form.Item>
                        </Col>
                        <Col span={1} align="middle">
                            <CopyButton data={mappingValueString()} />
                        </Col>
                    </Row>
                </Form>
            )}
            {mappingError && (
                <Result status="error" title="Error" subTitle={mappingErrorString} />
            )}
        </Card>
    );
};
