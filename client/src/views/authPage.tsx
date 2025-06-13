import { useParams } from "react-router-dom";
import LoginPage from "../components/loginPage";
import bgImage from "/auth-bg.jpg";

const AuthPage = () => {
  const { pageType } = useParams();

  const isLogin = pageType === "signin";

  return (
    <div className="w-screen h-[100vh] grid grid-cols-2">
      {/* left section */}
      <div
        className="col-span-1 relative flex items-start justify-center text-white font-bold text-5xl p-24"
        style={{
          backgroundImage: `linear-gradient(rgba(31,41,55,0.7), rgba(75,85,99,0.7)), url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        Make time for more while we handle the mundane!
      </div>
      <div className="col-span-1 flex items-center justify-center">
        {isLogin ? <LoginPage /> : <h1>Register</h1>}
      </div>
    </div>
  );
};

export default AuthPage;
