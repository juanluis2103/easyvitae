// Iconos line-art reutilizables. Heredan el color con `currentColor`.
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function FileBase({ children }) {
  return (
    <svg {...base}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      {children}
    </svg>
  );
}

export const Icons = {
  mdToPdf: () => (
    <FileBase>
      <path d="M8 13h2l1.5 2L13 13h2" />
    </FileBase>
  ),
  pdfToMd: () => (
    <FileBase>
      <path d="M9 15l2 2 4-4" />
    </FileBase>
  ),
  mdToDocx: () => (
    <FileBase>
      <path d="M8 17l1.5-5L11 17l1.5-5L14 17" />
    </FileBase>
  ),
  pdfToDocx: () => (
    <FileBase>
      <path d="M9 13h6M9 17h6" />
    </FileBase>
  ),
  merge: () => (
    <svg {...base}>
      <rect x="3" y="3" width="9" height="9" rx="1.5" />
      <rect x="12" y="12" width="9" height="9" rx="1.5" />
      <path d="M12 7.5h4a1.5 1.5 0 0 1 1.5 1.5v3" />
    </svg>
  ),
  editor: () => (
    <svg {...base}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  ),
};
