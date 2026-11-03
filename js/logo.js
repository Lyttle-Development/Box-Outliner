function parseLogo(text) {
  const tag = text.match(/<svg\b[^>]*>/);
  const viewBox = tag && tag[0].match(/viewBox="([^"]+)"/);
  if (!viewBox) return null;
  const [minX, minY, width, height] = viewBox[1].split(/[\s,]+/).map(Number);
  if (![minX, minY, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return null;
  const body = text.slice(text.indexOf(tag[0]) + tag[0].length, text.lastIndexOf("</svg>"));
  return { minX, minY, width, height, body };
}
