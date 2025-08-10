# XOBIN Forms - Final System Logic Documentation

## Overview
XOBIN Forms is an advanced evaluation platform that supports flexible subject-evaluator mapping with granular question assignments. This system allows for sophisticated 360-degree feedback with precise control over who can answer which questions.

## Core Concepts

### 1. Subject-Evaluator Matrix
- **Subjects**: People being evaluated
- **Evaluators**: People doing the evaluation (can be different sets for each subject)
- **Flexible Assignment**: Each subject can have a different number and combination of evaluators

### 2. Question-Level Access Control
- Each question can be answered by:
  - Subject only
  - Specific evaluators (e.g., Evaluator 1, 3, 5)
  - All evaluators
  - Subject + specific evaluators
  - Any combination of the above

### 3. Form Types
- **Enhanced Matrix Forms**: The new system with full flexibility
- All other form types are being phased out for simplicity

## System Architecture

### Frontend Components
1. **EnhancedFormCreator.jsx** - Main form creation interface
2. **EnhancedFormManager.jsx** - Form editing (same UI as creator but with existing data)
3. **EnhancedEvaluationForm.jsx** - Universal evaluation interface
4. **EnhancedFormAnalytics.jsx** - Analytics and reporting
5. **UnifiedDashboard.jsx** - Main dashboard (updated)

### Backend Collections
1. **forms** - Form definitions with enhanced structure
2. **enhanced_assignments** - Individual evaluation assignments
3. **enhanced_responses** - Evaluation responses
4. **users** - User accounts
5. **notifications** - System notifications

### API Endpoints
1. **POST /api/forms/enhanced** - Create new form
2. **PUT /api/forms/enhanced/:id** - Update existing form
3. **GET /api/enhanced-evaluate/:token** - Get evaluation
4. **POST /api/enhanced-evaluate/:token** - Submit evaluation
5. **GET /api/forms/:id/analytics** - Get form analytics

## Detailed Workflow

### Step 1: Form Creation Process

#### Tab 1: Subject-Evaluator Setup
1. **Add Subjects**: Select user accounts from dropdown
2. **Set Evaluator Count**: Define how many evaluators per subject
3. **Assign Evaluators**: For each subject, select their specific evaluators from dropdown
4. **Matrix Validation**: Ensure all subjects have the required number of evaluators

#### Tab 2: Question Creation & Assignment
1. **Add Questions**: Create questions with different types (text, rating, multiple choice)
2. **Question Assignment**: For each question, specify:
   - Can subject answer? (checkbox)
   - Which evaluators can answer? (checkboxes for Evaluator 1, 2, 3... N)
   - Required/Optional status
3. **Preview**: Show question distribution summary

#### Tab 3: Summary & Publish
1. **Matrix Overview**: Show complete subject-evaluator mapping
2. **Question Distribution**: Show which questions go to whom
3. **Validation**: Ensure all requirements are met
4. **Publish**: Create form and send notifications

### Step 2: Form Management (Editing)
- Same UI as creation but pre-populated with existing form data
- Can modify subject-evaluator assignments
- Can add/remove/edit questions and their assignments
- Can update question access permissions
- Save changes and notify affected participants

### Step 3: Evaluation Experience

#### For Subjects:
- See list of all evaluators assigned to evaluate them
- Answer only questions marked for subjects
- View their evaluation status and progress

#### For Evaluators:
- See which subject they're evaluating
- See list of other evaluators for the same subject
- Answer only questions assigned to their evaluator position
- View evaluation progress

### Step 4: Analytics & Reporting
- Response rates by subject and evaluator
- Question-level analytics
- Comparative analysis across evaluators
- Export capabilities
- Real-time progress tracking

## Data Structure

### Enhanced Form Schema
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  formType: "enhanced",
  createdBy: ObjectId,
  createdAt: Date,
  
  // Subject-Evaluator Matrix
  subjectMatrix: [
    {
      subjectId: ObjectId,
      subjectName: String,
      subjectEmail: String,
      evaluators: [
        {
          evaluatorId: ObjectId,
          evaluatorName: String,
          evaluatorEmail: String,
          position: Number // 1, 2, 3... N
        }
      ]
    }
  ],
  
  // Questions with granular access control
  questions: [
    {
      id: String,
      text: String,
      type: String, // 'text', 'rating', 'multiple-choice'
      required: Boolean,
      canSubjectAnswer: Boolean,
      evaluatorPositions: [Number], // [1, 3, 5] means evaluators 1, 3, and 5 can answer
      options: [String] // for multiple choice
    }
  ],
  
  status: String,
  dueDate: Date
}
```

### Enhanced Assignment Schema
```javascript
{
  _id: ObjectId,
  formId: ObjectId,
  participantType: String, // 'subject' or 'evaluator'
  participantId: ObjectId,
  participantEmail: String,
  
  // For evaluators
  subjectId: ObjectId,
  subjectName: String,
  evaluatorPosition: Number, // 1, 2, 3... N
  
  // Assigned questions (filtered based on permissions)
  assignedQuestions: [String], // question IDs
  
  token: String,
  status: String, // 'pending', 'completed'
  createdAt: Date,
  completedAt: Date
}
```

## Implementation Plan

### Phase 1: Core Infrastructure (Priority 1)
1. ✅ Create system documentation (this file)
2. 🔄 Build EnhancedFormCreator.jsx (3-tab interface)
3. 🔄 Update backend API endpoints
4. 🔄 Create enhanced assignment logic

### Phase 2: Evaluation System (Priority 2)
1. 🔄 Build EnhancedEvaluationForm.jsx
2. 🔄 Implement question filtering logic
3. 🔄 Add participant visibility features

### Phase 3: Management & Analytics (Priority 3)
1. 🔄 Build EnhancedFormManager.jsx (edit functionality)
2. 🔄 Build EnhancedFormAnalytics.jsx
3. 🔄 Update UnifiedDashboard.jsx

### Phase 4: Cleanup & Migration (Priority 4)
1. 🔄 Remove redundant form components
2. 🔄 Update routing and navigation
3. 🔄 Data migration scripts

## Key Features

### 1. Flexibility
- Different evaluator sets per subject
- Granular question assignments
- Dynamic form structure

### 2. Transparency
- Participants see who else is involved
- Clear role definitions
- Progress visibility

### 3. Control
- Precise question targeting
- Role-based access
- Comprehensive analytics

### 4. User Experience
- Intuitive 3-step creation process
- Clean evaluation interface
- Real-time feedback

## Files to Remove (Redundant)
- MatrixFormCreator.jsx
- CreateForm.jsx
- CreateFormSimple.jsx
- CreateFormAdvanced.jsx
- FormManagement.jsx (replaced by enhanced version)
- All legacy form components

## Files to Create/Update
- ✅ EnhancedFormCreator.jsx (new)
- 🔄 EnhancedFormManager.jsx (new)
- 🔄 EnhancedEvaluationForm.jsx (new)
- 🔄 EnhancedFormAnalytics.jsx (new)
- 🔄 Update App.jsx routing
- 🔄 Update backend server.js
- 🔄 Update api.js

## Success Criteria
1. ✅ Single, unified form creation system
2. ✅ Flexible subject-evaluator assignment
3. ✅ Granular question-level permissions
4. ✅ Comprehensive evaluation experience
5. ✅ Robust analytics and reporting
6. ✅ Clean, maintainable codebase
