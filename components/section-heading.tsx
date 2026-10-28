type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="mb-8">
      {eyebrow ? (
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</div>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h2>
      {description ? <p className="mt-3 max-w-2xl text-base text-slate-600">{description}</p> : null}
    </div>
  );
}
