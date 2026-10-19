import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ChecklistPage } from "./pages/Checklist";
import { FaqPage } from "./pages/Faq";
import { HomePage } from "./pages/Home";
import { LettersPage } from "./pages/Letters";
import { PrivacyPage } from "./pages/Privacy";
import { SpamPage } from "./pages/Spam";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="checklist" element={<ChecklistPage />} />
        <Route path="letters" element={<LettersPage />} />
        <Route path="spam" element={<SpamPage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
}
