import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    FormControl,
    FormHelperText,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Skeleton,
    Stack,
    Switch,
    TextField,
    Typography,
    useTheme,
    InputAdornment
} from "@mui/material";
import { ContentCopy as ContentCopyIcon } from "@mui/icons-material";
import { LoadProgram } from "./LoadProgram.jsx";
import { CodeEditor } from "./CodeEditor.jsx";
import { useAleoWASM } from "../../aleo-wasm-hook";
import { useKeyVault } from "../../contexts/KeyVaultContext";
import { ManageKeysModal } from "../../components/ManageKeysModal";
import { useEffect, useState } from "react";
import { useTransactionHistory } from "../../contexts/TransactionHistoryContext";

export const Execute = () => {
    const [formValues, setFormValues] = useState({});
    const [aleoWASM] = useAleoWASM();
    const { keys } = useKeyVault();
    const { addTransaction } = useTransactionHistory();
    const theme = useTheme();
    const [manageKeysOpen, setManageKeysOpen] = useState(false);

    const demoSelect = async (value) => {
        if (value === "hello") {
            await onLoadProgram(
                "program hello_hello.aleo;\n" +
                    "\n" +
                    "function hello:\n" +
                    "    input r0 as u32.public;\n" +
                    "    input r1 as u32.private;\n" +
                    "    add r0 r1 into r2;\n" +
                    "    output r2 as u32.private;\n"
            );
            setFormValues(prev => ({
                ...prev,
                manual_input: true,
                functionName: "hello",
                inputs: JSON.stringify(["5u32", "5u32"])
            }));
        }
    };

    const [worker, setWorker] = useState(null);

    useEffect(() => {
        if (worker === null) {
            const spawnedWorker = spawnWorker();
            setWorker(spawnedWorker);
            return () => {
                spawnedWorker.terminate();
            };
        }
    }, []);

    const execute = async (values) => {
        setModalModalOpen(true);
        setLoading(true);
        try {
            const {
                program,
                functionName,
                inputs,
                private_key,
                priorityFee,
                private_fee,
                fee_record,
                peer_url,
                execute_onchain,
            } = values;

            if (execute_onchain) {
                await postMessagePromise(worker, {
                    type: "ALEO_EXECUTE_PROGRAM_ON_CHAIN",
                    remoteProgram: program,
                    aleoFunction: functionName,
                    inputs: JSON.parse(inputs),
                    privateKey: private_key,
                    fee: priorityFee,
                    privateFee: private_fee,
                    feeRecord: fee_record,
                    url: peer_url,
                });
            } else {
                await postMessagePromise(worker, {
                    type: "ALEO_EXECUTE_PROGRAM_LOCAL",
                    localProgram: program,
                    aleoFunction: functionName,
                    inputs: JSON.parse(inputs),
                    privateKey: private_key,
                });
            }

            // After successful execution, add to history
            const selectedKey = keys.find(k => k.id === values.selectedKeyId);
            addTransaction({
                type: 'execute',
                transactionId: response.transactionId,
                privateKey: selectedKey.privateKey,
                functionName: functionName,
                additionalData: {
                    inputs: inputs,
                    programId: program,
                    // Add any other relevant data
                }
            });
        } catch (error) {
            setLoading(false);
            setModalResult({
                status: "error",
                title: "Function Execution Error",
                subTitle: `Error: ${error || "Something went wrong..."}`,
            });
        }
    };

    function postMessagePromise(worker, message) {
        return new Promise((resolve, reject) => {
            worker.onmessage = (event) => {
                resolve(event.data);
            };
            worker.onerror = (error) => {
                reject(error);
            };
            worker.postMessage(message);
        });
    }

    function spawnWorker() {
        let worker = new Worker(
            new URL("../../../workers/worker.js", import.meta.url),
            { type: "module" }
        );
        worker.addEventListener("message", (ev) => {
            if (ev.data.type == "OFFLINE_EXECUTION_COMPLETED") {
                setLoading(false);
                setModalResult({
                    title: "Execution Successsful!",
                    status: "success",
                    subTitle: `Outputs: ${ev.data.outputs.outputs}`,
                });
            } else if (ev.data.type == "EXECUTION_TRANSACTION_COMPLETED") {
                const transactionId = ev.data.executeTransaction;
                setLoading(false);
                setModalResult({
                    title: "On-Chain Execution Successsful!",
                    status: "success",
                    subTitle: `Transaction ID: ${transactionId}`,
                });
            } else if (ev.data.type == "ERROR") {
                setLoading(false);
                setModalResult({
                    status: "error",
                    title: "Function Execution Error",
                    subTitle: `Error: ${
                        ev.data.errorMessage || "Something went wrong..."
                    }`,
                });
            }
        });
        return worker;
    }

    const [functions, setFunctions] = useState([]);
    const [functionInputs, setFunctionInputs] = useState({});

    const onLoadProgram = async (value) => {
        if (value) {
            setFormValues(prev => ({
                ...prev,
                program: value
            }));
            await onProgramChange(value);
        }
    };

    const onProgramEdit = async (value) => {
        await onProgramChange(value);
    };

    const onProgramChange = async (value) => {
        let processedProgram;
        try {
            console.log('Raw program value:', value);
            // Clean the program string
            const cleanProgram = value
                ? (value.startsWith('"') && value.endsWith('"') 
                    ? value.slice(1, -1) 
                    : value)
                    .replace(/\\n/g, '\n')
                    .replace(/\\r/g, '\r')
                : '';
            console.log('Cleaned program:', cleanProgram);
            
            processedProgram = await aleoWASM.Program.fromString(cleanProgram);
            console.log('Processed program:', processedProgram);
            
            const functionNames = processedProgram.getFunctions();
            console.log('Found functions:', functionNames);
            
            // Store function inputs separately
            const inputs = {};
            functionNames.forEach(func => {
                inputs[func] = processedProgram.getFunctionInputs(func);
            });
            setFunctionInputs(inputs);
            
            const functionItems = functionNames.map(func => ({
                key: func,
                label: func
            }));
            setFunctions(functionItems);
        } catch (e) {
            console.error('Error processing program:', e);
            setFunctions([]);
            setFunctionInputs({});
            return;
        }
    };

    const [modalOpen, setModalModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalResult, setModalResult] = useState({
        status: "warning",
        subTitle: "Sorry, something went wrong.",
    });
    const handleOk = () => {
        setModalModalOpen(false);
    };

    const generateKey = () => {
        setFormValues(prev => ({
            ...prev,
            private_key: new aleoWASM.PrivateKey().to_string()
        }));
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    const renderInput = (input, inputIndex, nameArray = []) => {
        const inputName = nameArray.join("_");
        const inputType = input.type;
        const inputVisibility = input.visibility;

        return (
            <Grid item xs={12} key={inputIndex}>
                <TextField
                    fullWidth
                    label={`Input ${inputIndex + 1} (${inputType}.${inputVisibility})`}
                    value={formValues[inputName] || ""}
                    onChange={(e) => setFormValues(prev => ({
                        ...prev,
                        [inputName]: e.target.value
                    }))}
                    placeholder={`Enter ${inputType} value`}
                />
            </Grid>
        );
    };

    const executeForm = () => {
        const selectedFunction = formValues.functionName;
        const inputs = functionInputs[selectedFunction] || [];

        if (keys.length === 0) {
            return (
                <Box sx={{ p: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        No accounts found. Please add an account to execute the program.
                    </Alert>
                    <Button
                        variant="contained"
                        onClick={() => setManageKeysOpen(true)}
                    >
                        Add Account
                    </Button>
                </Box>
            );
        }

        return (
            <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Function</InputLabel>
                            <Select
                                value={selectedFunction || ''}
                                label="Function"
                                onChange={(e) => setFormValues(prev => ({
                                    ...prev,
                                    functionName: e.target.value
                                }))}
                            >
                                {functions.map((f) => (
                                    <MenuItem key={f.key} value={f.key}>
                                        {f.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Select Account</InputLabel>
                            <Select
                                value={formValues.selectedKeyId || ''}
                                label="Select Account"
                                onChange={(e) => {
                                    const selectedKey = keys.find(k => k.id === e.target.value);
                                    setFormValues(prev => ({
                                        ...prev,
                                        selectedKeyId: e.target.value,
                                        private_key: selectedKey?.privateKey || ''
                                    }));
                                }}
                            >
                                {keys.map((key) => (
                                    <MenuItem key={key.id} value={key.id}>
                                        {key.name} ({key.address.slice(0, 8)}...)
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    {inputs.map((input, index) =>
                        renderInput(input, index, [selectedFunction, "input", index])
                    )}
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            onClick={() => execute({
                                ...formValues,
                                inputs: JSON.stringify(
                                    inputs.map((input, index) =>
                                        formValues[`${selectedFunction}_input_${index}`]
                                    )
                                )
                            })}
                            disabled={loading || !formValues.private_key || !selectedFunction}
                        >
                            Execute
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    return (
        <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <LoadProgram onResponse={onLoadProgram} />
                </Grid>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Program
                            </Typography>
                            <CodeEditor
                                value={formValues.program || ""}
                                onChange={onProgramEdit}
                            />
                        </CardContent>
                    </Card>
                </Grid>
                {functions.length > 0 ? (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Execute Function
                                </Typography>
                                {executeForm()}
                            </CardContent>
                        </Card>
                    </Grid>
                ) : (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary">
                                No functions found in the program
                            </Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>
            <ManageKeysModal open={manageKeysOpen} onClose={() => setManageKeysOpen(false)} />
        </Box>
    );
};