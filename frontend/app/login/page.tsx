'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PixelCard from '@/components/pixel/PixelCard';
import PixelButton from '@/components/pixel/PixelButton';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGitHubLogin = () => {
    setLoading(true);
    // Redirect to Django backend GitHub OAuth
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/accounts/github/login/`;
  };

  const handleGitHubSignup = () => {
    // Open GitHub signup in new tab
    window.open('https://github.com/signup', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo & Title */}
        <div className="text-center animate-slide-up">
          <div className="text-6xl mb-4">🏢</div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2 pixel-font">
            My Dev Company
          </h1>
          <p className="text-lg text-slate-600">
            AI-Powered Application Development Platform
          </p>
        </div>

        {/* Login Card */}
        <PixelCard className="p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Welcome Back!
              </h2>
              <p className="text-slate-600">
                Sign in with your GitHub account to continue
              </p>
            </div>

            {/* Features */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">✨ What you'll get:</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>AI-powered automatic code generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>7 specialized AI agents working for you</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Automatic GitHub repository management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Real-time project monitoring</span>
                </li>
              </ul>
            </div>

            {/* GitHub Login Button */}
            <button
              onClick={handleGitHubLogin}
              disabled={loading}
              className="w-full bg-gray-900 text-white py-4 rounded-lg hover:bg-gray-800 
                       transition-all font-semibold flex items-center justify-center gap-3
                       disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl
                       transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              {loading ? 'Connecting...' : 'Continue with GitHub'}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Don't have a GitHub account?
                </span>
              </div>
            </div>

            {/* GitHub Signup Button */}
            <button
              onClick={handleGitHubSignup}
              className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg 
                       hover:border-gray-400 hover:bg-gray-50 transition-all font-semibold
                       flex items-center justify-center gap-2"
            >
              <span>Create GitHub Account</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
        </PixelCard>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
          <p className="mt-2">
            Need help? <a href="#" className="text-blue-600 hover:text-blue-800 underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Made with Bob