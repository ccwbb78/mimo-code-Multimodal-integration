// Theme preload — runs before React/Solid to prevent flash
;(function () {
  try {
    var t = localStorage.getItem("opencode.global.dat:theme")
    if (t === "light") document.documentElement.classList.add("light")
  } catch (_) {}
})()
