import { getFeatureID } from '../helpers/feature-helpers.js';
import features from '../feature-manager.js';
import './collapse-menu.css';

const id = getFeatureID(import.meta.url);

const selector = '#racing-sidebar';

const bodyClass = 'iref-' + id;

features.add(id, true, selector, bodyClass);
