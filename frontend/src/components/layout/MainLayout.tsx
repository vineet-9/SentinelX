import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Header />

        <main className="flex-1 p-8 text-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}