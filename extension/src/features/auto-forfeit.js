import { getFeatureID } from "../helpers/feature-helpers.js";
import { log } from "./logger.js";
import features from "../feature-manager.js";
import { findProps } from "../helpers/react-resolver.js";
import ws from "../helpers/websockets.js";
import { $ } from "select-dom";

const selector = ".css-qlxuh7 .btn-danger";

let forfeitCheck;

async function init(activate = true) {
  if (!activate) {
    return;
  }

  let timeout =
    JSON.parse(localStorage.getItem("iref_settings"))["auto-forfeit-m"] || 13;

  const forfeitProps = findProps($(selector));
  forfeitCheck = forfeitProps.registrationStatus.subsession_id;

  log(`🛑 Forfeit button seen, beginning ${timeout} minute countdown`);

  setTimeout(() => {
    const forfeitProps2 = findProps($(selector));

    if (!forfeitProps2) {
      log("🛑 Forfeit button not available");
      return;
    }

    if (forfeitProps2.simStatus.status !== "Sim Running") {
      log("🛑 Sim not running, skipping forfeit");
      return;
    }

    if (forfeitCheck !== forfeitProps2.registrationStatus.subsession_id) {
      log("🛑 Session changed, skipping forfeit");
      return;
    }

    log(`🛑 Forfeiting session ${forfeitCheck}`);

    ws.withdraw();
  }, timeout * 1000 * 60);
}

const id = getFeatureID(import.meta.url);
const bodyClass = "iref-" + id;

features.add(id, true, selector, bodyClass, init);
