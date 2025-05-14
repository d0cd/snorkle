import React from "react";
import "./index.css";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routing.jsx";
import { WorkerProvider } from "./workers/WorkerProvider.jsx";
import { SnackbarProvider } from "notistack";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <SnackbarProvider maxSnack={3}>
            <WorkerProvider>
                <RouterProvider router={router} />
            </WorkerProvider>
        </SnackbarProvider>
    </React.StrictMode>,
);