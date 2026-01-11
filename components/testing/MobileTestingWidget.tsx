/**
 * Mobile Testing Widget
 * Widget per testare l'esperienza mobile in tempo reale
 */

import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  X,
  Settings,
  Zap,
  Target
} from 'lucide-react';

interface MobileTestingWidgetProps {
  onClose?: () => void;
}

interface TestResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
}

const MobileTestingWidget: React.FC<MobileTestingWidgetProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const devices = {
    mobile: { width: 375, height: 667, name: 'iPhone SE' },
    tablet: { width: 768, height: 1024, name: 'iPad' },
    desktop: { width: 1200, height: 800, name: 'Desktop' }
  };

  useEffect(() => {
    // Auto-run tests when component mounts
    runMobileTests();
  }, []);

  const runMobileTests = async () => {
    setIsRunningTests(true);
    const results: TestResult[] = [];

    // Test 1: Touch Target Sizes
    const touchTargets = document.querySelectorAll('button, a, input, select, textarea');
    let smallTargets = 0;
    touchTargets.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width < 44 || rect.height < 44) {
        smallTargets++;
      }
    });

    results.push({
      name: 'Touch Target Sizes',
      status: smallTargets === 0 ? 'pass' : smallTargets < 5 ? 'warn' : 'fail',
      message: `${touchTargets.length - smallTargets}/${touchTargets.length} targets ≥44px`
    });

    // Test 2: Responsive Layout
    const hasResponsiveClasses = document.body.innerHTML.includes('sm:') || 
                                document.body.innerHTML.includes('md:') || 
                                document.body.innerHTML.includes('lg:');
    
    results.push({
      name: 'Responsive Classes',
      status: hasResponsiveClasses ? 'pass' : 'fail',
      message: hasResponsiveClasses ? 'Responsive breakpoints found' : 'No responsive classes detected'
    });

    // Test 3: Horizontal Scroll
    const hasHorizontalScroll = document.body.scrollWidth > window.innerWidth;
    
    results.push({
      name: 'Horizontal Scroll',
      status: hasHorizontalScroll ? 'fail' : 'pass',
      message: hasHorizontalScroll ? 'Horizontal scroll detected' : 'No horizontal scroll'
    });

    // Test 4: Text Readability
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    let smallText = 0;
    textElements.forEach(element => {
      const style = window.getComputedStyle(element);
      const fontSize = parseFloat(style.fontSize);
      if (fontSize < 14) {
        smallText++;
      }
    });

    results.push({
      name: 'Text Readability',
      status: smallText === 0 ? 'pass' : smallText < 10 ? 'warn' : 'fail',
      message: `${textElements.length - smallText}/${textElements.length} elements ≥14px`
    });

    // Test 5: Mobile Navigation
    const hasMobileNav = document.querySelector('[class*="mobile"]') || 
                        document.querySelector('[class*="hamburger"]') ||
                        document.querySelector('[class*="drawer"]');
    
    results.push({
      name: 'Mobile Navigation',
      status: hasMobileNav ? 'pass' : 'warn',
      message: hasMobileNav ? 'Mobile navigation detected' : 'No mobile navigation found'
    });

    // Simulate test delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setTestResults(results);
    setIsRunningTests(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="text-green-600" size={16} />;
      case 'warn': return <AlertTriangle className="text-yellow-600" size={16} />;
      case 'fail': return <X className="text-red-600" size={16} />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800';
      case 'warn': return 'bg-yellow-100 text-yellow-800';
      case 'fail': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const simulateDevice = (device: 'mobile' | 'tablet' | 'desktop') => {
    setCurrentDevice(device);
    const { width, height } = devices[device];
    
    // Apply viewport simulation (this is a simplified version)
    document.body.style.maxWidth = `${width}px`;
    document.body.style.margin = '0 auto';
    
    if (device === 'mobile') {
      document.body.classList.add('mobile-simulation');
    } else {
      document.body.classList.remove('mobile-simulation');
    }
    
    // Re-run tests after device change
    setTimeout(() => runMobileTests(), 500);
  };

  const resetSimulation = () => {
    document.body.style.maxWidth = '';
    document.body.style.margin = '';
    document.body.classList.remove('mobile-simulation');
    setCurrentDevice('desktop');
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Mobile Testing"
      >
        <Smartphone size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone size={20} />
          <span className="font-semibold">Mobile Testing</span>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            resetSimulation();
            onClose?.();
          }}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Device Simulator */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-700">Device:</span>
          <span className="text-sm text-gray-600">{devices[currentDevice].name}</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => simulateDevice('mobile')}
            className={`p-2 rounded-lg transition-colors ${
              currentDevice === 'mobile' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Mobile (375px)"
          >
            <Smartphone size={16} />
          </button>
          
          <button
            onClick={() => simulateDevice('tablet')}
            className={`p-2 rounded-lg transition-colors ${
              currentDevice === 'tablet' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Tablet (768px)"
          >
            <Tablet size={16} />
          </button>
          
          <button
            onClick={() => simulateDevice('desktop')}
            className={`p-2 rounded-lg transition-colors ${
              currentDevice === 'desktop' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Desktop (1200px)"
          >
            <Monitor size={16} />
          </button>
          
          <button
            onClick={runMobileTests}
            disabled={isRunningTests}
            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
            title="Run Tests"
          >
            {isRunningTests ? <Zap className="animate-spin" size={16} /> : <Target size={16} />}
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="p-4 max-h-64 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Test Results</span>
          {testResults.length > 0 && (
            <span className="text-xs text-gray-500">
              {testResults.filter(r => r.status === 'pass').length}/{testResults.length} passed
            </span>
          )}
        </div>

        {isRunningTests ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Running tests...</p>
          </div>
        ) : testResults.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">Click the target button to run tests</p>
          </div>
        ) : (
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {getStatusIcon(result.status)}
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {result.name}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(result.status)}`}>
                  {result.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Quick Fixes */}
        {testResults.some(r => r.status === 'fail') && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 mb-2">Quick Fixes:</h4>
            <ul className="text-xs text-red-700 space-y-1">
              {testResults.filter(r => r.status === 'fail').map((result, index) => (
                <li key={index}>• {result.message}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <button
            onClick={() => window.open('/mobile-testing-suite.html', '_blank')}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Full Test Suite
          </button>
          <button
            onClick={resetSimulation}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileTestingWidget;