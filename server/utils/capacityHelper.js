const pool = require('../config/db')

/**
 * capacityHelper.js — Automated Occupancy Tracking
 * 
 * WHY: This utility ensures that an organization's current_occupancy 
 * is always in sync with animal additions, adoptions, and handovers.
 * It prevents manual errors and keep the "Available Spaces" UI accurate.
 */

/**
 * Updates the current_occupancy of an organization
 * @param {number} orgId - The ID of the organization
 * @param {number} delta - Amount to change (+1 or -1)
 */
const updateOccupancy = async (orgId, delta) => {
  if (!orgId) return

  // Using GREATEST(0, ...) to ensure occupancy never goes negative
  await pool.query(
    `UPDATE organizations 
     SET current_occupancy = GREATEST(0, current_occupancy + ?)
     WHERE id = ?`,
    [delta, orgId]
  )
}

module.exports = { updateOccupancy }
