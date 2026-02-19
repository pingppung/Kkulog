import { HashRouter, Routes, Route } from "react-router-dom";
import CalendarPage from "../routes/calendar/CalendarPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<CalendarPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
