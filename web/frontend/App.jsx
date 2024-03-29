import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavigationMenu } from "@shopify/app-bridge-react";
// import Routes from "./Routes";
import './App.css'; 

import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
} from "./components";

import SubscriptionDetail from "./pages/subscriptionDetail";
import HomePage from "./pages";
import Subscriptions from './pages/subscriptions';

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");
  const { t } = useTranslation();

  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            <NavigationMenu
              navigationLinks={[
                {
                  // label: t("NavigationMenu.pageName"),
                  label: "Subscriptions",
                  destination: "/subscriptions",
                },
              ]}
            />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/subscriptionDetail/:id" element={<SubscriptionDetail />} />
            </Routes>
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
