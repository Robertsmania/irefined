import { log } from "./features/logger.js";
import observe from "./helpers/dom-observer.js";

let registeredFeatures = [];

async function add(id, observer, selector, bodyClass, callback = null) {
  console.log(`🔧 Feature manager: Adding feature "${id}"`);
  
  /* Registering the feature push all args */
  registeredFeatures.push({ id, observer, selector, bodyClass, callback });

  /* Feature filtering and running */
  const options = JSON.parse(localStorage.getItem("iref_settings"));

  let enabled = false;

  // check if feature id is enabled in the options object
  if (
    (options && options[id] === true) ||
    id === "settings-panel" ||
    id === "status-bar" ||
    id === "voice-attack_client"
  ) {
    console.log(`✅ Feature manager: Enabled feature "${id}"`);
    enabled = true;
  } else {
    console.log(`❌ Feature manager: Disabled feature "${id}"`);
  }

  if (observer) {
    observe(id, selector, bodyClass, callback, enabled);
  } else {
    if (callback) {
      callback(enabled);
    }
  }

  return;
}

async function rerunAll() {
  registeredFeatures.forEach((feature) => {
    registeredFeatures = registeredFeatures.filter(
      (item) => item.id !== feature.id
    );
    add(
      feature.id,
      feature.observer,
      feature.selector,
      feature.bodyClass,
      feature.callback
    );
  });
}

const features = {
  add,
  rerunAll,
};

export default features;
