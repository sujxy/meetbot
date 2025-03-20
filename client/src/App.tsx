import { Route, Routes } from "react-router-dom";
import Wrapper from "./components/Wrapper";
import MeetingPage from "./views/meetingPage";
import axios from "axios";
import HomePage from "./views/homePage";
import SummaryPage from "./views/summaryPage";

axios.defaults.baseURL = "http://localhost:8000";
const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Wrapper />}>
        <Route index element={<HomePage />} />
        <Route path={"/join-meeting"} element={<MeetingPage />} />
        <Route path="/summary/:meetingId?" element={<SummaryPage />} />
      </Route>
    </Routes>
  );
};

export default App;
