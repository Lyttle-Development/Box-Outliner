const engraverWidth = 381;
const engraverHeight = 305;

function makePreviewSvg(svg) {
  const svgTag = svg.match(/<svg\b[^>]*>/)[0];
  const viewBox = svgTag.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  const [viewX, viewY, viewWidth, viewHeight] = viewBox;
  const bedX = viewX + (viewWidth - engraverWidth) / 2;
  const bedY = viewY + (viewHeight - engraverHeight) / 2;
  // Margin keeps the bed outline's stroke (1.6 mm wide, centred on the edge) from being clipped by the SVG viewport.
  const strokeMargin = 1.5;
  const previewX = Math.min(viewX, bedX) - strokeMargin;
  const previewY = Math.min(viewY, bedY) - strokeMargin;
  const previewRight = Math.max(viewX + viewWidth, bedX + engraverWidth) + strokeMargin;
  const previewBottom = Math.max(viewY + viewHeight, bedY + engraverHeight) + strokeMargin;
  const previewWidth = previewRight - previewX;
  const previewHeight = previewBottom - previewY;
  const updatedTag = svgTag
    .replace(/width="[^"]+"/, `width="${numberText(previewWidth)}mm"`)
    .replace(/height="[^"]+"/, `height="${numberText(previewHeight)}mm"`)
    .replace(/viewBox="[^"]+"/, `viewBox="${numberText(previewX)} ${numberText(previewY)} ${numberText(previewWidth)} ${numberText(previewHeight)}"`);
  const overlay = `<g class="engraver-overlay" pointer-events="none">
    <rect x="${numberText(bedX)}" y="${numberText(bedY)}" width="${engraverWidth}" height="${engraverHeight}" fill="none" stroke="#f08a24" stroke-width="2.2" stroke-dasharray="4 4"/>
    <rect x="${numberText(bedX)}" y="${numberText(bedY)}" width="${engraverWidth}" height="${engraverHeight}" fill="none" stroke="#202827" stroke-width="2.2" stroke-dasharray="4 4" stroke-dashoffset="-4"/>
    <text x="${numberText(bedX + 4)}" y="${numberText(bedY + 10)}" fill="#202827" stroke="#fbfbf9" stroke-width="1.5" paint-order="stroke" font-size="5" font-family="sans-serif">Max engraver area · 381 × 305 mm</text>
  </g>`;
  const body = svg.slice(svg.indexOf(svgTag) + svgTag.length, svg.lastIndexOf("</svg>"));
  // Preview only: the dieline is turned 180° about its centre so the lid logo reads correctly; the bed overlay stays upright. Downloads are unaffected.
  const dielineCentreX = viewX + viewWidth / 2;
  const dielineCentreY = viewY + viewHeight / 2;
  const rotatedBody = `<g transform="rotate(180 ${numberText(dielineCentreX)} ${numberText(dielineCentreY)})">${body}</g>`;
  return `${updatedTag}${rotatedBody}${overlay}</svg>`;
}
