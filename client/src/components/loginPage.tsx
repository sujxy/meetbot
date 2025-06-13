import { useState } from "react";
// import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import InputBox from "./inputBox";
import { Loader } from "lucide-react";
import { useUserContext } from "../context/userContext";
import { useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

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
    <button
      className="outline-btn flex items-center justify-evenly gap-1"
      onClick={() => login()}
    >
      <img className="w-5 h-5 " src="/google-logo.png" />
      <p>Login with Google</p>
    </button>
  );
}

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSignIn = async () => {
    try {
      //await setLogin(email, password);
      toast.error("Signin using Google.");
    } catch (err: any) {
      toast.error("error");
    }
  };

  return (
    <div className="w-1/3 flex flex-col gap-4 font-main">
      <div className="flex  items-center gap-1 justify-center  px-4">
        <img src={"/favicon.png"} className="w-6 h-6" />
        <h1 className="text-center text-2xl font-semibold">Sign In</h1>
      </div>

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
