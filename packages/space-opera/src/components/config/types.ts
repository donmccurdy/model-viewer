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

// We may want to use shared model-viewer types later (b/155754690), but really
// that's not necessary. They technically aren't even the same, because here we
// want them to be read-only.

/** Spherical coordinate. Follow model-viewer's convention of theta/phi. */
export interface SphericalPositionDeg {
  thetaDeg: number;
  phiDeg: number;
  radius: number;
}

/** A 3D Cartesian coordinate */
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Min/max limits. We have 'enabled' here so we can disable the limit, but not
 * lose the values if the user wants them back. We could support single-sided
 * limits with 2 booleans, but there's no use case right now.
 */
export interface Limits {
  enabled: boolean;
  min: number;
  max: number;
}
