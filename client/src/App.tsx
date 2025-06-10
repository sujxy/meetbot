import { Route, Routes } from "react-router-dom";
import Wrapper from "./components/Wrapper";
import MeetingPage from "./views/meetingPage";
import axios from "axios";
import HomePage from "./views/homePage";
import SummaryPage from "./views/summaryPage";
import AuthPage from "./views/authPage";
import ProtectedRoute from "./utils/protectedRoute";
import SettingsPage from "./views/settingsPage";
import ChatPage from "./views/chatPage";

axios.defaults.baseURL = "http://localhost:8000";
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/auth/:pageType" element={<AuthPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Wrapper />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path={"/join-meeting"} element={<MeetingPage />} />
        <Route path="/summary/:meetingId?" element={<SummaryPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path={"/settings"} element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

export default App;
