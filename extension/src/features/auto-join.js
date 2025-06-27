import { getFeatureID } from "../helpers/feature-helpers.js";
import { log } from "./logger.js";
import features from "../feature-manager.js";
import { findProps } from "../helpers/react-resolver.js";
import { $ } from "select-dom";

const selector = ".css-qlxuh7 .btn-success";

let lastJoined;

async function init(activate = true) {
  if (!activate) {
    return;
  }

  let type =
    JSON.parse(localStorage.getItem("iref_settings"))["auto-join-type"] ||
    "race";

  const joinProps = findProps($(selector));

  if (joinProps.registrationStatus.subsession_id !== lastJoined) {
    lastJoined = joinProps.registrationStatus.subsession_id;
    if (
      type !== "race" ||
      (type === "race" &&
        joinProps.registrationStatus.event_type === 5 &&
        joinProps.registrationStatus.will_be_scored)
    ) {
      log(`🏁 Auto joined session: ${lastJoined}`);
      $(selector).click();
    } else {
      log(`⛔ Not joining unofficial session: ${lastJoined}`);
    }
  } else {
    log(`⛔ Already processed auto join for: ${lastJoined}`);
  }
}

const id = getFeatureID(import.meta.url);
const bodyClass = "iref-" + id;

features.add(id, true, selector, bodyClass, init);
