"use client";

import dynamic from "next/dynamic";

// ssr:false is only valid inside a Client Component
const ScrollConnectionSVG = dynamic(
  () => import("@/components/home/ScrollConnectionSVG"),
  { ssr: false }
);

export default function ScrollConnectionSVGWrapper() {
  return <ScrollConnectionSVG />;
}
