'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Neo4jTestPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testNeo4j = async (action: string) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/neo4j-init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data);
      } else {
        setError(data.message || 'An error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Neo4j Database Test Page</h1>
        
        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Database Initialization</CardTitle>
              <CardDescription>
                Initialize the Neo4j database with indexes and seed data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => testNeo4j('init')} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Initializing...' : 'Initialize Database'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Run Tests</CardTitle>
              <CardDescription>
                Test all Neo4j functionality including user creation and mentorship
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => testNeo4j('test')} 
                disabled={loading}
                className="w-full"
                variant="secondary"
              >
                {loading ? 'Running Tests...' : 'Run All Tests'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create Sample Data</CardTitle>
              <CardDescription>
                Create sample student and mentor users for testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => testNeo4j('sample-data')} 
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                {loading ? 'Creating...' : 'Create Sample Data'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Database Statistics</CardTitle>
              <CardDescription>
                View current database statistics and node counts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => testNeo4j('stats')} 
                disabled={loading}
                className="w-full"
                variant="ghost"
              >
                {loading ? 'Loading...' : 'Get Statistics'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {results && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Success</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Badge variant="secondary" className="mb-2">Message</Badge>
                  <p className="text-green-700">{results.message}</p>
                </div>
                
                {results.data && (
                  <div>
                    <Badge variant="secondary" className="mb-2">Data</Badge>
                    <pre className="bg-white p-3 rounded text-sm overflow-auto">
                      {JSON.stringify(results.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">What This Page Tests:</h2>
          <ul className="space-y-2 text-gray-700">
            <li>• <strong>Database Connection:</strong> Verifies Neo4j Aura connection</li>
            <li>• <strong>Index Creation:</strong> Sets up performance indexes</li>
            <li>• <strong>Seed Data:</strong> Creates initial skills, interests, and programs</li>
            <li>• <strong>User Management:</strong> Tests student and mentor creation</li>
            <li>• <strong>Mentorship System:</strong> Tests relationship creation and matching</li>
            <li>• <strong>Graph Queries:</strong> Tests complex relationship queries</li>
          </ul>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Next Steps:</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>Click "Initialize Database" to set up Neo4j</li>
            <li>Run tests to verify functionality</li>
            <li>Create sample data to see the system in action</li>
            <li>Check statistics to monitor database health</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
