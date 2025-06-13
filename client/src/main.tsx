import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import UserProvider from "./context/userContext.tsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={""}>
    <UserProvider>
      <Toaster position={"top-right"} />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </UserProvider>
  </GoogleOAuthProvider>
);
