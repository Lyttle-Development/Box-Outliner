const inputs = {
  width: document.getElementById("width"),
  length: document.getElementById("length"),
  height: document.getElementById("height")
};
const unitSettings = {
  mm: { mmPerUnit: 1, step: "1", min: "1", max: "5000", range: "1 to 5,000 mm" },
  cm: { mmPerUnit: 10, step: "1", min: "0", max: "500", range: "0.1 to 500 cm" }
};
const unitRadios = document.querySelectorAll('input[name="unit"]');
const unitLabels = document.querySelectorAll(".unit");
let unit = document.querySelector('input[name="unit"]:checked').value;
let currentFileName = "box.svg";
const preview = document.getElementById("preview");
const notice = document.getElementById("notice");
const downloadButton = document.getElementById("download");
const resetButton = document.getElementById("reset");
const perimeterInput = document.getElementById("perimeter");
const splitInput = document.getElementById("split");
const partTabs = document.getElementById("part-tabs");
const partButtons = partTabs.querySelectorAll("[data-part]");
const logoInput = document.getElementById("logo");
const logoName = document.getElementById("logo-name");
let currentSvg = "";
let currentSvgs = {};
let currentDimensions = "";
let activePart = "top";
let currentLogo = null;

function toMm(value) {
  return Math.round(value * unitSettings[unit].mmPerUnit * 1000) / 1000;
}

function applyUnitSettings() {
  const settings = unitSettings[unit];
  Object.values(inputs).forEach((input) => {
    input.step = settings.step;
    input.min = settings.min;
    input.max = settings.max;
  });
  unitLabels.forEach((label) => { label.textContent = unit; });
}

function setUnit(nextUnit) {
  if (nextUnit === unit) return;
  const mmValues = Object.values(inputs).map((input) => input.valueAsNumber * unitSettings[unit].mmPerUnit);
  unit = nextUnit;
  applyUnitSettings();
  Object.values(inputs).forEach((input, index) => {
    const value = mmValues[index] / unitSettings[unit].mmPerUnit;
    if (Number.isFinite(value)) {
      input.value = unit === "mm" ? String(Math.round(value)) : String(Math.round(value * 10) / 10);
    }
  });
  updatePreview();
}

function resetToDefaults() {
  const defaults = { width: 150, length: 80, height: 40 };
  unit = "mm";
  unitRadios.forEach((radio) => { radio.checked = radio.value === unit; });
  applyUnitSettings();
  Object.entries(inputs).forEach(([key, input]) => { input.value = String(defaults[key]); });
  perimeterInput.checked = true;
  splitInput.checked = false;
  activePart = "top";
  logoInput.value = "";
  logoName.textContent = "logo.svg (default)";
  loadDefaultLogo();
}

function renderPreview() {
  const key = splitInput.checked ? activePart : "whole";
  currentSvg = currentSvgs[key] || "";
  currentFileName = `box-${currentDimensions}-mm${splitInput.checked ? `-part-${key}` : ""}.svg`;
  if (currentSvg) preview.innerHTML = makePreviewSvg(currentSvg);
  downloadButton.disabled = !currentSvg;
  downloadButton.textContent = splitInput.checked ? `Download part ${activePart === "top" ? 1 : 2} SVG` : "Download SVG";
  partButtons.forEach((button) => {
    const selected = button.dataset.part === activePart;
    button.setAttribute("aria-selected", String(selected));
    button.classList.toggle("active", selected);
  });
}

function updatePreview() {
  const rawValues = Object.values(inputs).map((input) => input.valueAsNumber);
  const mmValues = rawValues.map(toMm);
  const invalid = Object.values(inputs).some((input, index) => {
    const value = rawValues[index];
    const mm = mmValues[index];
    return !Number.isFinite(value) || mm < 1 || mm > 5000 || input.validity.badInput ||
      (unit === "mm" && !Number.isInteger(value));
  });
  if (invalid) {
    currentSvgs = {};
    currentSvg = "";
    partTabs.hidden = true;
    const wholeText = unit === "mm" ? "whole number" : "number";
    preview.innerHTML = `<p class="empty-state">Enter a ${wholeText} from ${unitSettings[unit].range} for each dimension to see your dieline.</p>`;
    notice.textContent = `Dimensions must be ${unit === "mm" ? "whole millimetres" : "numbers"} between ${unitSettings[unit].range}.`;
    downloadButton.disabled = true;
    return;
  }

  const includePerimeter = perimeterInput.checked;
  currentDimensions = mmValues.join("x");
  if (splitInput.checked) {
    currentSvgs = {
      top: makeBoxSvg(...mmValues, includePerimeter, currentLogo, "top"),
      bottom: makeBoxSvg(...mmValues, includePerimeter, currentLogo, "bottom")
    };
  } else {
    currentSvgs = { whole: makeBoxSvg(...mmValues, includePerimeter, currentLogo) };
  }
  partTabs.hidden = !splitInput.checked;
  notice.textContent = "";
  renderPreview();
}

async function loadDefaultLogo() {
  let message = "";
  try {
    const response = await fetch("./logo.svg");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    currentLogo = parseLogo(await response.text());
    if (!currentLogo) message = "logo.svg has no usable viewBox; no logo was engraved.";
  } catch {
    currentLogo = null;
    message = "Could not load ./logo.svg (browsers block this when opened from disk). Serve the folder or choose a logo file.";
  }
  updatePreview();
  notice.textContent = message;
}

logoInput.addEventListener("change", async () => {
  const file = logoInput.files[0];
  if (!file) {
    logoName.textContent = "logo.svg (default)";
    return loadDefaultLogo();
  }
  logoName.textContent = file.name;
  currentLogo = parseLogo(await file.text());
  updatePreview();
  notice.textContent = currentLogo ? "" : "The selected file has no usable viewBox; no logo was engraved.";
});

Object.values(inputs).forEach((input) => input.addEventListener("input", updatePreview));
unitRadios.forEach((radio) => radio.addEventListener("change", () => setUnit(radio.value)));
perimeterInput.addEventListener("change", updatePreview);
splitInput.addEventListener("change", updatePreview);
partButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activePart = button.dataset.part;
    renderPreview();
  });
});
resetButton.addEventListener("click", resetToDefaults);
downloadButton.addEventListener("click", () => {
  if (!currentSvg) return;
  const blob = new Blob([currentSvg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = currentFileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

updatePreview();
loadDefaultLogo();
