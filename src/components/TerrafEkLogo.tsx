import React from "react";

interface TerrafEkLogoProps {
  className?: string;
  size?: number | string;
  variant?: "light" | "dark" | "auto";
}

export const TerrafEkLogo: React.FC<TerrafEkLogoProps> = ({
  className = "w-8 h-8",
  variant = "auto"
}) => {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Top Isometric Cube Lid / Facets (No "node" text) */}
      <g id="top-cube-lid">
        {/* Left top facet */}
        <polygon
          points="100,20 40,54 100,88 100,54"
          className="fill-indigo-900"
          style={{ fill: "#1e295f" }}
        />
        {/* Right top facet */}
        <polygon
          points="100,20 100,54 100,88 160,54"
          className="fill-emerald-300"
          style={{ fill: "#93e4c8" }}
        />
        {/* Top diamond accent */}
        <polygon
          points="100,20 130,37 100,54 70,37"
          style={{ fill: "#3b4b8a" }}
        />
        {/* Center top accent connector */}
        <polygon
          points="100,54 120,43 100,32 80,43"
          style={{ fill: "#7dd3fc" }}
        />
      </g>

      {/* Left Face: Stylized Isometric Letter 'E' (Navy / Indigo) */}
      <g id="letter-E" style={{ fill: "#1e295f" }}>
        {/* Back spine / vertical bar */}
        <path
          d="M 40,68 
             L 66,83 
             L 66,170 
             L 40,155 
             Z"
          fill="#1e295f"
        />
        {/* Top horizontal prong */}
        <path
          d="M 40,68 
             L 94,99 
             L 94,116 
             L 52,92 
             L 40,85 
             Z"
          fill="#1e295f"
        />
        {/* Middle horizontal prong */}
        <path
          d="M 52,109 
             L 86,128 
             L 86,144 
             L 52,125 
             Z"
          fill="#1e295f"
        />
        {/* Bottom horizontal prong */}
        <path
          d="M 40,140 
             L 94,171 
             L 94,188 
             L 40,157 
             Z"
          fill="#1e295f"
        />
      </g>

      {/* Right Face: Stylized Letter 'K' (Mint Green / Cyan) */}
      <g id="letter-K" style={{ fill: "#86efac" }}>
        {/* Vertical left spine */}
        <path
          d="M 106,99 
             L 126,87 
             L 126,172 
             L 106,183 
             Z"
          fill="#86efac"
        />
        {/* Upper diagonal arm with smooth rounded end */}
        <path
          d="M 120,132 
             L 148,82 
             C 152,75 162,75 166,81 
             C 170,87 167,97 161,104 
             L 138,138 
             Z"
          fill="#86efac"
        />
        {/* Lower diagonal arm with smooth rounded end */}
        <path
          d="M 124,136 
             L 155,162 
             C 161,167 164,177 159,183 
             C 154,189 144,188 138,181 
             L 116,155 
             Z"
          fill="#86efac"
        />
      </g>
    </svg>
  );
};
