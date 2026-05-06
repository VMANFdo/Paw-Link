const { validationResult } = require('express-validator')

/**
 * middleware/validate.js — Express Validator Error Handler
 *
 * WHY: express-validator checks fields but doesn't automatically
 * reject the request. This middleware reads the validation result
 * and returns a 422 error if any fields are invalid.
 *
 * Usage (chain AFTER validation rules):
 *   router.post('/auth/register',
 *     [
 *       body('email').isEmail(),
 *       body('password').isLength({ min: 8 }),
 *     ],
 *     validate,                      ← This stops bad requests here
 *     authController.register
 *   )
 */

const validate = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({
        field:   e.path,
        message: e.msg,
      })),
    })
  }

  next()
}

module.exports = validate
