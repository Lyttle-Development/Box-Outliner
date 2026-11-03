const numberText = (value) => Number(value.toFixed(3)).toString();
const pointKey = (point) => `${numberText(point[0])},${numberText(point[1])}`;
const edgeKey = (a, b) => [pointKey(a), pointKey(b)].sort().join("|");

function makeBoxSvg(width, length, height, includePerimeter = true, logo = null) {
  const w = width;
  const l = length;
  const h = height;
  const lidTop = -h - l;
  const tuckTip = lidTop - h;
  const tuckEarDepth = h * 0.9;
  const notchInset = 3;
  const tuckRx = tuckEarDepth - h * 0.25;
  const tuckRy = h / 2;
  const thumbR = h * 0.25;
  const thumbX = w / 2;
  const tuckOutline = [
    `M${numberText(-notchInset)},${numberText(lidTop)}`,
    `A${numberText(tuckRx)},${numberText(tuckRy)} 0 0 1 ${numberText(-notchInset)},${numberText(tuckTip)}`,
    `H0 H${numberText(thumbX - thumbR)} A${numberText(thumbR)},${numberText(thumbR)} 0 0 0 ${numberText(thumbX + thumbR)},${numberText(tuckTip)} H${numberText(w + notchInset)}`,
    `A${numberText(tuckRx)},${numberText(tuckRy)} 0 0 1 ${numberText(w + notchInset)},${numberText(lidTop)}`
  ].join(" ");
  const left = -2 * h;
  const right = w + 2 * h;
  const lidWingPoints = (side) => {
    const edgeX = side === "left" ? 0 : w;
    const sign = side === "left" ? -1 : 1;
    const arcSteps = 32;
    const points = [];
    for (let index = 0; index <= arcSteps; index += 1) {
      const t = ((Math.PI / 2) * index) / arcSteps;
      points.push([edgeX + sign * h * Math.sin(t), lidTop + h - h * Math.cos(t)]);
    }
    for (let index = 0; index <= arcSteps; index += 1) {
      const s = ((Math.PI / 2) * index) / arcSteps;
      points.push([edgeX + sign * h * Math.cos(s), -2 * h + h * Math.sin(s)]);
    }
    return points;
  };
  const notchCurves = [
    `M${numberText(-notchInset)},${numberText(lidTop)} L0,${numberText(lidTop)}`,
    `M${numberText(w)},${numberText(lidTop)} L${numberText(w + notchInset)},${numberText(lidTop)}`
  ];
  const sideLatchLength = l * 0.5;
  const sideLatchStart = (l - sideLatchLength) / 2;
  const sideLatchDepth = 4;
  const slotWidth = 1.5;
  const slotHeight = l * 0.5;
  const slotTop = (l - slotHeight) / 2;
  const slotBottom = slotTop + slotHeight;
  const slotEdges = [
    [[0, slotTop], [0, slotBottom]],
    [[w, slotTop], [w, slotBottom]]
  ];
  const polygons = [
    [[0, 0], [w, 0], [w, l], [0, l]],
    [[-h, 0], [0, 0], [0, l], [-h, l]],
    [[left, 0], [-h, 0], [-h, l], [left, l], [left, sideLatchStart + sideLatchLength], [left - sideLatchDepth, sideLatchStart + sideLatchLength], [left - sideLatchDepth, sideLatchStart], [left, sideLatchStart]],
    [[w, 0], [w + h, 0], [w + h, l], [w, l]],
    [[w + h, 0], [right, 0], [right, sideLatchStart], [right + sideLatchDepth, sideLatchStart], [right + sideLatchDepth, sideLatchStart + sideLatchLength], [right, sideLatchStart + sideLatchLength], [right, l], [w + h, l]],
    [[0, l], [w, l], [w, l + h], [0, l + h]],
    [[0, -h], [w, -h], [w, 0], [0, 0]],
    [[0, lidTop], [w, lidTop], [w, -h], [0, -h]],
    lidWingPoints("left"),
    lidWingPoints("right"),
    [[-h, -h], [0, -h], [0, 0], [-h, 0]],
    [[w, -h], [w + h, -h], [w + h, 0], [w, 0]],
    [[-h, l], [0, l], [0, l + h], [-h, l + h]],
    [[w, l], [w + h, l], [w + h, l + h], [w, l + h]]
  ];
  const folds = [
    [[0, 0], [0, slotTop]],
    [[0, slotBottom], [0, l]],
    [[w, 0], [w, slotTop]],
    [[w, slotBottom], [w, l]],
    [[-h, 0], [-h, l]],
    [[w + h, 0], [w + h, l]],
    [[0, 0], [w, 0]],
    [[0, l], [w, l]],
    [[0, -h], [w, -h]],
    [[0, lidTop], [w, lidTop]],
    [[0, tuckTip], [0, lidTop]],
    [[w, tuckTip], [w, lidTop]],
    [[0, lidTop], [0, -h]],
    [[w, lidTop], [w, -h]],
    [[0, -h], [0, 0]],
    [[w, -h], [w, 0]],
    [[0, l], [0, l + h]],
    [[w, l], [w, l + h]]
  ];

  const vertices = [...polygons.flat(), ...slotEdges.flat(), [0, tuckTip], [w, tuckTip]];
  const onSegment = (p, a, b) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const cross = (p[0] - a[0]) * dy - (p[1] - a[1]) * dx;
    if (Math.abs(cross) > 1e-7) return false;
    const dot = (p[0] - a[0]) * dx + (p[1] - a[1]) * dy;
    return dot >= -1e-7 && dot <= dx * dx + dy * dy + 1e-7;
  };
  const split = (a, b) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const lengthSquared = dx * dx + dy * dy;
    const ordered = vertices
      .filter((point) => onSegment(point, a, b))
      .map((point) => ({
        point,
        t: ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / lengthSquared
      }))
      .sort((first, second) => first.t - second.t)
      .reduce((unique, entry) => {
        if (!unique.length || Math.abs(entry.t - unique[unique.length - 1].t) > 1e-8) unique.push(entry);
        return unique;
      }, []);
    return ordered.slice(1).map((entry, index) => [ordered[index].point, entry.point]);
  };

  const foldKeys = new Set(folds.flatMap(([a, b]) => split(a, b).map(([start, end]) => edgeKey(start, end))));
  const slotEdgeKeys = new Set(slotEdges.flatMap(([a, b]) => split(a, b).map(([start, end]) => edgeKey(start, end))));
  const edges = new Map();
  polygons.forEach((polygon) => {
    polygon.forEach((point, index) => {
      const next = polygon[(index + 1) % polygon.length];
      split(point, next).forEach(([start, end]) => {
        const key = edgeKey(start, end);
        if (!edges.has(key)) edges.set(key, [start, end]);
      });
    });
  });

  const cutLines = [...edges.entries()]
    .filter(([key]) => !foldKeys.has(key) && !slotEdgeKeys.has(key))
    .map(([, [a, b]]) => `M${numberText(a[0])},${numberText(a[1])} L${numberText(b[0])},${numberText(b[1])}`)
    .join(" ");
  const foldLines = [...foldKeys]
    .map((key) => key.split("|").map((pair) => pair.split(",").map(Number)))
    .map(([a, b]) => `M${numberText(a[0])},${numberText(a[1])} L${numberText(b[0])},${numberText(b[1])}`)
    .join(" ");

  const logoMarkup = logo ? (() => {
    const scale = Math.min((w * 0.6) / logo.width, (l * 0.5) / logo.height);
    const centerX = w / 2;
    const centerY = -h - l / 2;
    return `<g transform="translate(${numberText(centerX - (logo.width * scale) / 2)} ${numberText(centerY - (logo.height * scale) / 2)}) scale(${numberText(scale)}) translate(${numberText(-logo.minX)} ${numberText(-logo.minY)})">${logo.body}</g>`;
  })() : "";

  const baseSlots = [
    `M0,${numberText(slotTop)} h${numberText(slotWidth)} v${numberText(slotHeight)} h-${numberText(slotWidth)} Z`,
    `M${numberText(w - slotWidth)},${numberText(slotTop)} h${numberText(slotWidth)} v${numberText(slotHeight)} h-${numberText(slotWidth)} Z`
  ];
  const svgPadding = 2;
  const frameInset = 1;
  const minX = left - sideLatchDepth - svgPadding;
  const maxX = right + sideLatchDepth + svgPadding;
  const minY = lidTop - h - svgPadding;
  const maxY = l + h + svgPadding;
  const svgWidth = maxX - minX;
  const svgHeight = maxY - minY;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${numberText(svgWidth)}mm" height="${numberText(svgHeight)}mm" viewBox="${numberText(minX)} ${numberText(minY)} ${numberText(svgWidth)} ${numberText(svgHeight)}">
  <title>Folding cardboard box dieline — inside ${numberText(w)} × ${numberText(l)} × ${numberText(h)} mm</title>
  <g fill="none" stroke="#ff0000" stroke-width="0.15" stroke-linecap="round" stroke-linejoin="round">
    ${includePerimeter ? `<rect x="${numberText(minX + frameInset)}" y="${numberText(minY + frameInset)}" width="${numberText(svgWidth - 2 * frameInset)}" height="${numberText(svgHeight - 2 * frameInset)}"/>` : ""}
    <path d="${cutLines}"/>
    <path d="${tuckOutline}"/>
    <path d="${notchCurves.join(" ")}"/>
    <path d="${baseSlots.join(" ")}"/>
  </g>
  <g fill="none" stroke="#000000" stroke-width="0.15" stroke-linecap="round" stroke-linejoin="round">
    <path d="${foldLines}"/>
    ${logoMarkup}
  </g>
</svg>`;
}
