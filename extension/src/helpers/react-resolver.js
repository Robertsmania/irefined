export function findReact(el, parent = 0, type = "props") {
  if (!el) {
    return null;
  }
  const reactInternal = Object.keys(el).find((key) =>
    key.startsWith("__reactFiber")
  );

  el = el[reactInternal];

  let found = [];

  while (found.length <= parent) {
    if ("stateNode" in el && el.stateNode && type in el.stateNode) {
      found.push(el.stateNode);
    }

    if ("return" in el && el.return) {
      el = el.return;
    } else {
      break;
    }
  }

  return found[parent] || null;
}

export function findState(el, parent = 0) {
  return findReact(el, parent, "state").state;
}

export function findProps(el, parent = 0) {
  return findReact(el, parent).props;
}
