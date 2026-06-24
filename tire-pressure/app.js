import "basecoat-css/dist/js/basecoat.js";
import "basecoat-css/dist/js/select.js";
import { calculateWheelPressures } from "./calculation.js";
import { RIDE_STYLE_ICONS, SURFACE_ICONS } from "./condition-icons.js";
import {
	casingLabels,
	INNER_RIM_WIDTH_DEFAULT,
	INNER_RIM_WIDTH_MAX,
	INNER_RIM_WIDTH_MIN,
	nameLabelMaps,
	rideLabels,
	rideStyleOrder,
	rimLabels,
	surfaceLabels,
	surfaceOrder,
	wheelDiameterLabels,
	wheelDiameterOrder,
} from "./labels.js";
import {
	createSavedCalculation,
	deleteSavedCalculation,
	findSavedCalculation,
	parseSavedCalculations,
	STORAGE_KEY,
	serializeSavedCalculations,
	suggestCalculationName,
	updateSavedCalculation,
} from "./saved-calculations.js";
import { buildShareUrl, parseShareFromSearch } from "./share-url.js";
import { initTheme } from "./theme.js";
import {
	formatTireWidth,
	RIDE_STYLE,
	RIM_TYPE,
	SURFACE,
	snapTireWidthMm,
	TIRE_CASING,
	tireWidthSliderIndex,
	tireWidthSliderSteps,
	tireWidthStepToMm,
} from "./tire-pressure.js";

const rideStyleGroupEl = document.getElementById("rideStyleGroup");
const rimTypeEl = document.getElementById("rimType");
const wheelDiameterEl = document.getElementById("wheelDiameter");
const tireCasingEl = document.getElementById("tireCasing");
const surfaceGroupEl = document.getElementById("surfaceGroup");
const formEl = document.getElementById("f");

const SELECT_CHEVRON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground opacity-50 shrink-0" aria-hidden="true"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>`;

