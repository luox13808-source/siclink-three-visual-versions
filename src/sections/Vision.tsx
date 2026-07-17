type VisionProps = {
  content: {
    sectionTitle: string;
    headline: string;
    bodyLines: string[];
  };
};

export default function Vision({ content }: VisionProps) {
  return (
    <section id="vision" className="section vision-section" data-section="vision">
      <div className="section-inner content-section">
        <h2 className="content-section-title">{content.sectionTitle}</h2>
        <p className="content-section-headline" data-pointer-reveal>
          {content.headline}
        </p>
        <div className="content-section-body" data-pointer-reveal>
          {content.bodyLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
