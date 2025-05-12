import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    Paper,
    Stack,
    useTheme
} from "@mui/material";
import { useSnackbar } from "notistack";
import { LoadProgram } from "./LoadProgram.jsx";
import { CodeEditor } from "./CodeEditor.jsx";
import { useAleoWASM } from "../../aleo-wasm-hook";
import { useEffect, useState } from "react";
import { KeyDropdown } from "../../components/KeyDropdown";
import { CopyButton } from "../../components/CopyButton";
import { useNetwork } from "../../contexts/NetworkContext";
import axios from "axios";

export const Execute = () => {
    const [functions, setFunctions] = useState([]);
    const [aleoWASM] = useAleoWASM();
    const [modalOpen, setModalOpen] = useState(false);
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
    const { enqueueSnackbar } = useSnackbar();
    const [selectedFunction, setSelectedFunction] = useState(null);
    const [functionInputs, setFunctionInputs] = useState([]);
    const [inputs, setInputs] = useState({});
    const theme = useTheme();

    const handleOk = () => {
        setModalOpen(false);
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
            await parseProgram(response.data);
        } catch (error) {
            setSearchError("Program not found on network");
            enqueueSnackbar("Program not found on network", { variant: "error" });
        } finally {
            setSearchLoading(false);
        }
    };

    const onFunctionSelect = (funcName) => {
        setSelectedFunction(funcName);
        const func = functions.find((f) => f.name === funcName);
        setFunctionInputs(func ? func.inputs : []);
        setInputs({});
    };

    const handleInputChange = (index, value) => {
        setInputs(prev => ({
            ...prev,
            [index]: value
        }));
    };

    const renderInputFields = () => {
        if (!functionInputs || functionInputs.length === 0) return null;
        return functionInputs.map((input, idx) => (
            <TextField
                key={idx}
                fullWidth
                label={input.name || input.register || `Input ${idx + 1}`}
                placeholder={input.type}
                value={inputs[idx] || ""}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                required
                margin="normal"
            />
        ));
    };

    const getInputString = (inputsObj) => {
        return Object.values(inputsObj).join(" ");
    };

    const onFinish = () => {
        setLoading(true);
        setModalOpen(true);
        setModalResult({
            status: "warning",
            subTitle: "Executing program...",
        });
        try {
            const result = aleoWASM.executeProgram(
                programValue,
                selectedFunction,
                inputs.private_key,
                getInputString(inputs)
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
        setModalOpen(true);
        try {
            const fee = aleoWASM.estimateExecutionFee(
                programValue,
                selectedFunction,
                inputs.private_key,
                getInputString(inputs)
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
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Execute Program</Typography>
                <Stack spacing={2}>
                    <Box>
                        <TextField
                            fullWidth
                            label="Program Search"
                            placeholder="Enter a program ID deployed on the current network"
                            InputProps={{
                                endAdornment: (
                                    <Button
                                        variant="contained"
                                        onClick={() => onSearch(inputs.programId)}
                                        disabled={searchLoading}
                                    >
                                        {searchLoading ? <CircularProgress size={24} /> : "Search"}
                                    </Button>
                                )
                            }}
                            value={inputs.programId || ""}
                            onChange={(e) => handleInputChange("programId", e.target.value)}
                        />
                    </Box>
                    {searchError && (
                        <Alert severity="error">{searchError}</Alert>
                    )}
                    <Divider />
                    <Box sx={{ 
                        maxHeight: 240, 
                        overflow: "auto", 
                        mb: 2, 
                        borderRadius: 1, 
                        border: `1px solid ${theme.palette.divider}` 
                    }}>
                        <CodeEditor
                            value={programValue}
                            onChange={onProgramChange}
                            language="leo"
                        />
                    </Box>
                    <FormControl fullWidth>
                        <InputLabel>Select Function</InputLabel>
                        <Select
                            value={selectedFunction || ""}
                            onChange={(e) => onFunctionSelect(e.target.value)}
                            label="Select Function"
                        >
                            {functions.map((func) => (
                                <MenuItem key={func.name} value={func.name}>
                                    {func.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {renderInputFields()}
                    <TextField
                        fullWidth
                        label="Private Key"
                        value={inputs.private_key || ""}
                        onChange={(e) => handleInputChange("private_key", e.target.value)}
                        required
                        margin="normal"
                    />
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            onClick={onFinish}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : "Execute"}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={onEstimateFee}
                            disabled={feeLoading}
                        >
                            {feeLoading ? <CircularProgress size={24} /> : "Estimate Fee"}
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};
