import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';

const WorkerContext = createContext();

export const useWorker = () => {
    const context = useContext(WorkerContext);
    if (!context) {
        throw new Error('useWorker must be used within a WorkerProvider');
    }
    return context;
};

export const WorkerProvider = ({ children }) => {
    const [worker, setWorker] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const initializeWorker = async () => {
            try {
                const workerInstance = new Worker(
                    new URL('./worker.js', import.meta.url),
                    { type: 'module' }
                );

                workerInstance.onmessage = (event) => {
                    if (event.data.type === 'ALEO_WORKER_READY') {
                        setIsReady(true);
                    }
                };

                workerInstance.onerror = (error) => {
                    console.error('Worker error:', error);
                    enqueueSnackbar('Worker error: ' + error.message, { variant: 'error' });
                };

                setWorker(workerInstance);
            } catch (error) {
                console.error('Failed to initialize worker:', error);
                enqueueSnackbar('Failed to initialize worker: ' + error.message, { variant: 'error' });
            }
        };

        initializeWorker();

        return () => {
            if (worker) {
                worker.terminate();
            }
        };
    }, []);

    const executeProgram = async (params) => {
        if (!worker || !isReady) {
            throw new Error('Worker is not ready');
        }

        return new Promise((resolve, reject) => {
            const messageHandler = (event) => {
                if (event.data.type === 'OFFLINE_EXECUTION_COMPLETED') {
                    worker.removeEventListener('message', messageHandler);
                    resolve(event.data.outputs);
                } else if (event.data.type === 'ERROR') {
                    worker.removeEventListener('message', messageHandler);
                    reject(new Error(event.data.errorMessage));
                }
            };

            worker.addEventListener('message', messageHandler);
            worker.postMessage({
                type: 'ALEO_EXECUTE_PROGRAM_LOCAL',
                ...params
            });
        });
    };

    const executeProgramOnChain = async (params) => {
        if (!worker || !isReady) {
            throw new Error('Worker is not ready');
        }

        return new Promise((resolve, reject) => {
            const messageHandler = (event) => {
                if (event.data.type === 'EXECUTION_TRANSACTION_COMPLETED') {
                    worker.removeEventListener('message', messageHandler);
                    resolve(event.data.executeTransaction);
                } else if (event.data.type === 'ERROR') {
                    worker.removeEventListener('message', messageHandler);
                    reject(new Error(event.data.errorMessage));
                }
            };

            worker.addEventListener('message', messageHandler);
            worker.postMessage({
                type: 'ALEO_EXECUTE_PROGRAM_ON_CHAIN',
                ...params
            });
        });
    };

    const estimateExecutionFee = async (params) => {
        if (!worker || !isReady) {
            throw new Error('Worker is not ready');
        }

        return new Promise((resolve, reject) => {
            const messageHandler = (event) => {
                if (event.data.type === 'EXECUTION_FEE_ESTIMATION_COMPLETED') {
                    worker.removeEventListener('message', messageHandler);
                    resolve(event.data.executionFee);
                } else if (event.data.type === 'ERROR') {
                    worker.removeEventListener('message', messageHandler);
                    reject(new Error(event.data.errorMessage));
                }
            };

            worker.addEventListener('message', messageHandler);
            worker.postMessage({
                type: 'ALEO_ESTIMATE_EXECUTION_FEE',
                ...params
            });
        });
    };

    const estimateDeploymentFee = async (params) => {
        if (!worker || !isReady) {
            throw new Error('Worker is not ready');
        }

        return new Promise((resolve, reject) => {
            const messageHandler = (event) => {
                if (event.data.type === 'DEPLOYMENT_FEE_ESTIMATION_COMPLETED') {
                    worker.removeEventListener('message', messageHandler);
                    resolve(event.data.deploymentFee);
                } else if (event.data.type === 'ERROR') {
                    worker.removeEventListener('message', messageHandler);
                    reject(new Error(event.data.errorMessage));
                }
            };

            worker.addEventListener('message', messageHandler);
            worker.postMessage({
                type: 'ALEO_ESTIMATE_DEPLOYMENT_FEE',
                ...params
            });
        });
    };

    return (
        <WorkerContext.Provider
            value={{
                isReady,
                executeProgram,
                executeProgramOnChain,
                estimateExecutionFee,
                estimateDeploymentFee
            }}
        >
            {children}
        </WorkerContext.Provider>
    );
};
