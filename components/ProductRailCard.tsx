"use client";

interface Product {
  id: string;
  name: string;
  price: number;
  tag?: string;
  gradient: string;
}

interface ProductRailCardProps {
  product: Product;
  onAdd: (id: string) => void;
}

export default function ProductRailCard({ product, onAdd }: ProductRailCardProps) {
  return (
    <div style={{ flex: "0 0 160px" }}>
      <div
        style={{
          height: 200,
          borderRadius: 6,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "flex-end",
          background: product.gradient,
        }}
      >
        {/* Placeholder slot */}
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(60,35,49,0.32)",
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            fontSize: 13,
          }}
        >
          product photo
        </span>

        {/* Tag badge */}
        {product.tag && (
          <span
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: "rgba(251,247,242,0.9)",
              color: "var(--plum)",
              fontSize: 9,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "4px 9px",
              borderRadius: 2,
              fontFamily: "var(--sans)",
            }}
          >
            {product.tag}
          </span>
        )}

        {/* Add button */}
        <button
          aria-label={`Add ${product.name} to bag`}
          onClick={() => onAdd(product.id)}
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "var(--plum)",
            color: "var(--ivory)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "transform 0.2s, background 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--rose)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--plum)";
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.85)";
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      <h3
        style={{
          fontFamily: "var(--sans)",
          fontWeight: 400,
          fontSize: 13.5,
          color: "var(--ink)",
          margin: "12px 0 4px",
          letterSpacing: "0.02em",
        }}
      >
        {product.name}
      </h3>
      <div
        style={{
          fontSize: 12.5,
          color: "var(--plum-soft)",
          letterSpacing: "0.05em",
          fontFamily: "var(--sans)",
        }}
      >
        KES {product.price.toLocaleString()}
      </div>
    </div>
  );
}
