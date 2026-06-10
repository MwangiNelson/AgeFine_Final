import Link from "next/link";

interface Procedure {
  name: string;
  description: string;
  href?: string;
}

export default function ProcedureItem({ procedure }: { procedure: Procedure }) {
  return (
    <div
      className="flex items-center gap-4 py-[18px] md:flex-col md:items-start md:gap-5 md:py-8 md:px-7 md:rounded-xl md:bg-ivory md:border md:transition-shadow md:hover:shadow-[0_18px_40px_rgba(60,35,49,0.08)]"
      style={{ borderColor: "var(--line)", borderBottom: "0.5px solid var(--line)" }}
    >
      {/* Thumbnail */}
      <div
        className="flex-none w-16 h-16 rounded-full md:w-20 md:h-20"
        style={{ background: "linear-gradient(150deg, var(--cream), var(--blush))" }}
        aria-hidden="true"
      />

      <div className="flex-1 md:w-full">
        <h3 className="font-serif font-medium text-plum leading-[1.1] text-[20px] md:text-[24px]">
          {procedure.name}
        </h3>
        <p className="font-sans font-light text-plum-soft mt-1 md:mt-2 tracking-[0.02em] text-[11.5px] md:text-sm">
          {procedure.description}
        </p>
      </div>

      <Link
        href={procedure.href ?? "/services"}
        aria-label={`Book ${procedure.name}`}
        className="btn btn-outline flex-none text-[10.5px] md:text-[11px] md:mt-2 px-3 py-2 md:px-5"
      >
        Book
      </Link>
    </div>
  );
}
