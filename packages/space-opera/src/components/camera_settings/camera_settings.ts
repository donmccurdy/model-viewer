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

import './components/pitch_limits.js';
import './components/yaw_limits.js';
import './components/zoom.js';
import '../shared/checkbox/checkbox.js';
import '@material/mwc-button';
import '../shared/expandable_content/expandable_tab.js';
import '../shared/section_row/section_row.js';
import '../shared/draggable_input/draggable_input.js';
import '../shared/checkbox/checkbox.js';

import {customElement, html, internalProperty, property, query} from 'lit-element';

import {reduxStore} from '../../space_opera_base.js';
import {cameraSettingsStyles} from '../../styles.css.js';
import {ModelViewerConfig, State} from '../../types.js';
import {dispatchAutoRotate, dispatchCameraTarget, dispatchSaveCameraOrbit, getConfig} from '../config/reducer.js';
import {Vector3D} from '../config/types.js';
import {ConnectedLitElement} from '../connected_lit_element/connected_lit_element.js';
import {getCameraState, getModel} from '../model_viewer_preview/reducer.js';
import {CheckboxElement} from '../shared/checkbox/checkbox.js';
import {DraggableInput} from '../shared/draggable_input/draggable_input.js';
import {styles as draggableInputRowStyles} from '../shared/draggable_input/draggable_input_row.css.js';
import {checkFinite} from '../utils/reducer_utils.js';

@customElement('me-camera-orbit-editor')
class CameraOrbitEditor extends ConnectedLitElement {
  static styles = [cameraSettingsStyles, draggableInputRowStyles];

  @query('me-draggable-input#yaw') yawInput!: DraggableInput;
  @query('me-draggable-input#pitch') pitchInput!: DraggableInput;

  get currentOrbit() {
    return {
      phiDeg: this.pitchInput.value,
      thetaDeg: this.yawInput.value,
    };
  }

  private onChange() {
    this.dispatchEvent(new CustomEvent('change'));
  }

  render() {
    return html`
      <div style="justify-content: space-between; width: 100%; display: flex;">
        <div>
          <me-draggable-input
            id="yaw"
            innerLabel="yaw"
            min=-9999 max=9999
            style="min-width: 90px; max-width: 90px;"
            @change=${this.onChange}>
          </me-draggable-input>
          <me-draggable-input
            id="pitch"
            innerLabel="pitch"
            min=-9999 max=9999
            style="min-width: 90px; max-width: 90px;"
            @change=${this.onChange}>
          </me-draggable-input>
        </div>
      </div>
`;
  }
}

/** Camera target input panel. */
@customElement('me-camera-target-input')
export class CameraTargetInput extends ConnectedLitElement {
  static styles = [draggableInputRowStyles, cameraSettingsStyles];

  @query('me-draggable-input#camera-target-x') xInput!: HTMLInputElement;
  @query('me-draggable-input#camera-target-y') yInput!: HTMLInputElement;
  @query('me-draggable-input#camera-target-z') zInput!: HTMLInputElement;

  @property({attribute: false}) change?: (newValue: Vector3D) => void;
  @internalProperty() target?: Vector3D;

  protected onInputChange(event: Event) {
    event.preventDefault();
    if (!this.change) {
      return;
    }

    const target = {
      x: checkFinite(Number(this.xInput.value)),
      y: checkFinite(Number(this.yInput.value)),
      z: checkFinite(Number(this.zInput.value)),
    };
    this.change(target);
  }

  render() {
    if (!this.target) {
      return html`<div class="note">Waiting for camera target...</div>`;
    }
    return html`
        <me-draggable-input value=${this.target.x}
        id="camera-target-x" min=-9999 max=9999 dragStepSize=0.01 @change=${
        this.onInputChange} innerLabel="X"></me-draggable-input>
        <me-draggable-input id="camera-target-y" min=-9999 max=9999 dragStepSize=0.01 value=${
        this.target.y} @change=${
        this.onInputChange} innerLabel="Y"></me-draggable-input>
        <me-draggable-input id="camera-target-z" value=${
        this.target.z} min=-9999 max=9999 dragStepSize=0.01 @change=${
        this.onInputChange} innerLabel="Z"></me-draggable-input>
        `;
  }
}

/** The Camera Settings panel. */
@customElement('me-camera-settings')
export class CameraSettings extends ConnectedLitElement {
  static styles = cameraSettingsStyles;

