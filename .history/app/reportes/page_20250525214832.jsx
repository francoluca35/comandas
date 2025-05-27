import React from "react";
import ReportePorFecha from "../components/GenerarReporte";
import UserDropdown from "../components/ui/UserDropdown";

function Reportes() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6 text-white flex flex-col">
      <div className="flex justify-end p-4">
        <UserDropdown />
      </div>

      <ReportePorFecha />
    </main>
  );
}

export default Reportes;
