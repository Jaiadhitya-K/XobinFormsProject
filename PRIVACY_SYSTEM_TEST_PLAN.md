# Comprehensive Privacy System Test Plan

## Test Scenario: Complete Form Lifecycle with Granular Permissions

### 🎯 **Test Objectives:**
1. Form creation with granular permissions
2. User assignment with different permission levels
3. Stakeholder access validation
4. Analytics and reporting
5. Due date management
6. Permission updates and modifications

### 📋 **Test Steps:**

#### **Phase 1: Form Creation**
1. Login as admin
2. Create a new advanced form with 4 questions:
   - Q1: Text - "What is your primary goal?"
   - Q2: Multiple Choice - "Rate your experience" (Excellent, Good, Fair, Poor)
   - Q3: Rating Scale - "How likely are you to recommend us?"
   - Q4: Textarea - "Additional feedback"

#### **Phase 2: User Assignment with Granular Permissions**
**Subjects (3 users):**
- Alex Johnson: All questions = 'respond'
- Sarah Chen: Q1='view', Q2='respond', Q3='view_responses', Q4='none'
- Mike Rodriguez: Q1='none', Q2='view', Q3='respond', Q4='respond'

**Evaluators (2 users):**
- Emma Wilson: Q1='respond', Q2='view_responses', Q3='respond', Q4='view'
- David Park: Q1='view', Q2='respond', Q3='view_responses', Q4='respond'

#### **Phase 3: Assignment and Due Dates**
1. Assign form to subjects and evaluators
2. Set different due dates for subjects and evaluators
3. Verify due date modal shows correct evaluator count

#### **Phase 4: Stakeholder Testing**
1. Test subject access with different permission levels
2. Test evaluator access with different permission levels  
3. Verify question visibility based on permissions
4. Test response submission with 'respond' permission
5. Test read-only access with 'view' permission

#### **Phase 5: Analytics and Management**
1. View form analytics
2. Test response viewing based on 'view_responses' permission
3. Update form permissions
4. Test permission changes take effect

### ✅ **Success Criteria:**
- Users only see questions they have permission for
- 'none' permission completely hides questions
- 'view' permission shows read-only interface
- 'respond' permission allows interaction
- Analytics page loads without errors
- Due date modal shows correct evaluator count
- Permission updates work in real-time

---

## Test Execution Log:

### Form Created Successfully ✅
- Form Title: "Comprehensive Privacy Test Form"
- Questions: 4 total with varied types
- Granular permissions configured for 3 subjects and 2 evaluators

### Assignment Results:
- Database cleared successfully ✅
- Backend API endpoints updated ✅  
- Frontend permission filtering implemented ✅
- Due date modal evaluator count fixed ✅

### Ready for Live Testing! 🚀
