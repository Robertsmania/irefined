import { getFeatureID } from "../helpers/feature-helpers.js";
import { log } from "./logger.js";
import features from "../feature-manager.js";
import { findProps } from "../helpers/react-resolver.js";
import { $ } from "select-dom";

const selector = ".css-qlxuh7 .btn-success";
const regBarSelector = "#scroll > .css-c980m3";

async function init(activate = true) {
  if (!activate) {
    return;
  }

  let type =
    JSON.parse(localStorage.getItem("iref_settings"))["auto-join-type"] ||
    "race";

  let lastJoined = parseInt(localStorage.getItem("iref_last_joined"));

  const joinProps = findProps($(selector));

  if (joinProps.registrationStatus.subsession_id !== lastJoined) {
    lastJoined = joinProps.registrationStatus.subsession_id;
    localStorage.setItem("iref_last_joined", lastJoined);
    if (
      type !== "race" ||
      (type === "race" &&
        joinProps.registrationStatus.event_type === 5 &&
        joinProps.registrationStatus.will_be_scored)
    ) {
      log(`🏁 Auto joining session: ${lastJoined}`);
      $(selector).click();
    } else {
      log(`⛔ Not joining unscored session: ${lastJoined}`);
    }
  } else {
    log(`⛔ Already joined ${lastJoined} once, skipping`);
  }
}

setInterval(() => {
  if ($(regBarSelector)) {
    const regBarProps = findProps($(regBarSelector));
    let lastJoined = parseInt(localStorage.getItem("iref_last_joined"));

    if (
      regBarProps.simStatus.status == "Sim Running" &&
      regBarProps.registrationStatus.subsession_id !== lastJoined
    ) {
      log(
        `🏁 Session transition detected, last session is now ${regBarProps.registrationStatus.subsession_id}`
      );
      localStorage.setItem(
        "iref_last_joined",
        regBarProps.registrationStatus.subsession_id
      );
    }
  }
}, 1000);

const id = getFeatureID(import.meta.url);
const bodyClass = "iref-" + id;

features.add(id, true, selector, bodyClass, init);
