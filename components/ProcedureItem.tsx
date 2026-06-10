import Link from "next/link";

interface Procedure {
  name: string;
  description: string;
  href?: string;
}

interface ProcedureItemProps {
  procedure: Procedure;
}

export default function ProcedureItem({ procedure }: ProcedureItemProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "18px 0",
        borderBottom: "0.5px solid var(--line)",
      }}
    >
      {/* Circular thumbnail placeholder */}
      <div
        style={{
          flex: "0 0 64px",
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "linear-gradient(150deg, var(--cream), var(--blush))",
        }}
      />

      {/* Body */}
      <div style={{ flex: 1 }}>
        <h3
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 500,
            fontSize: 20,
            color: "var(--plum)",
            lineHeight: 1.1,
          }}
        >
          {procedure.name}
        </h3>
        <p
          style={{
            fontSize: 11.5,
            color: "var(--plum-soft)",
            fontWeight: 300,
            marginTop: 3,
            letterSpacing: "0.02em",
            fontFamily: "var(--sans)",
          }}
        >
          {procedure.description}
        </p>
      </div>

      {/* Book link */}
      <Link
        href={procedure.href ?? "/services"}
        style={{
          fontSize: 10.5,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--gold-text)",
          whiteSpace: "nowrap",
          textDecoration: "none",
          border: "1px solid var(--gold-soft)",
          padding: "9px 13px",
          borderRadius: 2,
          transition: "background 0.2s, color 0.2s",
          fontFamily: "var(--sans)",
        }}
      >
        Book
      </Link>
    </div>
  );
}
