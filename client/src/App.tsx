import { Route, Routes } from "react-router-dom";
import Wrapper from "./components/Wrapper";
import MeetingPage from "./views/meetingPage";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:8000";
const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Wrapper />}>
        <Route index element={<MeetingPage />} />
        <Route path="/summary" element={<h3>Summary</h3>} />
      </Route>
    </Routes>
  );
};

export default App;
