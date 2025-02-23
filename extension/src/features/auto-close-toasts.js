import { getFeatureID } from '../helpers/feature-helpers.js';
import features from '../feature-manager.js';
import { $ } from 'select-dom';
import { log } from './logger.js';

const selector = '.chakra-toast button[aria-label="Close"]:not(.iref-seen)';

async function init(activate = true) {

    if (!activate) {
        return;
    }

    let timeout = JSON.parse(localStorage.getItem('iref_settings'))["toast-timeout-s"] || 5;

    let toastEl = $(selector);
    
    toastEl.classList.add('iref-seen');

    log('✖️ Closing toast after ' + timeout + ' seconds');

    setTimeout(() => {
        let reactHandler = Object.keys(toastEl).find(key => key.startsWith('__reactEventHandlers'));
        toastEl[reactHandler].onClick();
    }, timeout * 1000);
}

const id = getFeatureID(import.meta.url);
const bodyClass = 'iref-' + id;

features.add(id, true, selector, bodyClass, init);
