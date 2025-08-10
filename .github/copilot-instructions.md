<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Multi-Stakeholder Evaluation Platform

This is a React Vite project for a multi-stakeholder evaluation platform with the following specifications:

## Tech Stack
- Frontend: React with Vite, modern minimalistic UI
- Backend: Node.js/Express-style APIs
- Authentication: Supabase Auth (email/password)
- Database: MongoDB Atlas
- Styling: Tailwind CSS for responsive, modern design

## Design Guidelines
- **Design Style**: Minimalistic, modern, responsive
- **Typography**: Sans-serif (Inter, Roboto)
- **Color Palette**:
  - Primary: #1E88E5 (blue)
  - Neutral greys for backgrounds and dividers
  - White cards for content blocks
- **Mobile-friendly layouts**

## Database Schema
- **forms**: Evaluation forms with questions
- **subjects**: People being evaluated
- **evaluators**: People doing the evaluation
- **responses**: Submitted evaluation responses

## Security Requirements
- All admin routes require Supabase authentication
- Evaluator access via secure tokens only
- No cross-evaluator data access

## Key Features
- Admin dashboard for form management
- CSV upload for bulk subject/evaluator creation
- Public evaluation forms via secure tokens
- Aggregated reporting with charts and tables
