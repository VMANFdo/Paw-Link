/**
 * utils/validators.js — Form validation helpers
 */

export const validators = {
  /** Check if email is valid format */
  isEmail: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),

  /** Password must be at least 8 characters */
  isStrongPassword: (value) => value.length >= 8,

  /** Field must not be empty */
  isRequired: (value) => value !== null && value !== undefined && String(value).trim() !== '',

  /** Lat/lng coordinate range check */
  isValidLatitude:  (v) => !isNaN(v) && v >= -90  && v <= 90,
  isValidLongitude: (v) => !isNaN(v) && v >= -180 && v <= 180,
}
