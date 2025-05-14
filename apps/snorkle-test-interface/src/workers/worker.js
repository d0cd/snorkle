// @ts-check
import * as aleo from "@provablehq/sdk";

// Initialize the thread pool
await aleo.initThreadPool();

const defaultHost = "https://api.explorer.provable.com/v1";
const keyProvider = new aleo.AleoKeyProvider();
const programManager = new aleo.ProgramManager(defaultHost, keyProvider, undefined);
keyProvider.useCache(true);

// Signal that the worker is ready
self.postMessage({
    type: "ALEO_WORKER_READY",
});

let lastLocalProgram = null;

// Handle messages from the main thread
self.addEventListener("message", async (ev) => {
    const { type, ...data } = ev.data;

    try {
        switch (type) {
            case "ALEO_EXECUTE_PROGRAM_LOCAL": {
                const { localProgram, aleoFunction, inputs, privateKey } = data;
                console.log("Web worker: Executing function locally...");
                const startTime = performance.now();

                const privateKeyObject = aleo.PrivateKey.from_string(privateKey);
                const program = programManager.createProgramFromSource(localProgram);
                const program_id = program.id();

                if (!program.hasFunction(aleoFunction)) {
                    throw new Error(`Program ${program_id} does not contain function ${aleoFunction}`);
                }

                const cacheKey = `${program_id}:${aleoFunction}`;
                const imports = programManager.networkClient.getProgramImports(localProgram);

                if (lastLocalProgram !== localProgram) {
                    const keys = await programManager.synthesizeKeys(localProgram, aleoFunction, inputs, privateKeyObject);
                    programManager.keyProvider.cacheKeys(cacheKey, keys);
                    lastLocalProgram = localProgram;
                }

                const keyParams = new aleo.AleoKeyProviderParams({ cacheKey });
                const response = await programManager.run(
                    localProgram,
                    aleoFunction,
                    inputs,
                    false,
                    imports,
                    keyParams,
                    undefined,
                    undefined,
                    privateKeyObject,
                    undefined
                );

                console.log(`Web worker: Local execution completed in ${performance.now() - startTime} ms`);
                const outputs = response.getOutputs();
                let execution = response.getExecution();

                if (execution) {
                    aleo.verifyFunctionExecution(execution, keyProvider.getKeys(cacheKey)[1], program, aleoFunction);
                    execution = execution.toString();
                    console.log("Execution verified successfully: " + execution);
                } else {
                    execution = "";
                }

                self.postMessage({
                    type: "OFFLINE_EXECUTION_COMPLETED",
                    outputs: { outputs, execution }
                });
                break;
            }

            case "ALEO_EXECUTE_PROGRAM_ON_CHAIN": {
                const { remoteProgram, aleoFunction, inputs, privateKey, fee, privateFee, feeRecord, url } = data;
                console.log("Web worker: Creating execution...");
                const startTime = performance.now();

                const privateKeyObject = aleo.PrivateKey.from_string(privateKey);
                const program = await programManager.networkClient.getProgramObject(remoteProgram);
                const program_id = program.id();

                if (!program.hasFunction(aleoFunction)) {
                    throw new Error(`Program ${program_id} does not contain function ${aleoFunction}`);
                }

                const cacheKey = `${program_id}:${aleoFunction}`;
                if (!programManager.keyProvider.containsKeys(cacheKey)) {
                    console.log(`Web worker: Synthesizing proving & verifying keys for: '${program_id}:${aleoFunction}'`);
                    const keys = await programManager.synthesizeKeys(remoteProgram, aleoFunction, inputs, privateKeyObject);
                    programManager.keyProvider.cacheKeys(cacheKey, keys);
                }

                const keyParams = new aleo.AleoKeyProviderParams({ cacheKey });
                if (typeof url === "string") {
                    programManager.setHost(url);
                }

                const transaction = await programManager.execute({
                    programName: program_id,
                    functionName: aleoFunction,
                    fee,
                    privateFee,
                    inputs,
                    keySearchParams: keyParams,
                    feeRecord,
                    privateKey: privateKeyObject
                });

                console.log(`Web worker: On-chain execution transaction created in ${performance.now() - startTime} ms`);
                self.postMessage({
                    type: "EXECUTION_TRANSACTION_COMPLETED",
                    executeTransaction: transaction
                });
                break;
            }

            case "ALEO_ESTIMATE_EXECUTION_FEE": {
                const { remoteProgram, privateKey, aleoFunction, inputs, url } = data;
                console.log("Web worker: Estimating execution fee...");
                const startTime = performance.now();

                const privateKeyObject = aleo.PrivateKey.from_string(privateKey);
                const program = await programManager.networkClient.getProgramObject(remoteProgram);
                const program_id = program.id();

                if (!program.getFunctions().includes(aleoFunction)) {
                    throw new Error(`Program ${program_id} does not contain function ${aleoFunction}`);
                }

                const cacheKey = `${program_id}:${aleoFunction}`;
                const imports = await programManager.networkClient.getProgramImports(remoteProgram);

                if (!programManager.keyProvider.containsKeys(cacheKey)) {
                    console.log(`Web worker: Synthesizing proving & verifying keys for: '${program_id}:${aleoFunction}'`);
                    const keys = await programManager.synthesizeKeys(program.toString(), aleoFunction, inputs, privateKeyObject);
                    programManager.keyProvider.cacheKeys(cacheKey, keys);
                }

                const [provingKey, verifyingKey] = programManager.keyProvider.getKeys(cacheKey);
                const executeFee = await aleo.ProgramManagerBase.estimateExecutionFee(
                    privateKeyObject,
                    remoteProgram,
                    aleoFunction,
                    inputs,
                    url,
                    imports,
                    provingKey,
                    verifyingKey,
                    undefined
                );

                console.log(`Web worker: Execution fee estimated in ${performance.now() - startTime} ms`);
                console.log(`Execution Fee Estimation: ${executeFee} microcredits`);
                self.postMessage({
                    type: "EXECUTION_FEE_ESTIMATION_COMPLETED",
                    executionFee: Number(executeFee) / 1000000 + 0.01
                });
                break;
            }

            case "ALEO_ESTIMATE_DEPLOYMENT_FEE": {
                const { program, url } = data;
                console.log("Web worker: Estimating deployment fee...");
                const startTime = performance.now();

                const imports = await programManager.networkClient.getProgramImports(program);
                const deploymentFee = await aleo.ProgramManagerBase.estimateDeploymentFee(
                    program,
                    imports
                );

                console.log(`Web worker: Deployment fee estimation completed in ${performance.now() - startTime} ms`);
                console.log(`Deployment Fee Estimation: ${deploymentFee} microcredits`);
                self.postMessage({
                    type: "DEPLOYMENT_FEE_ESTIMATION_COMPLETED",
                    deploymentFee: Number(deploymentFee) / 1000000 + 0.01
                });
                break;
            }

            case "ALEO_TRANSFER": {
                const {
                    privateKey,
                    amountCredits,
                    recipient,
                    transfer_type,
                    amountRecord,
                    fee,
                    privateFee,
                    feeRecord,
                    url,
                } = data;

                console.log(
                    `Web worker: Creating transfer of type ${transfer_type}...`,
                );
                let startTime = performance.now();

                (async function () {
                    try {
                        // Set the host to the provided URL if provided
                        if (typeof url === "string") { programManager.setHost(url); }

                        // Create the transfer transaction and submit it to the network
                        const transaction = await programManager.transfer(
                            amountCredits,
                            recipient,
                            transfer_type,
                            fee,
                            privateFee,
                            undefined,
                            amountRecord,
                            feeRecord,
                            aleo.PrivateKey.from_string(privateKey),
                            undefined
                        );

                        // Return the transaction id to the main thread
                        console.log(`Web worker: Transfer transaction ${transaction} created in ${performance.now() - startTime} ms`);
                        self.postMessage({
                            type: "TRANSFER_TRANSACTION_COMPLETED",
                            transferTransaction: transaction,
                        });
                    } catch (error) {
                        console.error(error);
                        self.postMessage({
                            type: "ERROR",
                            errorMessage: error.toString(),
                        });
                    } finally {
                        programManager.setHost(defaultHost);
                    }
                })();
                break;
            }

            case "ALEO_DEPLOY": {
                const { program, privateKey, fee, privateFee, feeRecord, url } = data;

                console.log("Web worker: Creating deployment...");

                let startTime = performance.now();
                (async function () {
                    try {
                        // Set the network client host if specified
                        if (typeof url === "string") { programManager.setHost(url); }

                        // Check if the program is valid
                        try {
                            const programObject = programManager.createProgramFromSource(program);
                        } catch (error) {
                            throw new Error(`Invalid program, ensure the program is valid and try again.`);
                        }

                        // Check if the program already exists on the network. If so, throw an error
                        let programExists = false;
                        try {
                            await programManager.networkClient.getProgram(programObject.id());
                            programExists = true;
                        } catch (e) {
                            console.log(
                                `Program not found on the Aleo Network - proceeding with deployment...`,
                            );
                        }

                        if (programExists) {
                            throw new Error(`Program ${programObject.id()} already exists on the network`);
                        }

                        // Create the deployment transaction and submit it to the network
                        let transaction = await programManager.deploy(
                            program,
                            fee,
                            privateFee,
                            undefined,
                            feeRecord,
                            aleo.PrivateKey.from_string(privateKey),
                        )

                        // Return the transaction id to the main thread
                        console.log(`Web worker: Deployment transaction ${transaction} created in ${performance.now() - startTime} ms`);
                        self.postMessage({
                            type: "DEPLOY_TRANSACTION_COMPLETED",
                            deployTransaction: transaction,
                        });
                    } catch (error) {
                        console.log(error);
                        self.postMessage({
                            type: "ERROR",
                            errorMessage: error.toString(),
                        });
                    } finally {
                        programManager.setHost(defaultHost);
                    }
                })();
                break;
            }

            case "ALEO_SPLIT": {
                const { splitAmount, record, privateKey, url } = data;

                console.log("Web worker: Creating split...");

                let startTime = performance.now();
                (async function () {
                    try {
                        // Set the network client host if specified
                        if (typeof url === "string") { programManager.setHost(url); }

                        // Create the split transaction and submit to the network
                        const transaction = await programManager.split(
                            splitAmount,
                            record,
                            aleo.PrivateKey.from_string(privateKey),
                            undefined
                        );

                        // Return the transaction id to the main thread
                        console.log(`Web worker: Split transaction ${transaction} created in ${performance.now() - startTime} ms`);
                        self.postMessage({
                            type: "SPLIT_TRANSACTION_COMPLETED",
                            splitTransaction: transaction,
                        });
                    } catch (error) {
                        console.log(error);
                        self.postMessage({
                            type: "ERROR",
                            errorMessage: error.toString(),
                        });
                    } finally {
                        programManager.setHost(defaultHost);
                    }
                })();
                break;
            }

            case "ALEO_JOIN": {
                const { recordOne, recordTwo, fee, privateFee, feeRecord, privateKey, url } = data;

                console.log("Web worker: Creating join...");

                let startTime = performance.now();
                (async function () {
                    try {
                        // Set the network client host if specified
                        if (typeof url === "string") { programManager.setHost(url); }

                        // Create the join transaction and submit it to the network
                        const transaction = await programManager.join(
                            recordOne,
                            recordTwo,
                            fee,
                            privateFee,
                            undefined,
                            feeRecord,
                            aleo.PrivateKey.from_string(privateKey),
                            undefined
                        );

                        // Return the transaction id to the main thread
                        console.log(`Web worker: Join transaction ${transaction} created in ${performance.now() - startTime} ms`);
                        self.postMessage({
                            type: "JOIN_TRANSACTION_COMPLETED",
                            joinTransaction: transaction,
                        });
                    } catch (error) {
                        console.log(error);
                        self.postMessage({
                            type: "ERROR",
                            errorMessage: error.toString(),
                        });
                    } finally {
                        programManager.setHost(defaultHost);
                    }
                })();
                break;
            }

            default:
                console.warn(`Unknown message type: ${type}`);
        }
    } catch (error) {
        console.error(`Error in worker: ${error}`);
        self.postMessage({
            type: "ERROR",
            errorMessage: error.toString()
        });
    } finally {
        if (type === "ALEO_EXECUTE_PROGRAM_ON_CHAIN") {
            programManager.setHost(defaultHost);
        }
    }
});
