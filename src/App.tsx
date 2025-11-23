import { BrowserRouter, Routes, Route } from "react-router-dom";
import FirstView from "./pages/FirstView";
import Home from "./pages/Home";
import EventDetail from "./pages/EventDetail";
import MyCalendar from "./pages/MyCalendar";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FirstView />} />
        <Route path="/home" element={<Home />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/calendar" element={<MyCalendar />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
