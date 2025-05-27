import React from "react";
import ReportePorFecha from "../components/GenerarReporte";
import UserDropdown from "../components/ui/UserDropdown";

function Reportes() {
  return (
    <div className="flex justify-end p-4">
      <UserDropdown />

      <ReportePorFecha />
    </div>
  );
}

export default Reportes;
