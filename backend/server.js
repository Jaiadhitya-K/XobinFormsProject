const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let db;

// MongoDB connection
async function connectToDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    const client = await MongoClient.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    db = client.db();
    
    // Initialize database with sample data
    await initializeDatabase();
    
    // Test the connection
    await db.admin().ping();
    console.log('✅ MongoDB connection verified');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function initializeDatabase() {
  try {
    const existingUsers = await db.collection('users').countDocuments();
    
    if (existingUsers === 0) {
      console.log('🚀 Creating business platform users...');
      
      const businessUsers = [
        // Product Team
        { name: 'Alex Johnson', email: 'alex.johnson@company.com', department: 'Product', jobTitle: 'Product Manager', password: 'password123' },
        { name: 'Sarah Chen', email: 'sarah.chen@company.com', department: 'Product', jobTitle: 'Senior Designer', password: 'password123' },
        { name: 'Mike Rodriguez', email: 'mike.rodriguez@company.com', department: 'Product', jobTitle: 'Product Analyst', password: 'password123' },
        
        // Engineering Team
        { name: 'Emily Davis', email: 'emily.davis@company.com', department: 'Engineering', jobTitle: 'Tech Lead', password: 'password123' },
        { name: 'James Wilson', email: 'james.wilson@company.com', department: 'Engineering', jobTitle: 'Senior Developer', password: 'password123' },
        { name: 'Lisa Thompson', email: 'lisa.thompson@company.com', department: 'Engineering', jobTitle: 'Frontend Developer', password: 'password123' },
        
        // Marketing Team
        { name: 'David Park', email: 'david.park@company.com', department: 'Marketing', jobTitle: 'Marketing Director', password: 'password123' },
        { name: 'Maria Garcia', email: 'maria.garcia@company.com', department: 'Marketing', jobTitle: 'Content Manager', password: 'password123' },
        { name: 'Kevin Zhang', email: 'kevin.zhang@company.com', department: 'Marketing', jobTitle: 'Digital Marketer', password: 'password123' },
        
        // Sales Team
        { name: 'Rachel Green', email: 'rachel.green@company.com', department: 'Sales', jobTitle: 'Sales Director', password: 'password123' },
        { name: 'Tom Anderson', email: 'tom.anderson@company.com', department: 'Sales', jobTitle: 'Account Manager', password: 'password123' },
        { name: 'Sophie Taylor', email: 'sophie.taylor@company.com', department: 'Sales', jobTitle: 'Sales Representative', password: 'password123' },
        
        // HR Team
        { name: 'Jessica Brown', email: 'jessica.brown@company.com', department: 'HR', jobTitle: 'HR Director', password: 'password123' },
        { name: 'Robert Kim', email: 'robert.kim@company.com', department: 'HR', jobTitle: 'HR Business Partner', password: 'password123' },
        { name: 'Olivia Lee', email: 'olivia.lee@company.com', department: 'HR', jobTitle: 'Recruiter', password: 'password123' },
        
        // Finance Team
        { name: 'Michael Brown', email: 'michael.brown@company.com', department: 'Finance', jobTitle: 'Finance Manager', password: 'password123' },
        { name: 'Jennifer White', email: 'jennifer.white@company.com', department: 'Finance', jobTitle: 'Financial Analyst', password: 'password123' },
        { name: 'Chris Miller', email: 'chris.miller@company.com', department: 'Finance', jobTitle: 'Accountant', password: 'password123' },
        
        // Operations Team
        { name: 'Amanda Wilson', email: 'amanda.wilson@company.com', department: 'Operations', jobTitle: 'Operations Manager', password: 'password123' },
        { name: 'Daniel Lee', email: 'daniel.lee@company.com', department: 'Operations', jobTitle: 'Project Manager', password: 'password123' },
        { name: 'Maya Patel', email: 'maya.patel@company.com', department: 'Operations', jobTitle: 'Operations Coordinator', password: 'password123' }
      ];

      const result = await db.collection('users').insertMany(businessUsers);
      console.log(`✅ Created ${result.insertedCount} business platform users`);
    } else {
      console.log(`✅ Found ${existingUsers} existing users in database`);
    }

    // Initialize collections with indexes
    await db.collection('forms').createIndex({ 'createdBy': 1, 'createdAt': -1 });
    await db.collection('enhanced_assignments').createIndex({ 'formId': 1, 'participantId': 1 });
    await db.collection('enhanced_responses').createIndex({ 'assignmentId': 1, 'participantId': 1 });
    await db.collection('notifications').createIndex({ 'userId': 1, 'read': 1, 'createdAt': -1 });
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
}

// Helper function to generate unique tokens
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// ========== API ROUTES ==========

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    database: 'mongodb',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await db.collection('users').findOne({ email, password });
    
    if (user) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          department: user.department,
          jobTitle: user.jobTitle
        },
        token: generateToken()
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.collection('users').find({}).toArray();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ========== ENHANCED FORM SYSTEM ==========

