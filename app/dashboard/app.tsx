import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layout";
import DashboardPage from "./dashboardpage";
import BudgetsPage from "./Budgets/Budgetspage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard Layout with Nested Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="budgets" element={<BudgetsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
