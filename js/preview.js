const engraverWidth = 381;
const engraverHeight = 305;

function makePreviewSvg(svg) {
  const svgTag = svg.match(/<svg\b[^>]*>/)[0];
  const viewBox = svgTag.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  const [viewX, viewY, viewWidth, viewHeight] = viewBox;
  const bedX = viewX + (viewWidth - engraverWidth) / 2;
  const bedY = viewY + (viewHeight - engraverHeight) / 2;
  const previewX = Math.min(viewX, bedX);
  const previewY = Math.min(viewY, bedY);
  const previewRight = Math.max(viewX + viewWidth, bedX + engraverWidth);
  const previewBottom = Math.max(viewY + viewHeight, bedY + engraverHeight);
  const previewWidth = previewRight - previewX;
  const previewHeight = previewBottom - previewY;
  const updatedTag = svgTag
    .replace(/width="[^"]+"/, `width="${numberText(previewWidth)}mm"`)
    .replace(/height="[^"]+"/, `height="${numberText(previewHeight)}mm"`)
    .replace(/viewBox="[^"]+"/, `viewBox="${numberText(previewX)} ${numberText(previewY)} ${numberText(previewWidth)} ${numberText(previewHeight)}"`);
  const overlay = `<g class="engraver-overlay" pointer-events="none">
    <rect x="${numberText(bedX)}" y="${numberText(bedY)}" width="${engraverWidth}" height="${engraverHeight}" fill="none" stroke="#f08a24" stroke-width="0.8" stroke-dasharray="4 4"/>
    <rect x="${numberText(bedX)}" y="${numberText(bedY)}" width="${engraverWidth}" height="${engraverHeight}" fill="none" stroke="#202827" stroke-width="0.8" stroke-dasharray="4 4" stroke-dashoffset="-4"/>
    <text x="${numberText(bedX + 4)}" y="${numberText(bedY + 10)}" fill="#202827" stroke="#fbfbf9" stroke-width="1.5" paint-order="stroke" font-size="5" font-family="sans-serif">Max engraver area · 381 × 305 mm</text>
  </g>`;
  return svg.replace(svgTag, updatedTag).replace("</svg>", `${overlay}</svg>`);
}