// Create Enhanced Form
app.post('/api/forms/enhanced', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      dueDate,
      allowLateSubmissions,
      notifyOnCompletion,
      subjectMatrix,
      questions, 
      createdBy
    } = req.body;
    
    console.log('🚀 Creating enhanced form:', { title, subjectsCount: subjectMatrix?.length, questionsCount: questions?.length });
    
    // Validate required fields
    if (!title || !questions || !createdBy || !subjectMatrix) {
      return res.status(400).json({ 
        success: false,
        error: 'Title, questions, subjectMatrix, and createdBy are required' 
      });
    }

    if (subjectMatrix.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'At least one subject is required' 
      });
    }

    // Get creator information
    const creator = await db.collection('users').findOne({ _id: new ObjectId(createdBy) });
    if (!creator) {
      return res.status(404).json({ 
        success: false,
        error: 'Creator not found' 
      });
    }

    // Create enhanced form structure
    const form = {
      _id: new ObjectId(),
      title,
      description: description || '',
      dueDate: dueDate ? new Date(dueDate) : null,
      allowLateSubmissions: allowLateSubmissions || false,
      notifyOnCompletion: notifyOnCompletion !== false,
      formType: 'enhanced',
      subjectMatrix: subjectMatrix.map(s => ({
        subjectId: new ObjectId(s.subjectId),
        subjectName: s.subjectName,
        subjectEmail: s.subjectEmail,
        evaluators: s.evaluators.map(e => ({
          evaluatorId: new ObjectId(e.evaluatorId),
          evaluatorName: e.evaluatorName,
          evaluatorEmail: e.evaluatorEmail,
          position: e.position
        }))
      })),
      questions: questions.map(q => ({
        id: q.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: q.text,
        type: q.type || 'text',
        required: q.required !== false,
        canSubjectAnswer: q.canSubjectAnswer || false,
        evaluatorPositions: q.evaluatorPositions || [],
        options: q.options || []
      })),
      createdBy: new ObjectId(createdBy),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      creator: {
        name: creator.name,
        email: creator.email,
        department: creator.department || '',
        role: creator.role || ''
      }
    };

    console.log('💾 Saving enhanced form to database...');
    await db.collection('forms').insertOne(form);

    // Create individual assignments
    const assignments = [];
    const currentTime = new Date();

    for (const subject of form.subjectMatrix) {
      // Create subject self-evaluation assignment
      const subjectAssignment = {
        _id: new ObjectId(),
        formId: form._id,
        participantType: 'subject',
        participantId: subject.subjectId,
        participantName: subject.subjectName,
        participantEmail: subject.subjectEmail,
        
        // Filter questions for subject
        assignedQuestions: form.questions
          .filter(q => q.canSubjectAnswer)
          .map(q => q.id),
        
        token: crypto.randomBytes(32).toString('hex'),
        status: 'pending',
        createdAt: currentTime,
        updatedAt: currentTime,
        dueDate: form.dueDate
      };
      assignments.push(subjectAssignment);

      // Create evaluator assignments
      for (const evaluator of subject.evaluators) {
        const evaluatorAssignment = {
          _id: new ObjectId(),
          formId: form._id,
          participantType: 'evaluator',
          participantId: evaluator.evaluatorId,
          participantName: evaluator.evaluatorName,
          participantEmail: evaluator.evaluatorEmail,
          
          // Subject being evaluated
          subjectId: subject.subjectId,
          subjectName: subject.subjectName,
          subjectEmail: subject.subjectEmail,
          evaluatorPosition: evaluator.position,
          
          // Filter questions for this evaluator position
          assignedQuestions: form.questions
            .filter(q => q.evaluatorPositions.includes(evaluator.position))
            .map(q => q.id),
          
          token: crypto.randomBytes(32).toString('hex'),
          status: 'pending',
          createdAt: currentTime,
          updatedAt: currentTime,
          dueDate: form.dueDate
        };
        assignments.push(evaluatorAssignment);
      }
    }

    if (assignments.length > 0) {
      console.log(`🔗 Creating ${assignments.length} enhanced assignments...`);
      await db.collection('enhanced_assignments').insertMany(assignments);
    }

    // Create notifications if enabled
    if (form.notifyOnCompletion) {
      const notifications = [];
      
      for (const assignment of assignments) {
        const notificationTitle = assignment.participantType === 'subject' 
          ? 'New Self-Evaluation Request'
          : `Evaluation Request for ${assignment.subjectName}`;
          
        const notificationMessage = assignment.participantType === 'subject'
          ? `You have been requested to complete a self-evaluation: ${form.title}`
          : `You have been requested to evaluate ${assignment.subjectName} for: ${form.title}`;

        notifications.push({
          _id: new ObjectId(),
          userId: assignment.participantId,
          type: assignment.participantType === 'subject' ? 'enhanced_self_evaluation' : 'enhanced_peer_evaluation',
          title: notificationTitle,
          message: notificationMessage,
          assignmentId: assignment._id,
          formId: form._id,
          token: assignment.token,
          read: false,
          createdAt: currentTime
        });
      }
      
      if (notifications.length > 0) {
        console.log(`📧 Creating ${notifications.length} notifications...`);
        await db.collection('notifications').insertMany(notifications);
      }
    }

    const subjectCount = form.subjectMatrix.length;
    const evaluatorAssignmentCount = assignments.filter(a => a.participantType === 'evaluator').length;
    
    console.log(`✅ Enhanced form created successfully!`);

    res.json({
      success: true,
      form: {
        _id: form._id,
        title: form.title,
        description: form.description,
        formType: form.formType,
        questionsCount: form.questions.length,
        subjectsCount: subjectCount,
        totalAssignments: assignments.length,
        subjectAssignments: subjectCount,
        evaluatorAssignments: evaluatorAssignmentCount,
        createdAt: form.createdAt
      },
      message: 'Enhanced form created successfully'
    });
    
  } catch (error) {
    console.error('❌ Error creating enhanced form:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create enhanced form',
      details: error.message 
    });
  }
});

