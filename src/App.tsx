import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout";
import { CreditFreezePage } from "./pages/CreditFreeze";
import { FaqPage } from "./pages/Faq";
import { HomePage } from "./pages/Home";
import { LettersPage } from "./pages/Letters";
import { PrivacyPage } from "./pages/Privacy";
import { PrivacyToolPage } from "./pages/PrivacyTool";

function LegacyChecklistRedirect() {
  const { hash, search } = useLocation();
  return <Navigate to={{ pathname: "/privacy-tool", hash, search }} replace />;
}

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="privacy-tool" element={<PrivacyToolPage />} />
        <Route path="credit-freeze" element={<CreditFreezePage />} />
        <Route path="checklist" element={<LegacyChecklistRedirect />} />
        <Route path="spam" element={<Navigate to="/privacy-tool?filter=spam" replace />} />
        <Route path="letters" element={<LettersPage />} />
        <Route path="resources" element={<Navigate to="/privacy-tool?filter=spam" replace />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
}
