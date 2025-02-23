import { getFeatureID } from '../helpers/feature-helpers.js';
import features from '../feature-manager.js';
import { findState } from '../helpers/react-resolver.js';
import { $ } from 'select-dom';

const selector = '.btn-success';

async function init(activate = true) {

    if (!activate) {
        return;
    }
    
}

const id = getFeatureID(import.meta.url);
const bodyClass = 'iref-' + id;

features.add(id, true, selector, bodyClass, init);
