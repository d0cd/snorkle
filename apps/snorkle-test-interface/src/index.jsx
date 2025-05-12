import React from "react";
import "./index.css";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routing.jsx";
import WorkerProvider from "./workers/WorkerProvider.jsx";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <WorkerProvider>
            <RouterProvider router={router} />
        </WorkerProvider>
    </React.StrictMode>,
);