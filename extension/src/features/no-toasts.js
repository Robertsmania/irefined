import { getFeatureID } from '../helpers/feature-helpers.js';
import features from '../feature-manager.js';
import './no-toasts.css';

const id = getFeatureID(import.meta.url);

const selector = '#chakra-toast-manager-top';

const bodyClass = 'iref-' + id;

features.add(id, true, selector, bodyClass);
