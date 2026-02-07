# OpenCode Automation UI/UX Plan

## Overview
This document outlines the UI/UX design for integrating OpenCode automation features into the MyCompany platform.

## User Flow

```
1. User creates project with survey
   ↓
2. User clicks "🤖 Generate Planning Document" button
   ↓
3. PlanningDocumentModal opens
   - Shows AI analyzing requirements
   - Displays generated PRD sections
   - Shows recommended agents
   ↓
4. User reviews and confirms planning document
   ↓
5. System auto-creates agents
   ↓
6. User clicks "🚀 Start Auto Development" button
   ↓
7. AutoDevelopmentModal opens
   - Configure AI provider (OpenAI, Claude, etc.)
   - Select model for each agent
   - Review estimated cost
   ↓
8. Development starts
   ↓
9. DevelopmentProgressTracker shows real-time progress
   - Task execution status
   - Generated files
   - Logs and errors
   ↓
10. Code automatically committed to GitHub
    ↓
11. User reviews generated code
```

## New UI Components

### 1. Planning Document Generation Button
**Location**: Project detail page, Quick Actions section
**Design**:
```tsx
<PixelButton variant="primary" size="lg">
  🤖 Generate Planning Document
</PixelButton>
```

### 2. PlanningDocumentModal
**Purpose**: Display AI-generated planning document and agent recommendations
**Features**:
- Loading state with AI thinking animation
- Tabbed interface for PRD sections:
  - Executive Summary
  - Technical Requirements
  - Feature Specifications
  - Development Plan
  - Timeline
- Agent recommendations list with auto-create option
- Approve/Regenerate actions

**Design**:
```
┌─────────────────────────────────────────────┐
│  🤖 AI Planning Document                    │
│  ─────────────────────────────────────────  │
│                                             │
│  [Executive Summary] [Tech Req] [Features]  │
│                                             │
│  📋 Executive Summary                       │
│  ─────────────────────────────────────────  │
│  [Generated content here...]                │
│                                             │
│  🤖 Recommended Agents (7)                  │
│  ─────────────────────────────────────────  │
│  ✓ Product Manager - 📋 Alice              │
│  ✓ Frontend Developer - 💻 Bob             │
│  ✓ Backend Developer - ⚙️ Charlie          │
│  ...                                        │
│                                             │
│  [Regenerate] [Approve & Create Agents]     │
└─────────────────────────────────────────────┘
```

### 3. Auto Development Button
**Location**: Project detail page, Quick Actions section
**Design**:
```tsx
<PixelButton variant="success" size="lg">
  🚀 Start Auto Development
</PixelButton>
```
**State**: Disabled until planning document exists

### 4. AutoDevelopmentModal
**Purpose**: Configure and start automated development
**Features**:
- AI provider selection (OpenAI, Claude, Gemini, Local)
- Model selection per agent/task
- Cost estimation
- Parallel execution toggle
- GitHub auto-commit toggle

**Design**:
```
┌─────────────────────────────────────────────┐
│  🚀 Start Automated Development             │
│  ─────────────────────────────────────────  │
│                                             │
│  AI Provider Configuration                  │
│  ┌─────────────────────────────────────┐   │
│  │ Provider: [OpenAI ▼]                │   │
│  │ Model: [gpt-4 ▼]                    │   │
│  │ API Key: [••••••••••] ✓ Connected   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Task Configuration                         │
│  ┌─────────────────────────────────────┐   │
│  │ ☑ Setup Project Structure           │   │
│  │ ☑ Generate Backend API              │   │
│  │ ☑ Generate Frontend UI              │   │
│  │ ☑ Generate Tests                    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Options                                    │
│  ☑ Run tasks in parallel                   │
│  ☑ Auto-commit to GitHub                   │
│  ☐ Send notification on completion         │
│                                             │
│  💰 Estimated Cost: $2.50 - $5.00          │
│  ⏱️ Estimated Time: 10-15 minutes          │
│                                             │
│  [Cancel] [Start Development]               │
└─────────────────────────────────────────────┘
```

### 5. DevelopmentProgressTracker
**Purpose**: Real-time progress tracking during development
**Features**:
- Task status indicators
- Live logs
- Generated files preview
- Error handling
- Pause/Resume/Cancel controls

**Design**:
```
┌─────────────────────────────────────────────┐
│  🚀 Development in Progress...              │
│  ─────────────────────────────────────────  │
│                                             │
│  Overall Progress: ████████░░ 80%          │
│                                             │
│  Tasks                                      │
│  ✅ Setup Project Structure (100%)         │
│  ⏳ Generate Backend API (75%)             │
│     └─ Creating models...                  │
│  ⏸️ Generate Frontend UI (0%)              │
│  ⏸️ Generate Tests (0%)                    │
│                                             │
│  📁 Generated Files (12)                   │
│  ├─ package.json                           │
│  ├─ src/models/user.py                     │
│  ├─ src/api/routes.py                      │
│  └─ ...                                    │
│                                             │
│  📋 Live Logs                              │
│  ┌─────────────────────────────────────┐   │
│  │ [10:30:15] Starting backend task... │   │
│  │ [10:30:20] Analyzing requirements...│   │
│  │ [10:30:45] Generating models...     │   │
│  │ [10:31:10] Creating API routes...   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Pause] [Cancel] [View Details]           │
└─────────────────────────────────────────────┘
```

