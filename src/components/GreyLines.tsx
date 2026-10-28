function AccentSlash() {
  return (
    <svg
      width="18"
      height="37"
      viewBox="0 0 18 37"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.86.554h-3.673L.148 36.736h3.673z" fill="currentColor" />
    </svg>
  );
}

export default function GreyLines({
  description,
  movement = false,
}: {
  description: string;
  movement?: boolean;
}) {
  const lines = description.split('<br />');
  return lines.map((line, index) => (
    <span className="grey-line" key={index}>
      {movement && index === 1 && <AccentSlash />}
      {line.startsWith('<br>') && <br />}
      {line.replace(/^<br>/, '')}
      {!movement && index === lines.length - 1 && <AccentSlash />}
    </span>
  ));
}
