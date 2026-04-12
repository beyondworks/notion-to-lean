interface SlideCardProps {
  coverGradient: string;
  coverTag: string;
  coverTagColor: string;
  title: string;
  desc: string;
  tags: { label: string; className: string }[];
}

export default function SlideCard({
  coverGradient,
  coverTag,
  coverTagColor,
  title,
  desc,
  tags,
}: SlideCardProps) {
  return (
    <div className="n-card">
      <div className="n-card-cover" style={{ background: coverGradient }}>
        <span className="cover-tag" style={{ color: coverTagColor }}>
          {coverTag}
        </span>
      </div>
      <div className="n-card-title">{title}</div>
      <div className="n-card-desc">{desc}</div>
      <div className="n-card-tags">
        {tags.map((t, i) => (
          <span key={i} className={t.className}>
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}