function escapeHtml(text) {
	return String(text)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

function renderBasecoatSelect(
	container,
	{ name, labels, order, defaultValue },
) {
	const id = container.id;
	const defaultVal = defaultValue ?? order[0];
	const defaultLabel = labels[defaultVal] ?? String(defaultVal);
	const optionsHtml = order
		.map((value) => {
			const selected = value === defaultVal ? ' aria-selected="true"' : "";
			const label = labels[value];
			return `<div role="option" data-value="${escapeHtml(String(value))}" data-label="${escapeHtml(label)}"${selected}>${escapeHtml(label)}</div>`;
		})
		.join("");

	container.innerHTML = `
    <button type="button" class="btn-outline w-full" id="${id}-trigger" aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}-listbox">
      <span class="truncate">${escapeHtml(defaultLabel)}</span>
      ${SELECT_CHEVRON}
    </button>
    <div id="${id}-popover" data-popover aria-hidden="true">
      <div role="listbox" id="${id}-listbox" aria-orientation="vertical" aria-labelledby="${id}-trigger">
        ${optionsHtml}
      </div>
    </div>
    <input type="hidden" name="${name}" value="${escapeHtml(String(defaultVal))}" />
  `;
}

function getSelectValue(el) {
	if (el.dataset.selectInitialized) return el.value;
	return el.querySelector(':scope > input[type="hidden"]')?.value ?? "";
}

function setSelectValue(el, value, fallback) {
	const str = String(value);
	const apply = () => {
		const values = Array.from(el.querySelectorAll('[role="option"]')).map(
			(option) => option.dataset.value,
		);
		el.value = values.includes(str) ? str : String(fallback);
	};
	if (el.dataset.selectInitialized) apply();
	else el.addEventListener("basecoat:initialized", apply, { once: true });
}

function initBasecoatSelects() {
	window.basecoat?.init("select");
}

function renderIconRadioGroup(
	container,
	{ name, labels, icons, order, defaultValue },
) {
	container.innerHTML = order
		.map((value, index) => {
			const id = `${name}-${value}`;
			const checked = value === defaultValue ? " checked" : "";
			const required = index === 0 ? " required" : "";
			return `
        <label class="icon-radio-tile" for="${id}">
          <input type="radio" id="${id}" name="${name}" value="${value}"${checked}${required} />
          <span class="icon-radio-tile__icon">${icons[value] ?? ""}</span>
          <span class="icon-radio-tile__label">${labels[value]}</span>
        </label>`;
		})
		.join("");
}

function getRadioGroupValue(name) {
	const checked = formEl.querySelector(`input[name="${name}"]:checked`);
	return checked ? checked.value : "";
}

function setRadioGroupValue(name, value) {
	const input = formEl.querySelector(`input[name="${name}"][value="${value}"]`);
	if (input) input.checked = true;
}

renderIconRadioGroup(rideStyleGroupEl, {
	name: "rideStyle",
	labels: rideLabels,
	icons: RIDE_STYLE_ICONS,
	order: rideStyleOrder,
	defaultValue: RIDE_STYLE.ROAD,
});
renderIconRadioGroup(surfaceGroupEl, {
	name: "surface",
	labels: surfaceLabels,
	icons: SURFACE_ICONS,
	order: surfaceOrder,
	defaultValue: SURFACE.DRY,
});

renderBasecoatSelect(rimTypeEl, {
	name: "rimType",
	labels: rimLabels,
	order: Object.keys(rimLabels),
	defaultValue: RIM_TYPE.TUBES,
});
renderBasecoatSelect(wheelDiameterEl, {
	name: "wheelDiameter",
	labels: wheelDiameterLabels,
	order: wheelDiameterOrder,
	defaultValue: wheelDiameterOrder[0],
});
renderBasecoatSelect(tireCasingEl, {
	name: "tireCasing",
	labels: casingLabels,
	order: Object.keys(casingLabels),
	defaultValue: TIRE_CASING.STANDARD,
});
initBasecoatSelects();

const resultEl = document.getElementById("result");
const disclaimerEl = document.getElementById("disclaimer");
const saveNameEl = document.getElementById("saveName");
const saveCalcBtn = document.getElementById("saveCalcBtn");
const shareCalcBtn = document.getElementById("shareCalcBtn");
const saveAsNewBtn = document.getElementById("saveAsNewBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const saveCalcHintEl = document.getElementById("saveCalcHint");

const frontWidthEl = document.getElementById("frontWidth");
const rearWidthEl = document.getElementById("rearWidth");
const frontWidthValueEl = document.getElementById("frontWidthValue");
const rearWidthValueEl = document.getElementById("rearWidthValue");
const innerRimWidthEl = document.getElementById("innerRimWidth");
const innerRimWidthValueEl = document.getElementById("innerRimWidthValue");

let savedCalculations = loadSavedCalculations();
let editingId = null;
let lastResults = null;
let saveNameDirty = false;
let programmaticNameUpdate = false;
let shareHintTimer = null;
let shareToastEl = null;

function updateSliderFill(sliderEl) {
	const min = Number(sliderEl.min || 0);
	const max = Number(sliderEl.max || 100);
	const value = Number(sliderEl.value);
	const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
	sliderEl.style.setProperty("--slider-value", `${percent}%`);
}

function clampInnerRimWidthMm(mm) {
	return Math.min(
		INNER_RIM_WIDTH_MAX,
		Math.max(INNER_RIM_WIDTH_MIN, Math.round(mm)),
	);
}

function updateInnerRimWidthDisplay() {
	const mm = Number(innerRimWidthEl.value);
	const label = `${mm}мм`;
	innerRimWidthValueEl.textContent = label;
	innerRimWidthEl.setAttribute("aria-valuetext", label);
	updateSliderFill(innerRimWidthEl);
}

function setInnerRimWidthMm(mm) {
	innerRimWidthEl.value = clampInnerRimWidthMm(mm);
	updateInnerRimWidthDisplay();
}

function tireWidthMmFromSlider(sliderEl, rideStyle) {
	const steps = tireWidthSliderSteps(rideStyle);
	const stepValue = steps[Number(sliderEl.value)];
	return tireWidthStepToMm(stepValue, rideStyle);
}

function updateWidthSliderDisplay(sliderEl, outputEl, rideStyle) {
	const widthMm = tireWidthMmFromSlider(sliderEl, rideStyle);
	sliderEl.dataset.widthMm = String(widthMm);
	const label = formatTireWidth(widthMm, rideStyle);
	outputEl.textContent = label;
	sliderEl.setAttribute("aria-valuetext", label);
	updateSliderFill(sliderEl);
}

function configureWidthSlider(sliderEl, outputEl, rideStyle, widthMm) {
	const steps = tireWidthSliderSteps(rideStyle);
	const snappedMm = snapTireWidthMm(widthMm, rideStyle);
	sliderEl.min = 0;
	sliderEl.max = Math.max(0, steps.length - 1);
	sliderEl.step = 1;
	sliderEl.value = tireWidthSliderIndex(snappedMm, rideStyle);
	updateWidthSliderDisplay(sliderEl, outputEl, rideStyle);
}

function syncAllWidthSliders(rideStyle) {
	const frontMm = Number(frontWidthEl.dataset.widthMm || 28);
	const rearMm = Number(rearWidthEl.dataset.widthMm || 28);
	configureWidthSlider(frontWidthEl, frontWidthValueEl, rideStyle, frontMm);
	configureWidthSlider(rearWidthEl, rearWidthValueEl, rideStyle, rearMm);
}

function onWidthSliderInput(sliderEl, outputEl) {
	updateWidthSliderDisplay(sliderEl, outputEl, getRadioGroupValue("rideStyle"));
}

frontWidthEl.addEventListener("input", () =>
	onWidthSliderInput(frontWidthEl, frontWidthValueEl),
);
rearWidthEl.addEventListener("input", () =>
	onWidthSliderInput(rearWidthEl, rearWidthValueEl),
);
rideStyleGroupEl.addEventListener("change", () =>
	syncAllWidthSliders(getRadioGroupValue("rideStyle")),
);

innerRimWidthEl.addEventListener("input", updateInnerRimWidthDisplay);
setInnerRimWidthMm(INNER_RIM_WIDTH_DEFAULT);

syncAllWidthSliders(getRadioGroupValue("rideStyle"));

function buildSuggestedName(inputs) {
	return suggestCalculationName(inputs, nameLabelMaps());
}

function applySuggestedName(inputs) {
	programmaticNameUpdate = true;
	saveNameEl.value = buildSuggestedName(inputs);
	programmaticNameUpdate = false;
}

function maybeApplySuggestedName(inputs) {
	if (editingId || saveNameDirty) return;
	applySuggestedName(inputs);
}

saveNameEl.addEventListener("input", () => {
	if (!programmaticNameUpdate) saveNameDirty = true;
});

function resolveSaveName(inputs) {
	const trimmed = saveNameEl.value.trim();
	return trimmed || buildSuggestedName(inputs);
}

function loadSavedCalculations() {
	return parseSavedCalculations(localStorage.getItem(STORAGE_KEY));
}

function persistSavedCalculations() {
	localStorage.setItem(
		STORAGE_KEY,
		serializeSavedCalculations(savedCalculations),
	);
}

function readFormInputs() {
	const rideStyle = getRadioGroupValue("rideStyle");
	return {
		riderWeight: Number(document.getElementById("riderWeight").value),
		bikeWeight: Number(document.getElementById("bikeWeight").value),
		innerRimWidth: Number(innerRimWidthEl.value),
		wheelDiameter: Number(getSelectValue(wheelDiameterEl)),
		rimType: getSelectValue(rimTypeEl),
		rideStyle,
		frontWidthMm: tireWidthMmFromSlider(frontWidthEl, rideStyle),
		rearWidthMm: tireWidthMmFromSlider(rearWidthEl, rideStyle),
		tireCasing: getSelectValue(tireCasingEl),
		surface: getRadioGroupValue("surface"),
	};
}

function applyFormInputs(inputs) {
	document.getElementById("riderWeight").value = inputs.riderWeight;
	document.getElementById("bikeWeight").value = inputs.bikeWeight;
	setInnerRimWidthMm(inputs.innerRimWidth);
	setSelectValue(wheelDiameterEl, inputs.wheelDiameter, wheelDiameterOrder[0]);
	setSelectValue(rimTypeEl, inputs.rimType, RIM_TYPE.TUBES);
	setRadioGroupValue("rideStyle", inputs.rideStyle);
	setSelectValue(tireCasingEl, inputs.tireCasing, TIRE_CASING.STANDARD);
	setRadioGroupValue("surface", inputs.surface);
	configureWidthSlider(
		frontWidthEl,
		frontWidthValueEl,
		inputs.rideStyle,
		inputs.frontWidthMm,
	);
	configureWidthSlider(
		rearWidthEl,
		rearWidthValueEl,
		inputs.rideStyle,
		inputs.rearWidthMm,
	);
}

function warningAlert(message) {
	return `<div class="alert alert-destructive" role="status"><section>${escapeHtml(message)}</section></div>`;
}

function calculateFromInputs(inputs) {
	const { warnings, ...pressures } = calculateWheelPressures(inputs);
	return {
		...pressures,
		warnHtml: warnings.map(warningAlert).join(""),
	};
}

function renderResults(results) {
	document.getElementById("frontPsi").textContent = results.frontPsi.toFixed(1);
	document.getElementById("rearPsi").textContent = results.rearPsi.toFixed(1);
	document.getElementById("frontBar").textContent =
		`${results.frontBar.toFixed(2)} бар`;
	document.getElementById("rearBar").textContent =
		`${results.rearBar.toFixed(2)} бар`;
	document.getElementById("warnings").innerHTML = results.warnHtml;
	resultEl.hidden = false;
	if (disclaimerEl) disclaimerEl.hidden = false;
}

function runCalculation() {
	const inputs = readFormInputs();
	lastResults = calculateFromInputs(inputs);
	renderResults(lastResults);
	maybeApplySuggestedName(inputs);
	return lastResults;
}

function formatSavedMeta(entry) {
	const { inputs } = entry;
	const style = rideLabels[inputs.rideStyle] ?? inputs.rideStyle;
	const surface = surfaceLabels[inputs.surface] ?? inputs.surface;
	const front = formatTireWidth(inputs.frontWidthMm, inputs.rideStyle);
	const rear = formatTireWidth(inputs.rearWidthMm, inputs.rideStyle);
	return `${style} · перед ${front} · зад ${rear} · ${surface}`;
}

function formatSavedDate(iso) {
	return new Date(iso).toLocaleString("ru-RU", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function setEditingMode(id) {
	hideShareToast();
	editingId = id;
	if (id) {
		const entry = findSavedCalculation(savedCalculations, id);
		saveCalcBtn.textContent = "Обновить расчёт";
		saveAsNewBtn.hidden = false;
		cancelEditBtn.hidden = false;
		saveCalcHintEl.hidden = false;
		saveCalcHintEl.textContent = entry
			? `Редактирование «${entry.name}». Обновите текущий расчёт или сохраните как новый.`
			: "";
		saveNameDirty = true;
		if (entry) saveNameEl.value = entry.name;
	} else {
		saveCalcBtn.textContent = "Сохранить расчёт";
		saveAsNewBtn.hidden = true;
		cancelEditBtn.hidden = true;
		saveCalcHintEl.hidden = true;
		saveCalcHintEl.textContent = "";
		saveNameDirty = false;
		if (lastResults) maybeApplySuggestedName(readFormInputs());
		else saveNameEl.value = "";
	}
}

function getSavedListEl() {
	return document.getElementById("savedList");
}

function getSavedSectionEl() {
	return (
		document.getElementById("savedSection") ??
		getSavedListEl()?.closest("section.card") ??
		null
	);
}

function renderSavedList() {
	savedCalculations = loadSavedCalculations();
	const sorted = [...savedCalculations].sort(
		(a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
	);
	const sectionEl = getSavedSectionEl();
	const listEl = getSavedListEl();

	if (sorted.length === 0) {
		if (sectionEl) sectionEl.hidden = true;
		if (listEl) listEl.innerHTML = "";
		return;
	}

	if (sectionEl) sectionEl.hidden = false;
	if (!listEl) return;
	listEl.innerHTML = sorted
		.map(
			(entry) => `
        <li class="card saved-item !gap-4 !py-4" data-id="${entry.id}">
          <header class="flex flex-wrap items-baseline justify-between gap-2 !px-6 !pb-0">
            <h3 class="text-base font-semibold leading-none">${escapeHtml(entry.name)}</h3>
            <time class="text-muted-foreground text-sm" datetime="${entry.updatedAt}">${formatSavedDate(entry.updatedAt)}</time>
          </header>
          <section class="!px-6">
            <p class="text-muted-foreground text-sm">${escapeHtml(formatSavedMeta(entry))}</p>
            ${
							entry.results
								? `<p class="text-muted-foreground mt-2 font-mono text-sm tabular-nums">${entry.results.frontPsi.toFixed(1)} / ${entry.results.rearPsi.toFixed(1)} psi · ${entry.results.frontBar.toFixed(2)} / ${entry.results.rearBar.toFixed(2)} бар</p>`
								: ""
						}
          </section>
          <footer class="flex flex-wrap gap-2 !px-6 !pt-0">
            <button type="button" class="btn-ghost btn-sm" data-action="edit">Изменить</button>
            <button type="button" class="btn-outline btn-sm" data-action="share">Поделиться</button>
            <button type="button" class="btn-destructive btn-sm" data-action="delete">Удалить</button>
          </footer>
        </li>`,
		)
		.join("");
}

function saveCurrentCalculation({ asNew = false } = {}) {
	const inputs = readFormInputs();
	lastResults = runCalculation();
	const name = resolveSaveName(inputs);
	try {
		if (editingId && !asNew) {
			savedCalculations = updateSavedCalculation(
				savedCalculations,
				editingId,
				name,
				inputs,
				lastResults,
			);
		} else {
			savedCalculations = createSavedCalculation(
				savedCalculations,
				name,
				inputs,
				lastResults,
			);
		}
		persistSavedCalculations();
		setEditingMode(null);
		renderSavedList();
	} catch (err) {
		saveCalcHintEl.hidden = false;
		saveCalcHintEl.textContent = err.message;
	}
}

function startEditSaved(id) {
	const entry = findSavedCalculation(savedCalculations, id);
	if (!entry) return;
	applyFormInputs(entry.inputs);
	lastResults = entry.results ?? calculateFromInputs(entry.inputs);
	renderResults(lastResults);
	setEditingMode(id);
	saveNameEl.focus();
	formEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function removeSaved(id) {
	const entry = findSavedCalculation(savedCalculations, id);
	if (!entry) return;
	if (!window.confirm(`Удалить расчёт «${entry.name}»?`)) return;
	savedCalculations = deleteSavedCalculation(savedCalculations, id);
	persistSavedCalculations();
	if (editingId === id) setEditingMode(null);
	renderSavedList();
}

function hideShareToast() {
	if (shareHintTimer) {
		clearTimeout(shareHintTimer);
		shareHintTimer = null;
	}
	if (!shareToastEl) return;
	shareToastEl.hidden = true;
	shareToastEl.textContent = "";
}

function positionShareToast(anchorEl) {
	if (!shareToastEl || !anchorEl) return;
	const rect = anchorEl.getBoundingClientRect();
	shareToastEl.hidden = false;
	const toastHeight = shareToastEl.offsetHeight;
	const toastWidth = shareToastEl.offsetWidth;
	const gap = 8;
	let top = rect.top - gap - toastHeight;
	if (top < gap) top = rect.bottom + gap;
	let left = rect.left + rect.width / 2 - toastWidth / 2;
	left = Math.max(gap, Math.min(left, window.innerWidth - toastWidth - gap));
	shareToastEl.style.left = `${left}px`;
	shareToastEl.style.top = `${top}px`;
}

function showShareToast(anchorEl, message, { autoHideMs = 3000 } = {}) {
	if (!anchorEl) return;
	hideShareToast();
	if (!shareToastEl) {
		shareToastEl = document.createElement("div");
		shareToastEl.id = "shareToast";
		shareToastEl.className = "share-toast";
		shareToastEl.setAttribute("role", "status");
		shareToastEl.hidden = true;
		document.body.appendChild(shareToastEl);
	}
	shareToastEl.textContent = message;
	positionShareToast(anchorEl);
	requestAnimationFrame(() => positionShareToast(anchorEl));
	if (autoHideMs > 0) {
		shareHintTimer = setTimeout(hideShareToast, autoHideMs);
	}
}

function showStatusHint(message) {
	if (!saveCalcHintEl) return;
	saveCalcHintEl.hidden = false;
	saveCalcHintEl.className = "text-muted-foreground mt-2 text-sm";
	saveCalcHintEl.textContent = message;
}

function canUseNativeShare(url) {
	if (typeof navigator.share !== "function") return false;
	if (window.matchMedia("(pointer: fine)").matches) return false;
	if (typeof navigator.canShare === "function") {
		try {
			return navigator.canShare({ url });
		} catch {
			return false;
		}
	}
	return true;
}

function copyTextToClipboardSync(text) {
	const textarea = document.createElement("textarea");
	textarea.value = text;
	textarea.setAttribute("readonly", "");
	textarea.style.position = "fixed";
	textarea.style.left = "-9999px";
	document.body.appendChild(textarea);
	textarea.focus();
	textarea.select();
	let copied = false;
	try {
		copied = document.execCommand("copy");
	} catch {
		copied = false;
	}
	textarea.remove();
	return copied;
}

function shareLink(url, name, anchorEl) {
	const shareTitle = "Давление в шинах";
	const shareText = name
		? `Расчёт «${name}»`
		: "Рекомендуемое давление в покрышках";

	if (canUseNativeShare(url)) {
		navigator
			.share({ title: shareTitle, text: shareText, url })
			.then(() => showShareToast(anchorEl, "Ссылка отправлена"))
			.catch((err) => {
				if (err?.name !== "AbortError") copyShareLinkOnDesktop(url, anchorEl);
			});
		return;
	}

	copyShareLinkOnDesktop(url, anchorEl);
}

function copyShareLinkOnDesktop(url, anchorEl) {
	const showCopied = () =>
		showShareToast(anchorEl, "Ссылка скопирована", { autoHideMs: 3000 });
	const showFailed = () =>
		showShareToast(anchorEl, "Не удалось скопировать ссылку", {
			autoHideMs: 3000,
		});

	if (navigator.clipboard?.writeText) {
		navigator.clipboard.writeText(url).then(showCopied, () => {
			if (copyTextToClipboardSync(url)) showCopied();
			else showFailed();
		});
		return;
	}

	if (copyTextToClipboardSync(url)) showCopied();
	else showFailed();
}

function shareCalculation(inputs, name, anchorEl) {
	try {
		shareLink(buildShareUrl(inputs, { name }), name, anchorEl);
	} catch (err) {
		console.error("Share failed", err);
		showShareToast(anchorEl, "Не удалось создать ссылку", { autoHideMs: 3000 });
	}
}

function shareCurrentCalculation(anchorEl) {
	if (!lastResults || resultEl.hidden) runCalculation();
	const inputs = readFormInputs();
	shareCalculation(inputs, resolveSaveName(inputs), anchorEl ?? shareCalcBtn);
}

function applyShareFromUrl() {
	const shared = parseShareFromSearch(window.location.search);
	if (!shared) return false;

	applyFormInputs(shared.inputs);
	lastResults = calculateFromInputs(shared.inputs);
	renderResults(lastResults);
	if (shared.name) {
		saveNameDirty = true;
		saveNameEl.value = shared.name;
	} else {
		maybeApplySuggestedName(shared.inputs);
	}
	window.history.replaceState(null, "", window.location.pathname);
	showStatusHint("Расчёт открыт по ссылке");
	requestAnimationFrame(() => {
		resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
	});
	return true;
}

formEl.addEventListener("submit", (ev) => {
	ev.preventDefault();
	runCalculation();
});

formEl.addEventListener("input", () => {
	if (lastResults && !resultEl.hidden) {
		maybeApplySuggestedName(readFormInputs());
	}
});

formEl.addEventListener("change", () => {
	if (lastResults && !resultEl.hidden) {
		maybeApplySuggestedName(readFormInputs());
	}
});

saveCalcBtn.addEventListener("click", () => saveCurrentCalculation());
shareCalcBtn?.addEventListener("click", (ev) =>
	shareCurrentCalculation(ev.currentTarget),
);
saveAsNewBtn.addEventListener("click", () =>
	saveCurrentCalculation({ asNew: true }),
);
cancelEditBtn.addEventListener("click", () => setEditingMode(null));

function handleSavedListClick(ev) {
	const button = ev.target.closest("button[data-action]");
	if (!button) return;
	const item = button.closest(".saved-item");
	if (!item) return;
	const id = item.dataset.id;
	if (button.dataset.action === "edit") startEditSaved(id);
	if (button.dataset.action === "share") {
		const entry = findSavedCalculation(savedCalculations, id);
		if (entry) shareCalculation(entry.inputs, entry.name, button);
	}
	if (button.dataset.action === "delete") removeSaved(id);
}

function bindSavedListEvents() {
	const root = getSavedSectionEl();
	if (!root || root.dataset.savedActionsBound === "true") return;
	root.dataset.savedActionsBound = "true";
	root.addEventListener("click", handleSavedListClick);
}

function initApp() {
	bindSavedListEvents();
	applyShareFromUrl();
	renderSavedList();
	initTheme();
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initApp, { once: true });
} else {
	initApp();
}

function registerServiceWorker() {
	if (typeof navigator === "undefined" || !("serviceWorker" in navigator))
		return;
	window.addEventListener("load", () => {
		navigator.serviceWorker
			.register(new URL("./service-worker.js", import.meta.url), {
				type: "module",
			})
			.catch((err) => console.warn("Service worker registration failed", err));
	});
}

registerServiceWorker();
