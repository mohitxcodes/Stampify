import { BrowserRouter, Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import HomePage from "./pages/home/HomePage"
import OutputPage from "./pages/output/OutputPage"

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/output" element={<OutputPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