### 6. Planning Document Card
**Location**: Project detail page, new section after Requirements
**Purpose**: Display existing planning document summary
**Design**:
```tsx
<PixelCard>
  <div className="flex items-center justify-between mb-4">
    <h3>📋 Planning Document</h3>
    <span className="badge badge-success">Generated</span>
  </div>
  <p className="text-sm text-slate-600 mb-4">
    {planningDoc.executive_summary.substring(0, 200)}...
  </p>
  <div className="flex space-x-2">
    <PixelButton size="sm" onClick={viewFullDocument}>
      View Full Document
    </PixelButton>
    <PixelButton size="sm" variant="secondary" onClick={regenerate}>
      Regenerate
    </PixelButton>
  </div>
</PixelCard>
```

### 7. Development History Card
**Location**: Project detail page, new section
**Purpose**: Show past development runs
**Design**:
```tsx
<PixelCard>
  <h3>🚀 Development History</h3>
  <div className="space-y-3 mt-4">
    {developmentRuns.map(run => (
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
        <div>
          <div className="font-semibold">{run.created_at}</div>
          <div className="text-sm text-slate-600">
            {run.tasks_completed}/{run.tasks_total} tasks completed
          </div>
        </div>
        <span className={`badge ${
          run.status === 'completed' ? 'badge-success' :
          run.status === 'failed' ? 'badge-danger' :
          'badge-primary'
        }`}>
          {run.status}
        </span>
      </div>
    ))}
  </div>
</PixelCard>
```

