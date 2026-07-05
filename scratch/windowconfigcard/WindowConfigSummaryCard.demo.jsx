import React from "react";
import WindowConfigSummaryCard from "./WindowConfigSummaryCard";

export default function Demo() {
  return (
    <WindowConfigSummaryCard
      roomIndex={1}
      roomName="Habitación principal"
      profileCode="IGLO 5"
      profileType="F252"
      dimensionsLocked={true}
      dimensionsNote="Fijo por habitación"
      glazing="3-40 triple, 40mm"
      handle="Estándar (blanco)"
      treatments="Solar y térmico"
      colors={[
        { label: "Marco int.", hex: "#ffffff" },
        { label: "Marco ext.", hex: "#d3d3d3" },
        { label: "Cajón int.", hex: "#ffffff" },
        { label: "Cajón ext.", hex: "#d3d3d3" },
        { label: "Persiana", hex: "#d7d7d7" },
        { label: "Guías", hex: "#d3d3d3" },
      ]}
      complements={[
        { label: "Persiana", included: true, variant: "neutral" },
        { label: "Motor", included: true, variant: "neutral" },
        { label: "Mosquitera", included: true, variant: "neutral" },
        { label: "Tratamiento solar", included: true, variant: "solar" },
        { label: "Tratamiento térmico", included: true, variant: "thermal" },
      ]}
      efficiencyRating="A++"
      uwValue="0.74 W/m²K"
      manufacturingDays={5}
      deliveryDate="24/07/2026"
      onViewAR={() => alert("Open AR viewer")}
    />
  );
}
