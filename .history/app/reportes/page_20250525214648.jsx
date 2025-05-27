import React from "react";
import ReportePorFecha from "../components/GenerarReporte";
import UserDropdown from "../components/ui/UserDropdown";

function Reportes() {
  return (
    <main className="min-h-screen bg-gradient-to-tr from-indigo-900 via-purple-900 to-pink-800 text-white">
      <div className="flex justify-end p-4">
        <UserDropdown />
      </div>

      <ReportePorFecha />
    </main>
  );
}

export default Reportes;
