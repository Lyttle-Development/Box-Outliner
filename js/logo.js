const LOGO_COLOR = "#808080";
const COLOR_ATTRIBUTES = new Set([
  "fill",
  "stroke",
  "color",
  "stop-color",
  "flood-color",
  "lighting-color",
  "solid-color",
  "viewport-fill",
  "background-color",
  "border-color",
  "outline-color",
  "text-decoration-color",
  "column-rule-color",
  "caret-color",
  "accent-color"
]);

function useHexGray(value) {
  return value.replace(/rgb\(\s*128,\s*128,\s*128\s*\)/gi, LOGO_COLOR);
}

function normalizeColorValue(property, value) {
  const normalized = value.trim().toLowerCase();
  if ((property === "fill" || property === "stroke") && normalized === "none") return value;
  if (["inherit", "initial", "unset", "revert", "revert-layer"].includes(normalized)) return value;
  return LOGO_COLOR;
}

function normalizeColorDeclarations(declarations) {
  COLOR_ATTRIBUTES.forEach((property) => {
    const value = declarations.getPropertyValue(property);
    if (value) {
      declarations.setProperty(
        property,
        normalizeColorValue(property, value),
        declarations.getPropertyPriority(property)
      );
    }
  });
}

function normalizeStyleRules(rules) {
  Array.from(rules).forEach((rule) => {
    if (rule.style) normalizeColorDeclarations(rule.style);
    if (rule.cssRules) normalizeStyleRules(rule.cssRules);
  });
}

function normalizeLogoColors(svg) {
  [svg, ...svg.querySelectorAll("*")].forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      if (COLOR_ATTRIBUTES.has(name)) {
        element.setAttribute(attribute.name, normalizeColorValue(name, attribute.value));
      }
    });
    normalizeColorDeclarations(element.style);
    if (element.hasAttribute("style")) {
      element.setAttribute("style", useHexGray(element.getAttribute("style")));
    }
  });

  svg.querySelectorAll("link").forEach((link) => link.remove());
  svg.querySelectorAll("style").forEach((style) => {
    const sheet = style.sheet;
    const rules = sheet && sheet.cssRules;
    if (!rules) {
      style.remove();
      return;
    }
    for (let index = rules.length - 1; index >= 0; index -= 1) {
      if (rules[index].type === CSSRule.IMPORT_RULE) sheet.deleteRule(index);
    }
    normalizeStyleRules(sheet.cssRules);
    style.textContent = useHexGray(Array.from(sheet.cssRules).map((rule) => rule.cssText).join("\n"));
  });
}

function parseLogo(text) {
  const parsed = new DOMParser().parseFromString(text, "image/svg+xml");
  const svg = parsed.documentElement;
  if (svg.localName !== "svg" || parsed.querySelector("parsererror")) return null;
  const viewBox = svg.getAttribute("viewBox");
  if (!viewBox) return null;
  const [minX, minY, width, height] = viewBox.split(/[\s,]+/).map(Number);
  if (![minX, minY, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return null;

  normalizeLogoColors(svg);
  const artwork = parsed.createElementNS(svg.namespaceURI, "g");
  Array.from(svg.attributes).forEach((attribute) => {
    const name = attribute.name.toLowerCase();
    if (name !== "viewbox" && name !== "width" && name !== "height" &&
        name !== "xmlns" && !name.startsWith("xmlns:")) {
      artwork.setAttribute(attribute.name, attribute.value);
    }
  });
  while (svg.firstChild) artwork.appendChild(svg.firstChild);
  return { minX, minY, width, height, body: new XMLSerializer().serializeToString(artwork) };
}
