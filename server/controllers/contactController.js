const { contactService } = require('../services/contactService')
const { validationResult } = require('express-validator')
const { body } = require('express-validator')

/**
 * contactController.js — Contact Form Controller
 *
 * WHY: Controllers handle request validation, business logic,
 * and API responses. They don't directly access the database.
 */

/**
 * Submit feedback or problem report
 * POST /api/contact/feedback
 */
const submitFeedback = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const data = {
      ...req.body,
      user_id: req.user?.id || null,
      screenshot_url: req.file ? `/uploads/${req.file.filename}` : null,
    }

    const result = await contactService.submitFeedback(data)
    
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: result.data
    })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.response?.data?.message || error.message
    })
  }
}

/**
 * Submit a rating (stars)
 * POST /api/contact/rating
 */
const submitRating = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const data = {
      ...req.body,
      user_id: req.user?.id || null,
    }

    const result = await contactService.submitRating(data)
    
    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: result.data
    })
  } catch (error) {
    console.error('Error submitting rating:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating',
      error: error.response?.data?.message || error.message
    })
  }
}

/**
 * Get feedback statistics
 * GET /api/contact/stats
 */
const getFeedbackStats = async (req, res) => {
  try {
    const result = await contactService.getFeedbackStats()
    
    res.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Error fetching feedback stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback statistics',
      error: error.response?.data?.message || error.message
    })
  }
}

/**
 * Get all ratings
 * GET /api/contact/ratings
 */
const getAllRatings = async (req, res) => {
  try {
    const result = await contactService.getAllRatings()
    
    res.json({
      success: true,
      data: result.data
    })
  } catch (error) {
    console.error('Error fetching ratings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ratings',
      error: error.response?.data?.message || error.message
    })
  }
}

module.exports = {
  submitFeedback,
  submitRating,
  getFeedbackStats,
  getAllRatings,
}