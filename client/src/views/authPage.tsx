import { useParams } from "react-router-dom";
import LoginPage from "../components/loginPage";

const AuthPage = () => {
  const { pageType } = useParams();

  const isLogin = pageType === "signin";

  return (
    <div className="w-screen h-[100vh] grid grid-cols-2">
      <div className="col-span-1 bg-gray-800 p-24 flex items-center justify-center text-white font-bold text-4xl">
        Make time for more while we handle the mundane!
      </div>
      <div className="col-span-1 flex items-center justify-center  ">
        {isLogin ? <LoginPage /> : <h1>Register</h1>}
      </div>
    </div>
  );
};

export default AuthPage;
