export const THEME_KEY = "theme-mode";

const themeButton = document.getElementById("themeButton");
const themePopover = document.getElementById("themePopover");
const themeOptions = Array.from(document.querySelectorAll(".theme-option"));
const themeMenu = document.getElementById("themeMenu");
const darkMq = window.matchMedia("(prefers-color-scheme: dark)");

let currentMode = "auto";

function syncDarkClass(isDark) {
	document.documentElement.classList.toggle("dark", isDark);
}

export function applyTheme(mode) {
	currentMode = mode;

	if (mode === "auto") {
		document.documentElement.removeAttribute("data-theme");
		syncDarkClass(darkMq.matches);
	} else {
		document.documentElement.setAttribute("data-theme", mode);
		syncDarkClass(mode === "dark");
	}

	themeOptions.forEach((button) => {
		button.classList.toggle("is-active", button.dataset.themeMode === mode);
	});
}

function closePopover() {
	themePopover?.classList.add("hidden");
	themeButton?.setAttribute("aria-expanded", "false");
}

export function initTheme() {
	const savedMode = localStorage.getItem(THEME_KEY) || "auto";
	applyTheme(savedMode);

	darkMq.addEventListener("change", () => {
		if (currentMode === "auto") applyTheme("auto");
	});

	themeButton?.addEventListener("click", () => {
		const isHidden = themePopover.classList.toggle("hidden");
		themeButton.setAttribute("aria-expanded", String(!isHidden));
	});

	themeOptions.forEach((button) => {
		button.addEventListener("click", () => {
			const mode = button.dataset.themeMode;
			localStorage.setItem(THEME_KEY, mode);
			applyTheme(mode);
			closePopover();
		});
	});

	document.addEventListener("click", (event) => {
		if (!themeMenu?.contains(event.target)) closePopover();
	});
}
