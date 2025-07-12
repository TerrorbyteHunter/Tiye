import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

interface TestScenario {
  id: string;
  name: string;
  description: string;
  phoneNumber: string;
  pin: string;
  expectedResult: 'success' | 'failed' | 'pending';
  errorMessage?: string;
  enabled: boolean;
}

interface PaymentTest {
  id: string;
  timestamp: Date;
  scenario: string;
  phoneNumber: string;
  amount: number;
  result: 'success' | 'failed' | 'pending';
  message: string;
  transactionId?: string;
}

export default function PaymentTestingPage() {
  const [testMode, setTestMode] = useState(true);
  const [scenarios, setScenarios] = useState<TestScenario[]>([
    {
      id: 'success',
      name: 'Successful Payment',
      description: 'Simulates a successful mobile money payment',
      phoneNumber: '260977123456',
      pin: '1234',
      expectedResult: 'success',
      enabled: true
    },
    {
      id: 'insufficient_funds',
      name: 'Insufficient Funds',
      description: 'Simulates insufficient balance in mobile money account',
      phoneNumber: '260977123450',
      pin: '1234',
      expectedResult: 'failed',
      errorMessage: 'Insufficient funds. Please top up your mobile money account and try again.',
      enabled: true
    },
    {
      id: 'network_error',
      name: 'Network Error',
      description: 'Simulates network connectivity issues',
      phoneNumber: '260977123451',
      pin: '1234',
      expectedResult: 'failed',
      errorMessage: 'Network error. Please check your connection and try again.',
      enabled: true
    },
    {
      id: 'pending',
      name: 'Pending Payment',
      description: 'Simulates a payment that is being processed',
      phoneNumber: '260977123452',
      pin: '1234',
      expectedResult: 'pending',
      enabled: true
    },
    {
      id: 'invalid_pin',
      name: 'Invalid PIN',
      description: 'Simulates wrong PIN entry',
      phoneNumber: '260977123453',
      pin: '9999',
      expectedResult: 'failed',
      errorMessage: 'Invalid PIN. Please enter a 4-digit PIN.',
      enabled: true
    },
    {
      id: 'invalid_phone',
      name: 'Invalid Phone Number',
      description: 'Simulates invalid phone number format',
      phoneNumber: '260977123',
      pin: '1234',
      expectedResult: 'failed',
      errorMessage: 'Invalid phone number. Please enter a valid 10-digit phone number.',
      enabled: true
    }
  ]);

  const [testHistory, setTestHistory] = useState<PaymentTest[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);

  useEffect(() => {
    // Load test mode from localStorage
    const savedTestMode = localStorage.getItem('flutterwave_test_mode');
    if (savedTestMode !== null) {
      setTestMode(savedTestMode === 'true');
    }

    // Load test history from localStorage
    const savedHistory = localStorage.getItem('payment_test_history');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setTestHistory(history.map((test: any) => ({
          ...test,
          timestamp: new Date(test.timestamp)
        })));
      } catch (error) {
        console.error('Failed to load test history:', error);
      }
    }
  }, []);

  const handleTestModeToggle = (enabled: boolean) => {
    setTestMode(enabled);
    localStorage.setItem('flutterwave_test_mode', enabled.toString());
  };

  const handleScenarioToggle = (scenarioId: string, enabled: boolean) => {
    setScenarios(prev => prev.map(scenario => 
      scenario.id === scenarioId ? { ...scenario, enabled } : scenario
    ));
  };

  const handleScenarioUpdate = (scenarioId: string, updates: Partial<TestScenario>) => {
    setScenarios(prev => prev.map(scenario => 
      scenario.id === scenarioId ? { ...scenario, ...updates } : scenario
    ));
  };

  const runTestScenario = async (scenario: TestScenario) => {
    setIsRunningTest(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const testResult: PaymentTest = {
      id: `test_${Date.now()}`,
      timestamp: new Date(),
      scenario: scenario.name,
      phoneNumber: scenario.phoneNumber,
      amount: 150.00,
      result: scenario.expectedResult,
      message: scenario.errorMessage || 'Payment processed successfully',
      transactionId: `TXN_${Date.now()}_${scenario.expectedResult.toUpperCase()}`
    };

    setTestHistory(prev => {
      const newHistory = [testResult, ...prev.slice(0, 49)]; // Keep last 50 tests
      localStorage.setItem('payment_test_history', JSON.stringify(newHistory));
      return newHistory;
    });

    setIsRunningTest(false);
  };

  const runAllTests = async () => {
    setIsRunningTest(true);
    
    for (const scenario of scenarios.filter(s => s.enabled)) {
      await runTestScenario(scenario);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between tests
    }
    
    setIsRunningTest(false);
  };

  const clearTestHistory = () => {
    setTestHistory([]);
    localStorage.removeItem('payment_test_history');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Testing</h1>
          <p className="text-gray-600 mt-2">Manage Flutterwave mobile money payment testing scenarios</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={testMode}
              onCheckedChange={handleTestModeToggle}
            />
            <Label>Test Mode</Label>
          </div>
          <Button
            onClick={runAllTests}
            disabled={isRunningTest}
            variant="outline"
          >
            {isRunningTest ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>
      </div>

      <Alert>
        <AlertDescription>
          Test mode is currently <strong>{testMode ? 'enabled' : 'disabled'}</strong>. 
          When enabled, all payment processing will use simulated responses instead of real Flutterwave API calls.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="scenarios" className="space-y-6">
        <TabsList>
          <TabsTrigger value="scenarios">Test Scenarios</TabsTrigger>
          <TabsTrigger value="history">Test History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((scenario) => (
              <Card key={scenario.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    <Switch
                      checked={scenario.enabled}
                      onCheckedChange={(enabled) => handleScenarioToggle(scenario.id, enabled)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{scenario.description}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Phone Number</Label>
                      <Input
                        value={scenario.phoneNumber}
                        onChange={(e) => handleScenarioUpdate(scenario.id, { phoneNumber: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">PIN</Label>
                      <Input
                        value={scenario.pin}
                        onChange={(e) => handleScenarioUpdate(scenario.id, { pin: e.target.value })}
                        className="text-sm"
                        maxLength={4}
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Expected Result</Label>
                      <select
                        value={scenario.expectedResult}
                        onChange={(e) => handleScenarioUpdate(scenario.id, { expectedResult: e.target.value as any })}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>

                    {scenario.expectedResult === 'failed' && (
                      <div>
                        <Label className="text-xs">Error Message</Label>
                        <Textarea
                          value={scenario.errorMessage || ''}
                          onChange={(e) => handleScenarioUpdate(scenario.id, { errorMessage: e.target.value })}
                          className="text-sm"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => runTestScenario(scenario)}
                    disabled={isRunningTest || !scenario.enabled}
                    className="w-full"
                    size="sm"
                  >
                    Test Scenario
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Test History</h3>
            <Button onClick={clearTestHistory} variant="outline" size="sm">
              Clear History
            </Button>
          </div>

          <div className="space-y-4">
            {testHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No test history available. Run some tests to see results here.
              </div>
            ) : (
              testHistory.map((test) => (
                <Card key={test.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{test.scenario}</span>
                          <Badge className={getStatusColor(test.result)}>
                            {test.result}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          Phone: {test.phoneNumber} • Amount: K {test.amount.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {test.message}
                        </div>
                        {test.transactionId && (
                          <div className="text-xs text-gray-500">
                            TXN ID: {test.transactionId}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {test.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Test Mode</Label>
                  <p className="text-sm text-gray-600">
                    Enable test mode to use simulated payment responses
                  </p>
                </div>
                <Switch
                  checked={testMode}
                  onCheckedChange={handleTestModeToggle}
                />
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Test Statistics</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Total Tests</div>
                    <div className="font-semibold">{testHistory.length}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Successful</div>
                    <div className="font-semibold text-green-600">
                      {testHistory.filter(t => t.result === 'success').length}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Failed</div>
                    <div className="font-semibold text-red-600">
                      {testHistory.filter(t => t.result === 'failed').length}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 