import { useState } from "react";
// import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import InputBox from "./inputBox";
import { Loader } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useUserContext } from "../context/userContext";
import { useGoogleLogin } from "@react-oauth/google";

function Login() {
  const { loginWithGoogle } = useUserContext();
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      const { code } = codeResponse;
      await loginWithGoogle(code);
      navigate("/");
    },
    flow: "auth-code",
    scope: [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
    include_granted_scopes: true,
    //prompt: "consent",
  });

  return (
    <button className="filled-btn " onClick={() => login()}>
      {/* <img className="w-4 h-4 " src="/google-logo.png" /> */}
      <p>Login with Google</p>
    </button>
  );
}

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      //await setLogin(email, password);

      navigate("/");
    } catch (err: any) {
      alert("error");
    }
  };

  return (
    <div className="w-1/3 flex flex-col gap-4 font-main">
      <h1 className="text-center text-xl font-semibold">Sign In</h1>
      <InputBox
        placeholder="e-mail"
        type="email"
        value={email}
        onChange={setEmail}
      />
      <InputBox
        placeholder="password"
        type="password"
        value={password}
        onChange={setPassword}
      />
      <button className="filled-btn" onClick={handleSignIn}>
        {false ? <Loader className="animate-spin" /> : <p>Sign In</p>}
      </button>
      {/* <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.log("Login Failed")}
      /> */}
      <Login />
      <Link
        className="text-gray-500 underline text-sm text-center"
        to="/auth/signup"
      >
        New user? Sign up{" "}
      </Link>
    </div>
  );
};

export default LoginPage;
