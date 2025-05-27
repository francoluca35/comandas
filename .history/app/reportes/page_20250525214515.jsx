import React from "react";
import ReportePorFecha from "../components/GenerarReporte";
import UserDropdown from "../components/ui/UserDropdown";

function Reportes() {
  return (
    <div>
      <UserDropdown />
      <ReportePorFecha />
    </div>
  );
}

export default Reportes;
