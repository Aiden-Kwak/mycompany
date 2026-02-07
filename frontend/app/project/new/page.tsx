'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PixelButton from '@/components/pixel/PixelButton';
import PixelCard from '@/components/pixel/PixelCard';

interface SurveyQuestion {
  id: string;
  category: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect';
  options?: string[];
  required: boolean;
  placeholder?: string;
}

const surveyQuestions: SurveyQuestion[] = [
  {
    id: 'project_name',
    category: 'Basic Info',
    question: 'What is your project name?',
    type: 'text',
    required: true,
    placeholder: 'e.g., My Awesome App',
  },
  {
    id: 'project_description',
    category: 'Basic Info',
    question: 'Describe your project in detail',
    type: 'textarea',
    required: true,
    placeholder: 'What does your application do? What problems does it solve?',
  },
  {
    id: 'project_type',
    category: 'Technical',
    question: 'What type of application are you building?',
    type: 'select',
    required: true,
    options: [
      'Web Application',
      'Mobile App (iOS/Android)',
      'Desktop Application',
      'API/Backend Service',
      'Chrome Extension',
      'Other',
    ],
  },
  {
    id: 'tech_stack',
    category: 'Technical',
    question: 'Preferred technology stack',
    type: 'multiselect',
    required: false,
    options: [
      'React/Next.js',
      'Vue.js',
      'Angular',
      'Node.js',
      'Python/Django',
      'Python/Flask',
      'Java/Spring',
      'Go',
      'PostgreSQL',
      'MongoDB',
      'Redis',
    ],
  },
  {
    id: 'features',
    category: 'Features',
    question: 'What are the main features you need?',
    type: 'textarea',
    required: true,
    placeholder: 'List the key features, one per line',
  },
  {
    id: 'user_auth',
    category: 'Features',
    question: 'Do you need user authentication?',
    type: 'select',
    required: true,
    options: [
      'Yes - Email/Password',
      'Yes - OAuth (Google, GitHub, etc.)',
      'Yes - Both',
      'No',
    ],
  },
  {
    id: 'database',
    category: 'Technical',
    question: 'Do you need a database?',
    type: 'select',
    required: true,
    options: [
      'Yes - SQL (PostgreSQL, MySQL)',
      'Yes - NoSQL (MongoDB)',
      'Yes - Both',
      'No',
    ],
  },
  {
    id: 'deployment',
    category: 'Deployment',
    question: 'Where do you want to deploy?',
    type: 'select',
    required: false,
    options: [
      'Vercel',
      'Netlify',
      'AWS',
      'Google Cloud',
      'Heroku',
      'Docker/Self-hosted',
      'Not sure yet',
    ],
  },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const categories = Array.from(new Set(surveyQuestions.map(q => q.category)));
  const currentCategory = categories[currentStep];
  const questionsInCategory = surveyQuestions.filter(q => q.category === currentCategory);
  const totalSteps = categories.length;

  const handleAnswer = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleMultiSelect = (option: string) => {
    setSelectedOptions(prev => {
      if (prev.includes(option)) {
        return prev.filter(o => o !== option);
      }
      return [...prev, option];
    });
  };

  const handleNext = () => {
    // Save multiselect answers
    const multiselectQuestions = questionsInCategory.filter(q => q.type === 'multiselect');
    multiselectQuestions.forEach(q => {
      handleAnswer(q.id, selectedOptions);
    });

    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      setSelectedOptions([]);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setSelectedOptions([]);
    }
  };

  const handleSubmit = () => {
    console.log('Survey Answers:', answers);
    // TODO: Send to backend API
    router.push('/');
  };

  const canProceed = () => {
    const requiredQuestions = questionsInCategory.filter(q => q.required);
    return requiredQuestions.every(q => {
      const answer = answers[q.id];
      if (q.type === 'multiselect') {
        return selectedOptions.length > 0;
      }
      return answer && answer.toString().trim().length > 0;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold gradient-text mb-3">
            Create New Project
          </h1>
          <p className="text-lg text-slate-600">
            Tell us about your project and our AI agents will build it for you
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-slate-700">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}%
            </span>
          </div>
          <div className="progress-bar h-3">
            <div
              className="progress-fill"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Survey Card */}
        <PixelCard className="p-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {currentCategory}
            </h2>
            <p className="text-slate-600">
              Answer the questions below to help our agents understand your needs
            </p>
          </div>

          <div className="space-y-6">
            {questionsInCategory.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    {question.question}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </span>

                  {question.type === 'text' && (
                    <input
                      type="text"
                      className="input mt-2"
                      placeholder={question.placeholder}
                      value={(answers[question.id] as string) || ''}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                    />
                  )}

                  {question.type === 'textarea' && (
                    <textarea
                      className="input mt-2 min-h-[120px] resize-y"
                      placeholder={question.placeholder}
                      value={(answers[question.id] as string) || ''}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                    />
                  )}

                  {question.type === 'select' && (
                    <select
                      className="input mt-2"
                      value={(answers[question.id] as string) || ''}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                    >
                      <option value="">Select an option...</option>
                      {question.options?.map(option => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}

                  {question.type === 'multiselect' && (
                    <div className="mt-2 space-y-2">
                      {question.options?.map(option => (
                        <label
                          key={option}
                          className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedOptions.includes(option)}
                            onChange={() => handleMultiSelect(option)}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm text-slate-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </label>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <PixelButton
              variant="secondary"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              ← Back
            </PixelButton>

            <div className="flex items-center space-x-2">
              {categories.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-primary-600'
                      : index < currentStep
                      ? 'bg-success-500'
                      : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>

            <PixelButton
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {currentStep === totalSteps - 1 ? 'Create Project 🚀' : 'Next →'}
            </PixelButton>
          </div>
        </PixelCard>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-slate-600 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <p>💡 Don't worry if you're not sure about some answers - our AI agents can adapt!</p>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