// Update Enhanced Form
app.put('/api/forms/enhanced/:formId', async (req, res) => {
  try {
    const formId = new ObjectId(req.params.formId);
    const updateData = req.body;
    
    console.log('🔄 Updating enhanced form:', formId);
    
    // Get existing form
    const existingForm = await db.collection('forms').findOne({ _id: formId });
    if (!existingForm) {
      return res.status(404).json({ success: false, error: 'Form not found' });
    }

    // Update form data
    const updatedForm = {
      ...existingForm,
      title: updateData.title,
      description: updateData.description,
      dueDate: updateData.dueDate ? new Date(updateData.dueDate) : null,
      allowLateSubmissions: updateData.allowLateSubmissions,
      allowMultipleResponses: updateData.allowMultipleResponses,
      notifyOnCompletion: updateData.notifyOnCompletion,
      updatedAt: new Date(),
      subjectMatrix: updateData.subjectMatrix.map(s => ({
        subjectId: new ObjectId(s.subjectId),
        subjectName: s.subjectName,
        subjectEmail: s.subjectEmail,
        evaluators: s.evaluators.map(e => ({
          evaluatorId: new ObjectId(e.evaluatorId),
          evaluatorName: e.evaluatorName,
          evaluatorEmail: e.evaluatorEmail,
          position: e.position
        }))
      })),
      questions: updateData.questions.map(q => ({
        id: q.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: q.text,
        type: q.type || 'text',
        required: q.required !== false,
        canSubjectAnswer: q.canSubjectAnswer || false,
        evaluatorPositions: q.evaluatorPositions || [],
        options: q.options || []
      }))
    };

    await db.collection('forms').updateOne({ _id: formId }, { $set: updatedForm });

    // Delete existing assignments and create new ones
    await db.collection('enhanced_assignments').deleteMany({ formId });
    
    // Recreate assignments with updated structure
    const assignments = [];
    const currentTime = new Date();

    for (const subject of updatedForm.subjectMatrix) {
      // Subject assignment
      const subjectAssignment = {
        _id: new ObjectId(),
        formId: formId,
        participantType: 'subject',
        participantId: subject.subjectId,
        participantName: subject.subjectName,
        participantEmail: subject.subjectEmail,
        assignedQuestions: updatedForm.questions
          .filter(q => q.canSubjectAnswer)
          .map(q => q.id),
        token: crypto.randomBytes(32).toString('hex'),
        status: 'pending',
        createdAt: currentTime,
        updatedAt: currentTime,
        dueDate: updatedForm.dueDate
      };
      assignments.push(subjectAssignment);

      // Evaluator assignments
      for (const evaluator of subject.evaluators) {
        const evaluatorAssignment = {
          _id: new ObjectId(),
          formId: formId,
          participantType: 'evaluator',
          participantId: evaluator.evaluatorId,
          participantName: evaluator.evaluatorName,
          participantEmail: evaluator.evaluatorEmail,
          subjectId: subject.subjectId,
          subjectName: subject.subjectName,
          subjectEmail: subject.subjectEmail,
          evaluatorPosition: evaluator.position,
          assignedQuestions: updatedForm.questions
            .filter(q => q.evaluatorPositions.includes(evaluator.position))
            .map(q => q.id),
          token: crypto.randomBytes(32).toString('hex'),
          status: 'pending',
          createdAt: currentTime,
          updatedAt: currentTime,
          dueDate: updatedForm.dueDate
        };
        assignments.push(evaluatorAssignment);
      }
    }

    if (assignments.length > 0) {
      await db.collection('enhanced_assignments').insertMany(assignments);
    }

    console.log(`✅ Enhanced form updated successfully with ${assignments.length} new assignments`);

    res.json({
      success: true,
      message: 'Form updated successfully',
      assignmentsCreated: assignments.length
    });

  } catch (error) {
    console.error('❌ Error updating enhanced form:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update enhanced form',
      details: error.message 
    });
  }
});

