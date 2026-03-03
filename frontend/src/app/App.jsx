import { HashRouter, Routes, Route } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import CalendarPage from "../routes/calendar/CalendarPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<CalendarPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
