import { log as o } from "../features/logger.js";
import { elementExists as n } from "../node_modules/select-dom/index.js";
let e = [];
setInterval(() => {
  for (var s = 0; s < e.length; s++)
    if (n(e[s].selector) && e[s].enabled) {
      if (document.body.classList.contains(e[s].bodyClass))
        continue;
      o(`✨ Found ${e[s].selector} for feature ${e[s].id}`), document.body.classList.add(e[s].bodyClass), e[s].callback && e[s].callback();
    } else {
      if (!document.body.classList.contains(e[s].bodyClass))
        continue;
      document.body.classList.remove(e[s].bodyClass), o(`🥷 Lost ${e[s].selector} for feature ${e[s].id}`), e[s].callback && e[s].callback(!1);
    }
}, 300);
function b(s, t, l, a, c) {
  e = e.filter((d) => d.id !== s), e.push({ id: s, selector: t, bodyClass: l, callback: a, enabled: c });
}
export {
  b as default
};
//# sourceMappingURL=dom-observer.js.map