// Get Enhanced Evaluation
app.get('/api/enhanced-evaluate/:token', async (req, res) => {
  try {
    const token = req.params.token;
    
    console.log(`📊 Getting enhanced evaluation for token: ${token}`);
    
    // Find the assignment by token
    const assignment = await db.collection('enhanced_assignments').findOne({ token });
    
    if (!assignment) {
      return res.status(404).json({ error: 'Invalid evaluation link' });
    }
    
    // Get the form
    const form = await db.collection('forms').findOne({ _id: assignment.formId });
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Check if already completed and if multiple responses are allowed
    let existingResponse = null;
    if (assignment.status === 'completed') {
      existingResponse = await db.collection('enhanced_responses').findOne({ 
        assignmentId: assignment._id 
      });
      
      // If completed and multiple responses not allowed, return view mode data
      if (!form.allowMultipleResponses) {
        console.log(`📖 Returning view-only data for completed evaluation`);
      }
    }
    
    // Filter questions based on assignment
    const filteredQuestions = form.questions.filter(q => 
      assignment.assignedQuestions.includes(q.id)
    );

    console.log(`🔍 Assignment details for token ${token}:`);
    console.log(`   - Participant: ${assignment.participantEmail} (${assignment.participantType})`);
    console.log(`   - Status: ${assignment.status}`);
    console.log(`   - Allow Multiple Responses: ${form.allowMultipleResponses}`);
    console.log(`   - Assigned Questions: ${assignment.assignedQuestions}`);
    console.log(`   - Filtered Questions: ${filteredQuestions.length}`);

    // Get participants list for transparency
    const allAssignments = await db.collection('enhanced_assignments')
      .find({ formId: assignment.formId })
      .toArray();

    let participantInfo = {
      subjects: [],
      evaluators: []
    };

    if (assignment.participantType === 'subject') {
      // Show all evaluators for this subject
      participantInfo.evaluators = allAssignments
        .filter(a => a.participantType === 'evaluator' && a.subjectId.toString() === assignment.participantId.toString())
        .map(a => ({
          name: a.participantName,
          email: a.participantEmail,
          position: a.evaluatorPosition,
          status: a.status
        }));
    } else {
      // Show subject being evaluated and other evaluators
      participantInfo.subjects = [{
        name: assignment.subjectName,
        email: assignment.subjectEmail
      }];
      
      participantInfo.evaluators = allAssignments
        .filter(a => a.participantType === 'evaluator' && 
                     a.subjectId.toString() === assignment.subjectId.toString() &&
                     a._id.toString() !== assignment._id.toString())
        .map(a => ({
          name: a.participantName,
          email: a.participantEmail,
          position: a.evaluatorPosition,
          status: a.status
        }));
    }
    
    console.log(`📊 Found enhanced assignment for ${assignment.participantEmail} (${assignment.participantType}${assignment.evaluatorPosition ? ` position ${assignment.evaluatorPosition}` : ''})`);
    
    const responseData = {
      form: {
        ...form,
        questions: filteredQuestions
      },
      assignment,
      participantInfo,
      allowMultipleResponses: form.allowMultipleResponses || false,
      token
    };
    
    // Include existing response data if available
    if (existingResponse) {
      responseData.existingResponse = {
        responses: existingResponse.responses,
        submittedAt: existingResponse.submittedAt,
        status: 'completed'
      };
    }
    
    res.json(responseData);
  } catch (error) {
    console.error('Error getting enhanced evaluation:', error);
    res.status(500).json({ error: 'Failed to load evaluation' });
  }
});

