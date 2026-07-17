type PositionProps = {
  content: {
    sectionTitle: string;
    bodyLines: string[];
  };
};

export default function Position({ content }: PositionProps) {
  return (
    <section id="position" className="section position-section" data-section="position">
      <div className="section-inner content-section">
        <h2 className="content-section-title">{content.sectionTitle}</h2>
        <div className="content-section-body" data-pointer-reveal>
          {content.bodyLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
