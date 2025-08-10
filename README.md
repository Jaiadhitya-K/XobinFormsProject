# Multi-Stakeholder Evaluation Platform

###HOW TO TEST THIS
- CHECK OUT THE FOLDER "TEST RESOURCES", TO GET A CSV OF ALL THE PRE-EXISTING USERS OF THIS PLATFORM
- TO TEST THE UPLOAD CSV FEATURE, A SAMPLE CSV IS ALSO AVAILABLE IN THE "TEST RESOURCES" FOLDER

A comprehensive web application for creating and managing multi-stakeholder evaluations with an intuitive admin interface and public evaluation forms.

## 🚀 Features

### Admin Features
- **Form Builder**: Create custom evaluation forms with different question types
  - Rating scales (1-3, 1-5, 1-10)
  - Text responses
  - Multiple choice questions
- **CSV Upload**: Bulk import subjects and evaluators from CSV files
- **Dashboard**: Overview of forms, subjects, and evaluation progress
- **Reports & Analytics**: Comprehensive reporting with charts and data visualization

### Evaluator Features
- **Public Access**: Simple URL-based access to evaluation forms
- **Responsive Design**: Mobile-friendly evaluation interface
- **Secure Tokens**: Each evaluator gets a unique, secure access token

## 🛠️ Tech Stack

- **Frontend**: React + Vite, Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: MongoDB Atlas
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Heroicons
- **CSV Processing**: PapaParse
- **Routing**: React Router Dom

## 📋 Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v16 or higher)
2. **Supabase Account** - for authentication
3. **MongoDB Atlas Account** - for database
4. **Git** - for version control

## 🏗️ Project Structure

```
src/
├── components/           # Reusable components
│   ├── layout/          # Layout components
│   └── LoadingSpinner.jsx
├── contexts/            # React contexts
│   └── AuthContext.jsx  # Authentication context
├── lib/                 # Utilities and configurations
│   ├── api.js          # API client
│   └── supabase.js     # Supabase configuration
├── pages/              # Page components
│   ├── admin/          # Admin pages
│   │   ├── Dashboard.jsx
│   │   ├── CreateForm.jsx
│   │   ├── UploadCSV.jsx
│   │   ├── Reports.jsx
│   │   └── Login.jsx
│   └── evaluator/      # Evaluator pages
│       └── EvaluationForm.jsx
├── App.jsx             # Main app component
└── main.jsx           # App entry point
```

## ⚙️ Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_MONGODB_URI=your_mongodb_atlas_uri_here
VITE_API_BASE_URL=http://localhost:5000/api
```

### 2. Supabase Setup

1. Create a new Supabase project
2. Copy your project URL and anon key to the `.env` file
3. No additional table setup needed (using for auth only)

### 3. MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster
2. Create a database (e.g., `evaluation_platform`)
3. Copy your connection string to the `.env` file

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📊 Database Schema

### Collections

#### `forms`
```javascript
{
  "_id": "ObjectId",
  "title": "String",
  "questions": [
    {
      "id": "String",
      "type": "rating|text|multiple_choice",
      "text": "String",
      "scale": "Number", // for rating type
      "options": ["String"], // for multiple_choice type
      "required": "Boolean"
    }
  ],
  "createdBy": "String", // Supabase user ID
  "createdAt": "Date"
}
```

#### `subjects`
```javascript
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String",
  "formId": "ObjectId"
}
```

#### `evaluators`
```javascript
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String",
  "subjectId": "ObjectId",
  "token": "String", // Unique access token
  "status": "pending|completed"
}
```

#### `responses`
```javascript
{
  "_id": "ObjectId",
  "subjectId": "ObjectId",
  "evaluatorId": "ObjectId",
  "answers": [
    {
      "questionId": "String",
      "answer": "String|Number"
    }
  ],
  "submittedAt": "Date"
}
```

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/forms` | Create new form |
| GET | `/forms` | List forms for logged-in admin |
| POST | `/upload-csv` | Parse CSV, create subjects & evaluators |
| GET | `/form/:token` | Retrieve form + subject for evaluator |
| POST | `/form/:token/submit` | Submit evaluation |
| GET | `/reports/:subjectId` | Get aggregated report |

## 📱 Usage

### For Admins

1. **Login**: Use your Supabase credentials to access the admin panel
2. **Create Forms**: Build custom evaluation forms with various question types
3. **Upload CSV**: Import subjects and evaluators using the CSV template
4. **Monitor Progress**: Track evaluation completion on the dashboard
5. **View Reports**: Analyze results with detailed charts and statistics

### For Evaluators

1. **Access**: Use the unique URL provided to access your evaluation
2. **Complete**: Fill out the evaluation form for the assigned subject
3. **Submit**: Submit your responses (can only submit once per token)

### CSV Format

Use this header format for CSV uploads:

```csv
Subject Name,Subject Email,Evaluator Name,Evaluator Email
John Doe,john@example.com,Jane Smith,jane@example.com
Alice Johnson,alice@example.com,Bob Wilson,bob@example.com
```

## 🎨 Design System

- **Primary Color**: #1E88E5 (Blue)
- **Typography**: Inter font family
- **Components**: Tailwind CSS utility classes
- **Layout**: Responsive design with mobile-first approach

## 🔒 Security

- All admin routes require Supabase authentication
- Evaluator access via secure, unique tokens only
- No cross-evaluator data access
- Token-based evaluation form access

## 🚀 Deployment

This application is designed to be deployed on modern hosting platforms that support:

- Node.js applications
- Environment variables
- Static file serving

### Recommended Platforms
- Vercel
- Netlify
- Railway
- Render

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the GitHub repository.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