// Submit Enhanced Evaluation
app.post('/api/enhanced-evaluate/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const { responses } = req.body;
    
    console.log(`📊 Submitting enhanced evaluation for token: ${token}`);
    
    // Find the assignment by token
    const assignment = await db.collection('enhanced_assignments').findOne({ token });
    
    if (!assignment) {
      return res.status(404).json({ error: 'Invalid evaluation link' });
    }
    
    // Check if response already exists (for updates)
    const existingResponse = await db.collection('enhanced_responses').findOne({ 
      assignmentId: assignment._id 
    });
    
    if (existingResponse) {
      // Update existing response
      await db.collection('enhanced_responses').updateOne(
        { _id: existingResponse._id },
        { 
          $set: { 
            responses: responses,
            submittedAt: new Date(),
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            updatedAt: new Date()
          } 
        }
      );
      
      console.log(`🔄 Enhanced evaluation updated by ${assignment.participantEmail} (${assignment.participantType}${assignment.evaluatorPosition ? ` position ${assignment.evaluatorPosition}` : ''})`);
      
      res.json({ 
        success: true, 
        message: 'Evaluation updated successfully',
        responseId: existingResponse._id,
        updated: true
      });
      return;
    }
    
    // Check if already completed (only for new submissions)
    if (assignment.status === 'completed') {
      return res.status(400).json({ error: 'This evaluation has already been completed' });
    }
    
    // Create response record
    const responseRecord = {
      _id: new ObjectId(),
      formId: assignment.formId,
      assignmentId: assignment._id,
      participantType: assignment.participantType,
      participantId: assignment.participantId,
      participantName: assignment.participantName,
      participantEmail: assignment.participantEmail,
      evaluatorPosition: assignment.evaluatorPosition || null,
      subjectId: assignment.subjectId || assignment.participantId,
      subjectName: assignment.subjectName || assignment.participantName,
      subjectEmail: assignment.subjectEmail || assignment.participantEmail,
      responses: responses,
      submittedAt: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      token
    };
    
    // Save response
    await db.collection('enhanced_responses').insertOne(responseRecord);
    
    // Update assignment status
    await db.collection('enhanced_assignments').updateOne(
      { _id: assignment._id },
      { 
        $set: { 
          status: 'completed', 
          completedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );
    
    console.log(`✅ Enhanced evaluation submitted by ${assignment.participantEmail} (${assignment.participantType}${assignment.evaluatorPosition ? ` position ${assignment.evaluatorPosition}` : ''})`);
    
    res.json({ 
      success: true, 
      message: 'Evaluation submitted successfully',
      responseId: responseRecord._id,
      updated: false
    });
  } catch (error) {
    console.error('Error submitting enhanced evaluation:', error);
    res.status(500).json({ error: 'Failed to submit evaluation' });
  }
});

