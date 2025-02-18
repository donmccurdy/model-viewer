/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {Action, ModelViewerConfig, ModelViewerSnippetState, RelativeFilePathsState, State} from '../../types.js';
import {isObjectUrl} from '../utils/create_object_url.js';

export const getModelViewerSnippet = (state: State): ModelViewerSnippetState =>
    state.entities.modelViewerSnippet;

/**
 * Sets the filepaths of a copy of the config.
 * Used when displaying and exporting the snippet.
 * NOT used inside the actual model-viewer element.
 */
export function applyRelativeFilePaths(
    editedConfig: ModelViewerConfig,
    gltfUrl: string|undefined,
    relativeFilePaths: RelativeFilePathsState,
    isEditSnippet: boolean) {
  if (gltfUrl) {
    editedConfig.src = relativeFilePaths.modelName
  } else {
    editedConfig.src = 'Upload model...';
  }

  if (editedConfig.environmentImage) {
    editedConfig.environmentImage = relativeFilePaths.environmentName;
  }

  if (isEditSnippet) {
    editedConfig.poster = undefined;
  } else if (editedConfig.poster && isObjectUrl(editedConfig.poster)) {
    editedConfig.poster = relativeFilePaths.posterName;
  }
}

const SET_EXTRA_ATTRIBUTES = 'SET_EXTRA_ATTRIBUTES'
export function dispatchExtraAttributes(attributes: any) {
  return {type: SET_EXTRA_ATTRIBUTES, payload: attributes};
}

export const getExtraAttributes = (state: State): any =>
    state.entities.modelViewerSnippet.extraAttributes;

export function extraAttributesReducer(state: any = {}, action: Action): any {
  switch (action.type) {
    case SET_EXTRA_ATTRIBUTES:
      return action.payload;
    default:
      return state;
  }
}
