Updated Contact Us Page Implementation Plan
Phase 1: Database Schema Updates
1. Create Migration File (server/database/migrations/6_add_feedback_and_rating_tables.sql)
- Create contact_feedback table for storing feedback/problems
- Create contact_ratings table for storing star ratings
- Add indexes for efficient querying
2. Update Schema File (server/database/schema.sql)
- Add the new table definitions to the consolidated schema
- Include foreign key constraints to users table
Phase 2: Backend Service Integration
3. Create Contact Service (server/services/contactService.js)
- submitFeedback(data) - Handle feedback/problem submissions
- submitRating(data) - Handle star rating submissions
- getFeedbackStats() - Get aggregated feedback statistics
- getAllRatings() - Get all ratings for display
4. Create Contact Controller (server/controllers/contactController.js)
- Handle API endpoints for feedback and ratings
- Validate input data
- Send email notifications for new feedback
- Rate limiting for rating submissions
Phase 3: Frontend Component Development
5. Update Contact Page (pawlink/src/pages/Contact.jsx)
- Enhanced hero section with background image
- Multi-section form (Feedback, Problem Report, General Inquiry)
- Integrated Rating component
- Real-time form validation
- Loading states and error handling
6. Create Rating Component (pawlink/src/components/Rating.jsx)
- Star-based rating system (1-5 stars)
- Hover effects and selection persistence
- Accessibility support
- Display average rating and count
7. Create Feedback Stats Component (pawlink/src/components/FeedbackStats.jsx)
- Display aggregated feedback statistics
- Show rating distribution
- Recent feedback list
Phase 4: Database Table Structure
contact_feedback Table:
- id (PK, auto-increment)
- user_id (FK to users, nullable)
- feedback_type (ENUM: 'general', 'bug_report', 'feature_request', 'compliment')
- subject (VARCHAR)
- message (TEXT)
- priority (ENUM: 'low', 'medium', 'high', 'urgent')
- category (VARCHAR)
- screenshot_url (VARCHAR, optional)
- status (ENUM: 'pending', 'in_progress', 'resolved', 'closed')
- created_at, updated_at
- Indexes on feedback_type, status, created_at
contact_ratings Table:
- id (PK, auto-increment)
- user_id (FK to users, nullable for anonymous ratings)
- rating (TINYINT: 1-5)
- feedback_id (FK to contact_feedback, nullable)
- created_at, updated_at
- Indexes on rating, created_at
Phase 5: API Route Updates
8. Update Routes (server/routes/contactRoutes.js)
- POST /api/contact/feedback - Submit feedback
- POST /api/contact/rating - Submit rating
- GET /api/contact/stats - Get feedback statistics
- GET /api/contact/ratings - Get all ratings
Phase 6: Design & Styling
9. Enhance CSS (pawlink/src/index.css)
- Form styling matching existing patterns
- Rating component styles
- Background image hero section
- Success modal animations
Phase 7: Testing & Validation
10. Create Tests
- Database migration tests
- API endpoint tests
- Form validation tests
- Component unit tests
Key Features to Implement:
- ✅ Multi-purpose feedback form (optional submission)
- ✅ Star rating system (required for rating submission)
- ✅ File upload for screenshots (optional)
- ✅ Real-time validation
- ✅ Loading states and error handling
- ✅ Success confirmation with rating
- ✅ Feedback statistics display
- ✅ Responsive design following existing patterns
- ✅ Dark/light theme support
- ✅ Anonymous rating support
- ✅ Email notifications for new feedback
- ✅ Rate limiting for rating submissions
Dependencies to Check:
- MySQL database connection (already available via db.js)
- Email service for notifications (if needed)
- File upload handling (multer config in server/config/multer.js)