// ========== FORMS API ==========

// Get all forms
app.get('/api/forms', async (req, res) => {
  try {
    const forms = await db.collection('forms').find({}).sort({ createdAt: -1 }).toArray();
    
    // Populate creator information
    const formsWithCreators = await Promise.all(
      forms.map(async (form) => {
        const creator = await db.collection('users').findOne({ _id: form.createdBy });
        return {
          ...form,
          creator: creator ? {
            name: creator.name,
            email: creator.email,
            department: creator.department
          } : null
        };
      })
    );
    
    res.json(formsWithCreators);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// Get a single form by ID
app.get('/api/forms/:formId', async (req, res) => {
  try {
    const formId = new ObjectId(req.params.formId);
    const form = await db.collection('forms').findOne({ _id: formId });
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Populate creator information
    const creator = await db.collection('users').findOne({ _id: form.createdBy });
    const formWithCreator = {
      ...form,
      creator: creator ? {
        name: creator.name,
        email: creator.email,
        department: creator.department
      } : null
    };
    
    res.json(formWithCreator);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// Update a form (regular endpoint, calls enhanced logic internally)
app.put('/api/forms/:formId', async (req, res) => {
  try {
    const formId = req.params.formId;
    const updateData = req.body;
    
    // For enhanced forms, redirect to enhanced update logic
    const form = await db.collection('forms').findOne({ _id: new ObjectId(formId) });
    if (form && form.formType === 'enhanced') {
      // Call the enhanced update logic
      req.params.formId = formId;
      return app._router.handle({ ...req, method: 'PUT', url: `/api/forms/enhanced/${formId}` }, res);
    }
    
    // For other forms, do basic update
    const result = await db.collection('forms').updateOne(
      { _id: new ObjectId(formId) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    const updatedForm = await db.collection('forms').findOne({ _id: new ObjectId(formId) });
    res.json({ success: true, form: updatedForm });
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ error: 'Failed to update form' });
  }
});

// Delete form
app.delete('/api/forms/:id', async (req, res) => {
  try {
    const formId = new ObjectId(req.params.id);
    
    // Delete form and related data
    await Promise.all([
      db.collection('forms').deleteOne({ _id: formId }),
      db.collection('enhanced_assignments').deleteMany({ formId }),
      db.collection('enhanced_responses').deleteMany({ formId }),
      db.collection('notifications').deleteMany({ formId })
    ]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

// Duplicate a form
app.post('/api/forms/:formId/duplicate', async (req, res) => {
  try {
    const formId = new ObjectId(req.params.formId);
    
    const originalForm = await db.collection('forms').findOne({ _id: formId });
    if (!originalForm) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Create duplicate with new ID and timestamp
    const duplicateForm = {
      ...originalForm,
      _id: new ObjectId(),
      title: `${originalForm.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft' // Set as draft initially
    };
    
    const result = await db.collection('forms').insertOne(duplicateForm);
    console.log(`📋 Duplicated form ${formId} as ${result.insertedId}`);
    
    res.json({ _id: result.insertedId, ...duplicateForm });
    
  } catch (error) {
    console.error('Error duplicating form:', error);
    res.status(500).json({ error: 'Failed to duplicate form' });
  }
});

// Get user forms (created by user and assigned to user)
app.get('/api/users/:userId/forms', async (req, res) => {
  try {
    const userIdParam = req.params.userId;
    if (!ObjectId.isValid(userIdParam)) {
      return res.json({
        createdForms: [],
        assignedForms: [],
        assignedSummary: { total: 0, pending: 0, completed: 0 },
        createdSummary: { formsCreated: 0, assignments: 0, totalParticipants: 0, completedParticipants: 0, pendingParticipants: 0 }
      });
    }

    const userId = new ObjectId(userIdParam);

    // Forms created by the user
    const createdForms = await db.collection('forms').find({ createdBy: userId }).toArray();

    // Enhanced assignments for this user
    const myEnhancedAssignments = await db.collection('enhanced_assignments').find({
      participantId: userId
    }).toArray();

    console.log(`📊 User ${userId}: found ${myEnhancedAssignments.length} enhanced assignments`);

    // Process enhanced assignments
    const enhancedFormIds = [...new Set(myEnhancedAssignments.map(a => a.formId?.toString()).filter(Boolean))]
      .map(id => new ObjectId(id));
    const enhancedFormsForAssigned = enhancedFormIds.length
      ? await db.collection('forms').find({ _id: { $in: enhancedFormIds } }).toArray()
      : [];
    const enhancedFormMap = new Map(enhancedFormsForAssigned.map(f => [f._id.toString(), f]));

    const enhancedAssignedForms = await Promise.all(myEnhancedAssignments.map(async (a) => {
      // Check if user has completed this assignment
      const userResponse = await db.collection('enhanced_responses').findOne({
        assignmentId: a._id,
        participantId: userId
      });

      const myStatus = userResponse ? 'completed' : 'pending';
      const form = enhancedFormMap.get(a.formId?.toString() || '');
      const allowMultipleResponses = !!(form?.allowMultipleResponses);

      console.log(`📊 User ${userId} enhanced assignment ${a._id}: responseFound=${!!userResponse}, finalStatus=${myStatus}, role=${a.participantType}`);

      return {
        formId: a.formId,
        formTitle: form?.title || 'Unknown Form',
        assignmentId: a._id,
        myRole: a.participantType, // 'subject' or 'evaluator'
        myToken: a.token,
        myStatus,
        allowMultipleResponses,
        dueDate: a.dueDate || form?.dueDate || null,
        formType: 'enhanced',
        subjectName: a.subjectName || null,
        evaluatorPosition: a.evaluatorPosition || null
      };
    }));

    const assignedForms = enhancedAssignedForms;

    const assignedSummary = {
      total: assignedForms.length,
      completed: assignedForms.filter(x => x.myStatus === 'completed').length
    };
    assignedSummary.pending = Math.max(0, assignedSummary.total - assignedSummary.completed);

    console.log(`📊 User ${userId} summary: total=${assignedSummary.total}, completed=${assignedSummary.completed}, pending=${assignedSummary.pending}`);

    const createdFormsOut = createdForms.map(f => ({
      _id: f._id,
      title: f.title,
      description: f.description,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
      status: f.status,
      questions: f.questions || [],
      formType: f.formType || 'enhanced'
    }));

    res.json({ 
      createdForms: createdFormsOut, 
      assignedForms, 
      assignedSummary, 
      createdSummary: {
        formsCreated: createdForms.length,
        assignments: 0,
        totalParticipants: 0,
        completedParticipants: 0,
        pendingParticipants: 0
      }
    });
  } catch (error) {
    console.error('Error fetching user forms:', error);
    res.status(500).json({ error: 'Failed to fetch user forms' });
  }
});

// Get form assignments for analytics
app.get('/api/forms/:formId/assignments', async (req, res) => {
  try {
    const formId = new ObjectId(req.params.formId);
    
    console.log(`📋 Fetching assignments for form: ${formId}`);

    // Get all assignments for this form
    const assignments = await db.collection('enhanced_assignments').find({ formId }).toArray();
    
    console.log(`📋 Found ${assignments.length} assignments`);

    res.json(assignments);
  } catch (error) {
    console.error('Error fetching form assignments:', error);
    res.status(500).json({ error: 'Failed to fetch form assignments' });
  }
});

// Get form responses for analytics
app.get('/api/forms/:formId/responses', async (req, res) => {
  try {
    const formId = new ObjectId(req.params.formId);
    
    console.log(`📊 Fetching responses for form: ${formId}`);

    // Get all assignments for this form
    const assignments = await db.collection('enhanced_assignments').find({ formId }).toArray();
    console.log(`📋 Found ${assignments.length} assignments`);
    
    const assignmentIds = assignments.map(a => a._id);

    // Pull responses linked to these assignments
    const responses = await db.collection('enhanced_responses').find({
      assignmentId: { $in: assignmentIds }
    }).toArray();
    
    console.log(`📝 Found ${responses.length} responses`);

    // Get user details for responses
    const userIds = [...new Set(responses.map(r => r.participantId))];
    const users = await db.collection('users').find({ 
      _id: { $in: userIds.map(id => new ObjectId(id)) } 
    }).toArray();
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    // Enrich responses with user details
    const enrichedResponses = responses.map(response => ({
      ...response,
      user: userMap.get(response.participantId.toString()),
      userName: userMap.get(response.participantId.toString())?.name || 'Unknown User'
    }));

    // Calculate summary with progress tracking
    const summaryByAssignment = assignments.map(assignment => {
      const assignmentResponses = enrichedResponses.filter(r => 
        r.assignmentId.toString() === assignment._id.toString()
      );
      
      return {
        assignmentId: assignment._id,
        participantName: assignment.participantName,
        participantType: assignment.participantType,
        participantEmail: assignment.participantEmail,
        subjectName: assignment.subjectName || assignment.participantName,
        evaluatorPosition: assignment.evaluatorPosition,
        status: assignment.status,
        hasResponse: assignmentResponses.length > 0,
        response: assignmentResponses[0] || null,
        assignment: assignment
      };
    });

    console.log(`📊 Response summary:`, {
      totalAssignments: assignments.length,
      totalResponses: responses.length,
      summaryItems: summaryByAssignment.length
    });

    res.json({
      assignments,
      responses: enrichedResponses,
      summary: summaryByAssignment
    });
  } catch (error) {
    console.error('Error fetching form responses:', error);
    res.status(500).json({ error: 'Failed to fetch form responses' });
  }
});

// Get notifications for a user
app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const userIdParam = req.params.userId;
    
    if (!ObjectId.isValid(userIdParam)) {
      return res.json([]);
    }
    
    const userId = new ObjectId(userIdParam);
    const notifications = await db.collection('notifications')
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
app.put('/api/notifications/:notificationId/read', async (req, res) => {
  try {
    await db.collection('notifications').updateOne(
      { _id: new ObjectId(req.params.notificationId) },
      { $set: { read: true, read_at: new Date() } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Get dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [formsCount, usersCount, responsesCount] = await Promise.all([
      db.collection('forms').countDocuments(),
      db.collection('users').countDocuments(),
      db.collection('enhanced_responses').countDocuments()
    ]);

    res.json({
      totalForms: formsCount,
      totalUsers: usersCount,
      totalEvaluations: responsesCount,
      pendingEvaluations: Math.max(0, (formsCount * 3) - responsesCount)
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// ========== ADMIN UTILITIES ==========

// Clear all evaluation data
app.delete('/api/admin/clear-data', async (req, res) => {
  try {
    console.log('🧹 Clearing all evaluation data...');
    
    const collections = ['forms', 'enhanced_assignments', 'enhanced_responses', 'notifications'];
    let totalDeleted = 0;
    
    for (const collectionName of collections) {
      const result = await db.collection(collectionName).deleteMany({});
      totalDeleted += result.deletedCount;
      console.log(`🗑️ Cleared ${result.deletedCount} documents from ${collectionName}`);
    }
    
    console.log(`✅ Total documents cleared: ${totalDeleted}`);
    res.json({ 
      success: true, 
      message: `Cleared ${totalDeleted} documents from evaluation collections`,
      collections: collections
    });
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

// Start server
async function startServer() {
  try {
    await connectToDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 CLEAN SERVER running on http://localhost:${PORT}`);
      console.log(`📊 Using MongoDB Atlas for data persistence`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
