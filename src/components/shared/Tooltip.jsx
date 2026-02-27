export function Tooltip({ content }) {
  return (
    <span className="tooltip-wrapper">
      <span className="tooltip-trigger">?</span>
      <span className="tooltip-box">{content}</span>
    </span>
  );
}
