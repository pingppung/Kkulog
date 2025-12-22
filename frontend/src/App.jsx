import { BrowserRouter, Routes, Route } from "react-router-dom";
import Calendar from "./pages/Calendar";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/calendar" element={<Calendar />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App