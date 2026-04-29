'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';

export default function DebugPage() {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const testDatabaseConnection = async () => {
    try {
      const response = await fetch('/api/test/auth');
      const result = await response.json();
      setTestResults(prev => ({ ...prev, database: result }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, database: { error: error.message } }));
    }
  };

  const testContractConnection = async () => {
    try {
      const response = await fetch('/api/test/contract');
      const result = await response.json();
      setTestResults(prev => ({ ...prev, contract: result }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, contract: { error: error.message } }));
    }
  };

  const testRegistration = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: `test${Date.now()}@example.com`,
          password: 'password123'
        })
      });
      const result = await response.json();
      setTestResults(prev => ({ ...prev, registration: result }));
      
      if (result.success && result.token) {
        // Test the token
        const tokenResponse = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${result.token}` }
        });
        const tokenResult = await tokenResponse.json();
        setTestResults(prev => ({ 
          ...prev, 
          tokenTest: { 
            success: tokenResponse.ok, 
            status: tokenResponse.status,
            result: tokenResult 
          } 
        }));
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, registration: { error: error.message } }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testDatabaseConnection();
    testContractConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">X-Ramp Debug Panel</h1>
        
        {/* Auth Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Auth Loading:</strong> {authLoading ? 'Yes' : 'No'}</p>
            <p><strong>User Logged In:</strong> {user ? 'Yes' : 'No'}</p>
            {user && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Public Key:</strong> {user.publicKey}</p>
                <p><strong>Verified:</strong> {user.verified ? 'Yes' : 'No'}</p>
              </div>
            )}
            <p><strong>Token in localStorage:</strong> {typeof window !== 'undefined' && localStorage.getItem('auth_token') ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Test Results */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Database Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Database Connection</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(testResults.database, null, 2)}
            </pre>
          </div>

          {/* Contract Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Contract Connection</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(testResults.contract, null, 2)}
            </pre>
          </div>

          {/* Registration Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Registration Test</h2>
            <button
              onClick={testRegistration}
              disabled={loading}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Registration'}
            </button>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(testResults.registration, null, 2)}
            </pre>
          </div>

          {/* Token Test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Token Verification Test</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(testResults.tokenTest, null, 2)}
            </pre>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:underline mr-4">
            ← Back to Home
          </Link>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Go to Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}