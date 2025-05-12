import { TextField, Typography, Box, Paper } from "@mui/material";

const nameOrIndex = (field, index) => {
    if (field.name) {
        return field.name;
    }
    return index + 1;
};

const createFormField = (field, index) => (
    <TextField
        key={nameOrIndex(field, index)}
        label={nameOrIndex(field, index)}
        name={nameOrIndex(field, index)}
        placeholder={field.type}
        fullWidth
        margin="normal"
        variant="outlined"
    />
);

export const FormGenerator = ({ formData }) => {
    const renderFormFields = (fields) => {
        return fields.map((field, index) => {
            if (field.members) {
                return (
                    <Box key={nameOrIndex(field, index)} sx={{ mb: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            {nameOrIndex(field, index)}
                        </Typography>
                        {renderFormFields(field.members)}
                    </Box>
                );
            }
            return createFormField(field, index);
        });
    };

    return (
        <Box>
            {formData.map((funcData, index) => (
                <Paper key={index} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        {"function: " + funcData.functionID}
                    </Typography>
                    <Box component="form" noValidate autoComplete="off">
                        {renderFormFields(funcData.inputs)}
                    </Box>
                </Paper>
            ))}
        </Box>
    );
};