  @internalProperty() config: ModelViewerConfig = {};

  @query('me-camera-orbit-editor') cameraOrbitEditor!: CameraOrbitEditor;
  @query('me-camera-target-input') cameraTargetInput!: CameraTargetInput;
  @query('me-checkbox#auto-rotate') autoRotateCheckbox!: CheckboxElement;

  // Specifically overriding a super class method.
  // tslint:disable-next-line:enforce-name-casing
  async _getUpdateComplete() {
    await super._getUpdateComplete();
    await this.cameraOrbitEditor.updateComplete;
    await this.autoRotateCheckbox.updateComplete;
  }

  stateChanged(state: State) {
    const config = getConfig(state);
    if (config !== this.config) {
      this.config = config;
      if (getModel(state) != null) {
        this.updateInitialCamera();
      }
    }
  }

  async updateInitialCamera() {
    const cameraState = await getCameraState();
    this.cameraTargetInput.target = cameraState.target;
    if (this.config.cameraOrbit == null) {
      this.cameraOrbitEditor.style.display = 'none';
    } else {
      const currentOrbit = cameraState.orbit;
      this.cameraOrbitEditor.yawInput.value = currentOrbit.thetaDeg;
      this.cameraOrbitEditor.pitchInput.value = currentOrbit.phiDeg;
      this.cameraOrbitEditor.style.display = '';
    }
  }

  async onSaveCameraOrbit() {
    const currentCamera = await getCameraState();
    reduxStore.dispatch(dispatchSaveCameraOrbit(currentCamera.orbit));
  }

  resetInitialCamera() {
    this.cameraOrbitEditor.style.display = 'none';
    reduxStore.dispatch(dispatchSaveCameraOrbit(undefined));
  }

  async onCameraOrbitEditorChange() {
    const currentCamera = await getCameraState();
    const orb = {
      ...this.cameraOrbitEditor.currentOrbit,
      radius: currentCamera.orbit.radius,
    };
    reduxStore.dispatch(dispatchSaveCameraOrbit(orb));
  }

  onCameraTargetChange(newValue: Vector3D) {
    reduxStore.dispatch(dispatchCameraTarget(newValue));
  }

  onAutoRotateChange() {
    reduxStore.dispatch(dispatchAutoRotate(this.autoRotateCheckbox.checked));
  }

  render() {
    return html`
    <me-expandable-tab tabName="Camera Setup" .open=${true}>
      <div slot="content">
        <me-checkbox id="auto-rotate" label="Auto-rotate"
          ?checked="${!!this.config.autoRotate}"
          @change=${this.onAutoRotateChange}>
        </me-checkbox>
        <div>
          <div style="font-size: 14px; font-weight: 500; margin-top: 10px">Initial Camera Position:</div>
          <me-camera-orbit-editor
            @change=${this.onCameraOrbitEditorChange}>
          </me-camera-orbit-editor>
          <div style="justify-content: space-between; width: 100%; display: flex;">
            <mwc-button
              class="SaveCameraButton"
              id="save-camera-angle"
              unelevated
              icon="photo_camera"
              style="align-self: center"
              @click=${this.onSaveCameraOrbit}>
              Save current as initial
            </mwc-button>
            <mwc-icon-button class="RevertButton" style="align-self: center; margin-top: 10px;" id="revert-metallic-roughness-texture" icon="undo"
            title="Reset initial camera" @click=${this.resetInitialCamera}>
            </mwc-icon-button>
          </div>
        </div>
        <div style="font-size: 14px; font-weight: 500; margin-top: 20px">Target Point:</div>
        <me-camera-target-input .change=${this.onCameraTargetChange}>
        </me-camera-target-input>
      </div>
    </me-expandable-tab>

<me-expandable-tab tabName="Customize Limits">
  <div slot="content">
    <me-camera-yaw-limits></me-camera-yaw-limits>
    <me-camera-pitch-limits></me-camera-pitch-limits>
    <me-camera-zoom-limits></me-camera-zoom-limits>
  </div>
</me-expandable-tab>
`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'me-camera-orbit-editor': CameraOrbitEditor;
    'me-camera-settings': CameraSettings;
    'me-camera-target-input': CameraTargetInput;
    'me-draggable-input': DraggableInput;
  }
}