## Updated Project Detail Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  Header (Project name, status, back button)             │
├─────────────────────────────────────────────────────────┤
│  Statistics (Agents, Tasks, Completion Rate)            │
├─────────────────────────────────────────────────────────┤
│  Requirements (Survey answers)                          │
├─────────────────────────────────────────────────────────┤
│  📋 Planning Document (NEW)                             │
│  - Summary of AI-generated PRD                          │
│  - View/Regenerate buttons                              │
├─────────────────────────────────────────────────────────┤
│  🤖 AI Agents                                           │
│  - Agent cards                                          │
│  - Add Agent button                                     │
├─────────────────────────────────────────────────────────┤
│  📋 Tasks                                               │
│  - Task board/list                                      │
│  - Add Task button                                      │
├─────────────────────────────────────────────────────────┤
│  🚀 Development History (NEW)                           │
│  - Past development runs                                │
│  - Status and results                                   │
├─────────────────────────────────────────────────────────┤
│  🔗 GitHub Integration                                  │
│  - Connected repositories                               │
│  - Connect button                                       │
├─────────────────────────────────────────────────────────┤
│  Quick Actions (UPDATED)                                │
│  - 🤖 Generate Planning Document (NEW)                  │
│  - 🚀 Start Auto Development (NEW)                      │
│  - 🔑 Manage API Keys                                   │
│  - 📊 View Analytics                                    │
│  - ⚙️ Project Settings                                  │
└─────────────────────────────────────────────────────────┘
```

## Color Scheme & Icons

### Status Colors
- **Planning**: 🔵 Blue (#3B82F6)
- **In Progress**: 🟡 Yellow (#F59E0B)
- **Completed**: 🟢 Green (#10B981)
- **Failed**: 🔴 Red (#EF4444)
- **Paused**: 🟠 Orange (#F97316)

### Icons
- Planning Document: 📋
- Auto Development: 🚀
- AI Agent: 🤖
- Code Generation: 💻
- Success: ✅
- Error: ❌
- Warning: ⚠️
- Loading: ⏳
- Pause: ⏸️
- Play: ▶️

## Animations

### 1. AI Thinking Animation
```css
@keyframes thinking {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
```

### 2. Progress Bar Animation
```css
@keyframes progress {
  0% { width: 0%; }
  100% { width: var(--progress); }
}
```

### 3. Pulse Animation (for active tasks)
```css
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

## Responsive Design

### Desktop (>1024px)
- Full layout with all sections visible
- Modals: 800px width
- Progress tracker: Sidebar layout

### Tablet (768px - 1024px)
- Stacked sections
- Modals: 90% width
- Progress tracker: Full width

### Mobile (<768px)
- Single column layout
- Modals: Full screen
- Progress tracker: Simplified view
- Collapsible sections

## Accessibility

- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader friendly status updates
- High contrast mode support
- Focus indicators

## Error Handling UI

### Error States
1. **API Connection Error**
   - Show retry button
   - Display error message
   - Suggest checking API keys

2. **Generation Failed**
   - Show error details
   - Offer to regenerate
   - Save partial results

3. **Task Execution Error**
   - Highlight failed task
   - Show error logs
   - Offer to retry or skip

### Error Display
```tsx
<div className="bg-red-50 border border-red-200 rounded-lg p-4">
  <div className="flex items-start">
    <span className="text-2xl mr-3">❌</span>
    <div>
      <h4 className="font-semibold text-red-900">
        Task Failed: Generate Backend API
      </h4>
      <p className="text-sm text-red-700 mt-1">
        OpenCode returned an error: Invalid syntax in prompt
      </p>
      <div className="mt-3 space-x-2">
        <PixelButton size="sm" variant="danger">
          Retry Task
        </PixelButton>
        <PixelButton size="sm" variant="secondary">
          Skip Task
        </PixelButton>
        <PixelButton size="sm" variant="secondary">
          View Logs
        </PixelButton>
      </div>
    </div>
  </div>
</div>
```

## Loading States

### 1. Planning Document Generation
```tsx
<div className="text-center py-12">
  <div className="text-6xl mb-4 animate-bounce">🤖</div>
  <h3 className="text-xl font-semibold mb-2">
    AI is analyzing your requirements...
  </h3>
  <p className="text-slate-600 mb-4">
    This may take 30-60 seconds
  </p>
  <div className="w-64 mx-auto bg-slate-200 rounded-full h-2">
    <div className="bg-primary-500 h-2 rounded-full animate-pulse" 
         style={{width: '60%'}} />
  </div>
</div>
```

### 2. Development in Progress
```tsx
<div className="flex items-center space-x-3">
  <div className="animate-spin text-2xl">⚙️</div>
  <div>
    <div className="font-semibold">Generating code...</div>
    <div className="text-sm text-slate-600">
      Task 2 of 4 in progress
    </div>
  </div>
</div>
```

## Success States

### Planning Document Generated
```tsx
<div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
  <div className="text-6xl mb-4">✅</div>
  <h3 className="text-xl font-semibold text-green-900 mb-2">
    Planning Document Generated!
  </h3>
  <p className="text-green-700 mb-4">
    7 agents recommended and ready to create
  </p>
  <PixelButton variant="success">
    Create Agents & Continue
  </PixelButton>
</div>
```

### Development Completed
```tsx
<div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
  <div className="text-6xl mb-4">🎉</div>
  <h3 className="text-xl font-semibold text-green-900 mb-2">
    Development Completed!
  </h3>
  <p className="text-green-700 mb-4">
    Generated 45 files and committed to GitHub
  </p>
  <div className="flex justify-center space-x-3">
    <PixelButton variant="success">
      View Generated Code
    </PixelButton>
    <PixelButton variant="secondary">
      View on GitHub
    </PixelButton>
  </div>
</div>
```

## Implementation Priority

### Phase 1: Core Components (Week 1)
1. ✅ Update types.ts with planning document types
2. ✅ Add API methods for planning and development
3. ✅ Create PlanningDocumentModal component
4. ✅ Create AutoDevelopmentModal component
5. ✅ Update project detail page with new buttons

### Phase 2: Progress Tracking (Week 2)
1. Create DevelopmentProgressTracker component
2. Implement real-time updates (polling or WebSocket)
3. Add error handling UI
4. Add success/failure notifications

### Phase 3: Polish & Testing (Week 3)
1. Add animations and transitions
2. Implement responsive design
3. Add accessibility features
4. End-to-end testing
5. Performance optimization

## Technical Notes

### State Management
- Use React hooks (useState, useEffect)
- Consider Context API for global state (development progress)
- Polling interval: 2 seconds for progress updates

### API Integration
- Add `/api/planning/generate/` endpoint call
- Add `/api/projects/{id}/start-development/` endpoint call
- Add `/api/projects/{id}/development-status/` for progress
- Handle long-running requests with proper timeouts

### Performance
- Lazy load modals
- Virtualize long lists (files, logs)
- Debounce API calls
- Cache planning documents

### Security
- Validate API keys before starting development
- Sanitize user inputs
- Secure WebSocket connections
- Rate limit API calls

## Future Enhancements

1. **AI Model Comparison**
   - Side-by-side comparison of different models
   - Cost vs quality analysis

2. **Code Review Integration**
   - AI-powered code review
   - Suggest improvements

3. **Deployment Integration**
   - One-click deploy to Vercel/Netlify
   - Auto-configure CI/CD

4. **Collaboration Features**
   - Share planning documents
   - Team review and approval workflow

5. **Analytics Dashboard**
   - Track development costs
   - Monitor AI performance
   - Success rate metrics