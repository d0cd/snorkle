import { createBrowserRouter, Navigate } from "react-router-dom";
import Main from "./main.jsx";
import { NewAccount } from "./tabs/account/NewAccount.jsx";
import { SignMessage } from "./tabs/account/SignMessage.jsx";
import { VerifyMessage } from "./tabs/account/VerifyMessage.jsx";
import { DecryptRecord } from "./tabs/protocol/DecryptRecord.jsx";
import { GetLatestBlockHeight } from "./tabs/rest/GetLatestBlockHeight.jsx";
import { GetLatestBlock } from "./tabs/rest/GetLatestBlock.jsx";
import { GetBlockByHeight } from "./tabs/rest/GetBlockByHeight.jsx";
import { GetBlockByHash } from "./tabs/rest/GetBlockByHash.jsx";
import { GetProgram } from "./tabs/rest/GetProgram.jsx";
import { GetTransaction } from "./tabs/rest/GetTransaction.jsx";
import { Deploy } from "./tabs/deploy/Deploy.jsx";
import { Execute } from "./tabs/execute/";
import { GetMappingNames } from "./tabs/rest/GetMappingNames.jsx";
import { GetMappingValue } from "./tabs/rest/GetMappingValue.jsx";
import { TransactionInfo } from "./tabs/protocol/TransactionInfo.jsx";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Main />,
        children: [
            {
                index: true,
                element: <Navigate to="/execute" replace />,
            },
            {
                path: "account",
                element: (
                    <>
                        <SignMessage />
                        <br />
                        <VerifyMessage />
                    </>
                ),
            },
            {
                path: "record",
                element: (
                    <>
                        <DecryptRecord />
                    </>
                ),
            },
            {
                path: "rest",
                element: (
                    <>
                        <GetLatestBlockHeight />
                        <br />
                        <GetLatestBlock />
                        <br />
                        <GetBlockByHeight />
                        <br />
                        <GetBlockByHash />
                        <br />
                        <GetProgram />
                        <br />
                        <GetMappingNames />
                        <br />
                        <GetMappingValue />
                        <br />
                        <GetTransaction />
                    </>
                ),
            },
            {
                path: "deploy",
                element: (
                        <Deploy />
                ),
            },
            {
                path: "execute",
                element: <Execute />,
            },
            
            {
                path: "*",
                element: <NotFound />,
            },
        ],
    },
]);
