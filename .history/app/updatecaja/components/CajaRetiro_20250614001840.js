import React from "react";
import Image from "next/image";
import BackArrow from "@/app/components/ui/BackArrow";

function CajaRetiro() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-black to-blue-950">
      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BackArrow />
          <div className="flex items-center gap-3">
            <Image
              src="/Assets/Mesas/logo-peru-mar.png"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-full border border-white shadow-sm"
            />
            <h1 className="text-white text-2xl font-bold tracking-tight">
              PeruMar<span className="text-blue-400">.</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Acá va el contenido de tu CajaRetiro */}
    </div>
  );
}

export default CajaRetiro;
