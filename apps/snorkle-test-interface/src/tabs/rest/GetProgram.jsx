import {useMemo, useState} from "react";
import { Card, Divider, Form, Input, Row, Col, Button } from "antd";
import axios from "axios";
import { CopyButton } from "../../components/CopyButton";
import { useNetwork } from "../../NetworkContext";

export const GetProgram = () => {
    const [program, setProgram] = useState(null);
    const [programID, setProgramID] = useState(null);
    const [status, setStatus] = useState("");
    const { endpointUrl, networkString } = useNetwork();

    // Returns the program id if the user changes it or the "Demo" button is clicked.
    const onChange = (event) => {
        if (event.target.value !== null) {
            setProgramID(event.target.value);
        }
        return programID;
    };

    // Calls `tryRequest` when the search bar input is entered.
    const onSearch = (value) => {
        try {
            tryRequest(value);
        } catch (error) {
            console.error(error);
        }
    };

    // Attempts to request the program bytecode with the given program id.
    const tryRequest = (id) => {
        setProgramID(id);
        axios
            .get(`${endpointUrl}/${networkString}/program/${id}`)
            .then((response) => {
                setStatus("success");
                setProgram(response.data);
            })
            .catch((error) => {
                setProgram(error.message || "API/network error");
                setStatus("error");
            });
    };

    const layout = { labelCol: { span: 4 }, wrapperCol: { span: 21 } };

    const programString = useMemo(() => {
        return program !== null ? program : ""
    }, [program]);

    const programIDString = useMemo(() => {
        return programID !== null ? programID : ""
    }, [programID])

    return (
        <Card
            title="Get Program"
            style={{ width: "100%" }}
        >
            <Form {...layout}>
                <Form.Item
                    label="Program ID"
                    colon={false}
                    validateStatus={status}
                >
                    <Input.Search
                        name="id"
                        size="large"
                        placeholder="Program ID"
                        allowClear
                        onSearch={onSearch}
                        onChange={onChange}
                        value={programIDString}
                    />
                </Form.Item>
            </Form>
            {program !== null && (
                <Form {...layout}>
                    <Divider />
                    <Row align="middle">
                        <Col span={23}>
                            <Form.Item label="Program" colon={false}>
                                <Input.TextArea
                                    size="large"
                                    rows={15}
                                    placeholder="Program"
                                    value={programString}
                                    disabled
                                />
                            </Form.Item>
                        </Col>
                        <Col span={1} align="middle">
                            <CopyButton data={programString} />
                        </Col>
                    </Row>
                </Form>
            )}
        </Card>
    );
};
