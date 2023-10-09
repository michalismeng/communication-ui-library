// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { COMPONENT_LOCALE_EL_GR } from '@internal/react-components';
import el_GR from './strings.json';
import { createCompositeStrings } from '../utils';
import { CompositeLocale } from '../../LocalizationProvider';

/**
 * Locale for Greek (Greece)
 *
 * @public
 */
export const COMPOSITE_LOCALE_EL_GR: CompositeLocale = {
  component: COMPONENT_LOCALE_EL_GR,
  strings: createCompositeStrings(el_GR)
};
