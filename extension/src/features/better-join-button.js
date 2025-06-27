import { getFeatureID } from "../helpers/feature-helpers.js";
import features from "../feature-manager.js";
import { findProps } from "../helpers/react-resolver.js";
import { $ } from "select-dom";
import "./better-join-button.css";

const selector = ".css-qlxuh7 .btn-success";
let persistInterval = 0;

const userRoles = {
  0: "Race",
  2: "👀 Spectate",
  4: "📣 Spot",
};

async function init(activate = true) {
  if (!activate) {
    clearInterval(persistInterval);
    return;
  }

  persistInterval = setInterval(() => {
    let joinBtnEl = $(selector);

    if (joinBtnEl.classList.contains("iref-seen")) {
      return;
    }

    joinBtnEl.classList.add("iref-seen");

    const joinProps = findProps(joinBtnEl);

    let label1 = "";
    let label2 = "";

    if (joinProps.registrationStatus.user_role !== 0) {
      if (userRoles[joinProps.registrationStatus.user_role] !== undefined) {
        label1 = userRoles[joinProps.registrationStatus.user_role];
      }
    } else {
      if (joinProps.registrationStatus.event_type === 5) {
        label2 = " Race";
      } else {
        label2 = " Practice";
      }

      if (joinProps.registrationStatus.will_be_scored) {
        label1 = "Official";
      } else {
        label1 = "Unofficial";
      }
    }

    //joinBtnEl.innerHTML = joinBtnEl.innerHTML + " " + label;
    joinBtnEl.innerHTML = (label2 ? "🏁 Join " : "") + label1 + label2;
  }, 300);
}

const id = getFeatureID(import.meta.url);
const bodyClass = "iref-" + id;

features.add(id, true, selector, bodyClass, init);
