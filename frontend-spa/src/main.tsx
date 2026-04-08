import React from "react";
import ReactDOM from "react-dom/client";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./index.css";
import { BrowserRouter } from "react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./router/router";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{ duration: 4200 }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
