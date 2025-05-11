import { App, Progress, Space, Typography } from "antd";
import { useAleoWASM } from "../aleo-wasm-hook.js";
import { useEffect, useState } from "react";

const { Text } = Typography;

export function WasmLoadingMessage() {
    const { message } = App.useApp();
    const [_, aleoLoading] = useAleoWASM();
    const [loadingProgress, setLoadingProgress] = useState(0);

    useEffect(() => {
        if (aleoLoading) {
            // Simulate progress for better UX
            const interval = setInterval(() => {
                setLoadingProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 500);

            message.open({
                key: "wasmLoading",
                type: 'loading',
                content: (
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Text>Loading Provable SDK...</Text>
                        <Progress percent={loadingProgress} status="active" />
                        <Text type="secondary">This may take a few moments</Text>
                    </Space>
                ),
                duration: 0,
                style: { width: 300 }
            });

            return () => clearInterval(interval);
        } else {
            setLoadingProgress(100);
            message.open({
                key: "wasmLoading",
                type: 'success',
                content: 'Provable SDK Loaded Successfully!',
                duration: 2,
            });
        }
    }, [aleoLoading]);

    return null;
}
