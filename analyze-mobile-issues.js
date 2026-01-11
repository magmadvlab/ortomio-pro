/**
 * Mobile Issues Analyzer
 * Analizza automaticamente i componenti React per identificare problemi di responsiveness
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ANALYSIS_CONFIG = {
  componentsDir: 'components',
  appDir: 'app',
  excludePatterns: [
    'node_modules',
    '.next',
    '.git',
    'test-',
    '.test.',
    '.spec.'
  ],
  mobileBreakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  }
};

/**
 * Mobile Issues Analyzer Class
 */
class MobileIssuesAnalyzer {
  constructor() {
    this.issues = [];
    this.scannedFiles = 0;
    this.totalFiles = 0;
  }

  /**
   * Run complete mobile analysis
   */
  async analyzeProject() {
    console.log('🔍 Starting Mobile Issues Analysis');
    console.log('=' .repeat(60));
    
    try {
      // Scan all React components
      await this.scanDirectory(ANALYSIS_CONFIG.componentsDir);
      await this.scanDirectory(ANALYSIS_CONFIG.appDir);
      
      // Generate report
      this.generateReport();
      
      return this.issues;
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      throw error;
    }
  }

  /**
   * Scan directory for React files
   */
  async scanDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      console.log(`⚠️ Directory not found: ${dirPath}`);
      return;
    }

    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);
      
      // Skip excluded patterns
      if (this.shouldSkipFile(fullPath)) {
        continue;
      }
      
      if (file.isDirectory()) {
        await this.scanDirectory(fullPath);
      } else if (this.isReactFile(file.name)) {
        await this.analyzeFile(fullPath);
      }
    }
  }

  /**
   * Check if file should be skipped
   */
  shouldSkipFile(filePath) {
    return ANALYSIS_CONFIG.excludePatterns.some(pattern => 
      filePath.includes(pattern)
    );
  }

  /**
   * Check if file is a React component
   */
  isReactFile(fileName) {
    return fileName.endsWith('.tsx') || fileName.endsWith('.jsx') || 
           (fileName.endsWith('.ts') && !fileName.endsWith('.d.ts'));
  }

  /**
   * Analyze individual file for mobile issues
   */
  async analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.scannedFiles++;
      
      console.log(`📄 Analyzing: ${filePath}`);
      
      // Run all mobile checks
      this.checkResponsiveDesign(filePath, content);
      this.checkTouchTargets(filePath, content);
      this.checkMobileNavigation(filePath, content);
      this.checkPerformanceIssues(filePath, content);
      this.checkAccessibility(filePath, content);
      this.checkMobileSpecificFeatures(filePath, content);
      
    } catch (error) {
      console.error(`❌ Error analyzing ${filePath}:`, error.message);
    }
  }

  /**
   * Check responsive design issues
   */
  checkResponsiveDesign(filePath, content) {
    const issues = [];
    
    // Check for fixed widths
    const fixedWidthRegex = /width:\s*['"`]?\d+px['"`]?/g;
    const fixedWidthMatches = content.match(fixedWidthRegex);
    if (fixedWidthMatches) {
      issues.push({
        type: 'Fixed Width',
        severity: 'medium',
        description: `Found fixed pixel widths: ${fixedWidthMatches.join(', ')}`,
        suggestion: 'Use relative units (%, rem, em) or CSS Grid/Flexbox'
      });
    }

    // Check for missing responsive classes
    if (content.includes('className') && !content.includes('sm:') && !content.includes('md:') && !content.includes('lg:')) {
      issues.push({
        type: 'Missing Responsive Classes',
        severity: 'high',
        description: 'No Tailwind responsive classes found',
        suggestion: 'Add responsive breakpoints (sm:, md:, lg:, xl:)'
      });
    }

    // Check for overflow issues
    if (content.includes('overflow-x-auto') || content.includes('overflow-scroll')) {
      issues.push({
        type: 'Potential Scroll Issues',
        severity: 'low',
        description: 'Horizontal scroll detected',
        suggestion: 'Ensure horizontal scroll is intentional and mobile-friendly'
      });
    }

    // Check for large containers
    const largeContainerRegex = /max-w-\[(\d+)px\]/g;
    const largeContainers = content.match(largeContainerRegex);
    if (largeContainers) {
      largeContainers.forEach(container => {
        const width = parseInt(container.match(/\d+/)[0]);
        if (width > 1200) {
          issues.push({
            type: 'Large Container',
            severity: 'medium',
            description: `Container width ${width}px may be too large for mobile`,
            suggestion: 'Consider smaller max-width or responsive containers'
          });
        }
      });
    }

    this.addIssues(filePath, 'Responsive Design', issues);
  }

  /**
   * Check touch target sizes
   */
  checkTouchTargets(filePath, content) {
    const issues = [];
    
    // Check for small buttons
    if (content.includes('button') || content.includes('Button')) {
      // Check for explicit small sizes
      const smallButtonRegex = /(w-\d+|h-\d+|p-\d+|px-\d+|py-\d+)/g;
      const sizeClasses = content.match(smallButtonRegex);
      
      if (sizeClasses) {
        const smallSizes = sizeClasses.filter(size => {
          const num = parseInt(size.match(/\d+/)?.[0] || '0');
          return num < 3; // Tailwind classes < 3 are quite small
        });
        
        if (smallSizes.length > 0) {
          issues.push({
            type: 'Small Touch Targets',
            severity: 'high',
            description: `Small button sizes detected: ${smallSizes.join(', ')}`,
            suggestion: 'Ensure touch targets are at least 44px (p-3 or larger)'
          });
        }
      }
    }

    // Check for missing touch-friendly spacing
    if (content.includes('gap-1') || content.includes('space-x-1') || content.includes('space-y-1')) {
      issues.push({
        type: 'Insufficient Touch Spacing',
        severity: 'medium',
        description: 'Very small gaps between interactive elements',
        suggestion: 'Use gap-2 or larger for better touch accessibility'
      });
    }

    this.addIssues(filePath, 'Touch Targets', issues);
  }

  /**
   * Check mobile navigation issues
   */
  checkMobileNavigation(filePath, content) {
    const issues = [];
    
    // Check for hamburger menu implementation
    if (content.includes('nav') || content.includes('Nav') || content.includes('menu')) {
      if (!content.includes('hidden') && !content.includes('md:block')) {
        issues.push({
          type: 'Missing Mobile Menu',
          severity: 'high',
          description: 'Navigation without mobile-responsive hiding/showing',
          suggestion: 'Implement hamburger menu with hidden/block responsive classes'
        });
      }
    }

    // Check for horizontal scrolling menus
    if (content.includes('flex-nowrap') && content.includes('overflow-x')) {
      issues.push({
        type: 'Horizontal Scroll Menu',
        severity: 'medium',
        description: 'Horizontal scrolling navigation detected',
        suggestion: 'Consider vertical stacking on mobile or swipe indicators'
      });
    }

    // Check for dropdown menus without mobile consideration
    if (content.includes('dropdown') || content.includes('Dropdown')) {
      if (!content.includes('absolute') && !content.includes('fixed')) {
        issues.push({
          type: 'Mobile Dropdown Issues',
          severity: 'medium',
          description: 'Dropdown without proper mobile positioning',
          suggestion: 'Ensure dropdowns work well on touch devices'
        });
      }
    }

    this.addIssues(filePath, 'Mobile Navigation', issues);
  }

  /**
   * Check performance issues
   */
  checkPerformanceIssues(filePath, content) {
    const issues = [];
    
    // Check for large images without optimization
    if (content.includes('<img') && !content.includes('loading="lazy"')) {
      issues.push({
        type: 'Image Loading',
        severity: 'medium',
        description: 'Images without lazy loading',
        suggestion: 'Add loading="lazy" for better mobile performance'
      });
    }

    // Check for missing Image component
    if (content.includes('<img') && !content.includes('next/image')) {
      issues.push({
        type: 'Unoptimized Images',
        severity: 'high',
        description: 'Using <img> instead of Next.js Image component',
        suggestion: 'Use Next.js Image component for automatic optimization'
      });
    }

    // Check for heavy animations
    if (content.includes('animate-') && content.includes('duration-')) {
      const animationCount = (content.match(/animate-/g) || []).length;
      if (animationCount > 5) {
        issues.push({
          type: 'Heavy Animations',
          severity: 'medium',
          description: `${animationCount} animations detected`,
          suggestion: 'Consider reducing animations on mobile for better performance'
        });
      }
    }

    // Check for large bundle imports
    const importRegex = /import.*from\s+['"`]([^'"`]+)['"`]/g;
    const imports = content.match(importRegex);
    if (imports) {
      const heavyLibraries = ['lodash', 'moment', 'chart.js'];
      const heavyImports = imports.filter(imp => 
        heavyLibraries.some(lib => imp.includes(lib))
      );
      
      if (heavyImports.length > 0) {
        issues.push({
          type: 'Heavy Dependencies',
          severity: 'medium',
          description: `Heavy libraries imported: ${heavyImports.join(', ')}`,
          suggestion: 'Consider lighter alternatives or dynamic imports'
        });
      }
    }

    this.addIssues(filePath, 'Performance', issues);
  }

  /**
   * Check accessibility issues
   */
  checkAccessibility(filePath, content) {
    const issues = [];
    
    // Check for missing alt text
    if (content.includes('<img') && !content.includes('alt=')) {
      issues.push({
        type: 'Missing Alt Text',
        severity: 'high',
        description: 'Images without alt attributes',
        suggestion: 'Add descriptive alt text for screen readers'
      });
    }

    // Check for missing ARIA labels
    if (content.includes('button') && !content.includes('aria-label') && !content.includes('aria-labelledby')) {
      const buttonCount = (content.match(/button/g) || []).length;
      if (buttonCount > 2) {
        issues.push({
          type: 'Missing ARIA Labels',
          severity: 'medium',
          description: 'Buttons without ARIA labels',
          suggestion: 'Add aria-label for better accessibility'
        });
      }
    }

    // Check for color-only information
    if (content.includes('text-red') || content.includes('text-green')) {
      if (!content.includes('icon') && !content.includes('Icon')) {
        issues.push({
          type: 'Color-Only Information',
          severity: 'medium',
          description: 'Information conveyed only through color',
          suggestion: 'Add icons or text to supplement color information'
        });
      }
    }

    this.addIssues(filePath, 'Accessibility', issues);
  }

  /**
   * Check mobile-specific features
   */
  checkMobileSpecificFeatures(filePath, content) {
    const issues = [];
    
    // Check for viewport meta tag (in layout files)
    if (filePath.includes('layout') && !content.includes('viewport')) {
      issues.push({
        type: 'Missing Viewport Meta',
        severity: 'high',
        description: 'Layout without viewport meta tag',
        suggestion: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">'
      });
    }

    // Check for touch event handling
    if (content.includes('onClick') && !content.includes('onTouchStart')) {
      const clickCount = (content.match(/onClick/g) || []).length;
      if (clickCount > 3) {
        issues.push({
          type: 'Missing Touch Events',
          severity: 'low',
          description: 'Many click handlers without touch event consideration',
          suggestion: 'Consider adding touch event handlers for better mobile UX'
        });
      }
    }

    // Check for PWA features
    if (filePath.includes('layout') || filePath.includes('_app')) {
      if (!content.includes('manifest') && !content.includes('service-worker')) {
        issues.push({
          type: 'Missing PWA Features',
          severity: 'low',
          description: 'No PWA manifest or service worker detected',
          suggestion: 'Consider adding PWA features for better mobile experience'
        });
      }
    }

    this.addIssues(filePath, 'Mobile Features', issues);
  }

  /**
   * Add issues to the collection
   */
  addIssues(filePath, category, issues) {
    issues.forEach(issue => {
      this.issues.push({
        file: filePath,
        category,
        ...issue,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n📊 MOBILE ISSUES ANALYSIS REPORT');
    console.log('=' .repeat(60));
    
    // Summary statistics
    const totalIssues = this.issues.length;
    const highSeverity = this.issues.filter(i => i.severity === 'high').length;
    const mediumSeverity = this.issues.filter(i => i.severity === 'medium').length;
    const lowSeverity = this.issues.filter(i => i.severity === 'low').length;
    
    console.log(`📁 Files Scanned: ${this.scannedFiles}`);
    console.log(`🚨 Total Issues: ${totalIssues}`);
    console.log(`🔴 High Severity: ${highSeverity}`);
    console.log(`🟡 Medium Severity: ${mediumSeverity}`);
    console.log(`🟢 Low Severity: ${lowSeverity}`);
    
    // Issues by category
    console.log('\n📋 Issues by Category:');
    const categories = [...new Set(this.issues.map(i => i.category))];
    categories.forEach(category => {
      const categoryIssues = this.issues.filter(i => i.category === category);
      console.log(`   ${category}: ${categoryIssues.length} issues`);
    });
    
    // Top problematic files
    console.log('\n📄 Most Problematic Files:');
    const fileIssues = {};
    this.issues.forEach(issue => {
      fileIssues[issue.file] = (fileIssues[issue.file] || 0) + 1;
    });
    
    const sortedFiles = Object.entries(fileIssues)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    sortedFiles.forEach(([file, count]) => {
      console.log(`   ${file}: ${count} issues`);
    });
    
    // High priority issues
    console.log('\n🚨 High Priority Issues:');
    const highPriorityIssues = this.issues.filter(i => i.severity === 'high');
    highPriorityIssues.slice(0, 10).forEach(issue => {
      console.log(`   ${issue.file}`);
      console.log(`     ${issue.type}: ${issue.description}`);
      console.log(`     💡 ${issue.suggestion}`);
      console.log('');
    });
    
    // Generate detailed JSON report
    const report = {
      summary: {
        filesScanned: this.scannedFiles,
        totalIssues,
        severityBreakdown: {
          high: highSeverity,
          medium: mediumSeverity,
          low: lowSeverity
        },
        categoriesAffected: categories.length
      },
      issuesByCategory: categories.map(category => ({
        category,
        count: this.issues.filter(i => i.category === category).length,
        issues: this.issues.filter(i => i.category === category)
      })),
      mostProblematicFiles: sortedFiles.map(([file, count]) => ({ file, issueCount: count })),
      allIssues: this.issues,
      recommendations: this.generateRecommendations(),
      timestamp: new Date().toISOString()
    };
    
    // Save reports
    fs.writeFileSync('mobile-issues-report.json', JSON.stringify(report, null, 2));
    this.generateMarkdownReport(report);
    
    console.log('\n📄 Reports Generated:');
    console.log('   mobile-issues-report.json - Detailed JSON report');
    console.log('   mobile-issues-report.md - Human-readable markdown report');
    
    // Generate fix suggestions
    this.generateFixSuggestions();
  }

  /**
   * Generate recommendations based on issues found
   */
  generateRecommendations() {
    const recommendations = [];
    
    const highIssues = this.issues.filter(i => i.severity === 'high');
    if (highIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        action: 'Fix critical mobile issues immediately',
        description: `${highIssues.length} high-severity issues need immediate attention`,
        impact: 'Critical for mobile user experience'
      });
    }
    
    const responsiveIssues = this.issues.filter(i => i.category === 'Responsive Design');
    if (responsiveIssues.length > 5) {
      recommendations.push({
        priority: 'high',
        action: 'Implement comprehensive responsive design system',
        description: 'Multiple responsive design issues detected',
        impact: 'Essential for mobile compatibility'
      });
    }
    
    const performanceIssues = this.issues.filter(i => i.category === 'Performance');
    if (performanceIssues.length > 3) {
      recommendations.push({
        priority: 'medium',
        action: 'Optimize mobile performance',
        description: 'Several performance issues affecting mobile users',
        impact: 'Improves mobile loading times and user experience'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport(report) {
    let markdown = `# 📱 Mobile Issues Analysis Report\n\n`;
    markdown += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n\n`;
    
    markdown += `## 📊 Summary\n\n`;
    markdown += `- **Files Scanned:** ${report.summary.filesScanned}\n`;
    markdown += `- **Total Issues:** ${report.summary.totalIssues}\n`;
    markdown += `- **High Severity:** ${report.summary.severityBreakdown.high}\n`;
    markdown += `- **Medium Severity:** ${report.summary.severityBreakdown.medium}\n`;
    markdown += `- **Low Severity:** ${report.summary.severityBreakdown.low}\n\n`;
    
    markdown += `## 📋 Issues by Category\n\n`;
    report.issuesByCategory.forEach(category => {
      markdown += `### ${category.category} (${category.count} issues)\n\n`;
      category.issues.slice(0, 5).forEach(issue => {
        markdown += `**${issue.type}** - ${issue.severity.toUpperCase()}\n`;
        markdown += `- File: \`${issue.file}\`\n`;
        markdown += `- Description: ${issue.description}\n`;
        markdown += `- Suggestion: ${issue.suggestion}\n\n`;
      });
    });
    
    markdown += `## 🎯 Recommendations\n\n`;
    report.recommendations.forEach(rec => {
      markdown += `### ${rec.action} (${rec.priority.toUpperCase()} Priority)\n`;
      markdown += `${rec.description}\n\n`;
      markdown += `**Impact:** ${rec.impact}\n\n`;
    });
    
    fs.writeFileSync('mobile-issues-report.md', markdown);
  }

  /**
   * Generate specific fix suggestions
   */
  generateFixSuggestions() {
    console.log('\n🔧 IMMEDIATE FIX SUGGESTIONS:');
    console.log('=' .repeat(60));
    
    const highIssues = this.issues.filter(i => i.severity === 'high');
    
    if (highIssues.length > 0) {
      console.log('\n1. 🚨 HIGH PRIORITY FIXES:');
      
      // Group by type
      const issueTypes = {};
      highIssues.forEach(issue => {
        if (!issueTypes[issue.type]) {
          issueTypes[issue.type] = [];
        }
        issueTypes[issue.type].push(issue);
      });
      
      Object.entries(issueTypes).forEach(([type, issues]) => {
        console.log(`\n   ${type} (${issues.length} files affected):`);
        console.log(`   💡 ${issues[0].suggestion}`);
        console.log(`   📁 Files: ${issues.slice(0, 3).map(i => i.file).join(', ')}${issues.length > 3 ? '...' : ''}`);
      });
    }
    
    console.log('\n2. 📱 MOBILE-FIRST APPROACH:');
    console.log('   - Start with mobile design, then scale up');
    console.log('   - Use Tailwind responsive prefixes (sm:, md:, lg:)');
    console.log('   - Test on real devices, not just browser dev tools');
    
    console.log('\n3. 🎯 QUICK WINS:');
    console.log('   - Add responsive classes to existing components');
    console.log('   - Increase touch target sizes (min 44px)');
    console.log('   - Optimize images with Next.js Image component');
    console.log('   - Add proper ARIA labels for accessibility');
  }
}

/**
 * Run analysis if called directly
 */
async function runMobileAnalysis() {
  const analyzer = new MobileIssuesAnalyzer();
  
  try {
    const issues = await analyzer.analyzeProject();
    
    if (issues.length === 0) {
      console.log('\n🎉 NO MOBILE ISSUES FOUND!');
      console.log('Your project appears to be mobile-ready.');
    } else {
      const highIssues = issues.filter(i => i.severity === 'high').length;
      if (highIssues > 0) {
        console.log(`\n⚠️ ${highIssues} HIGH PRIORITY MOBILE ISSUES FOUND`);
        console.log('Please review and fix these issues for optimal mobile experience.');
      } else {
        console.log('\n✅ No critical mobile issues found.');
        console.log('Consider addressing medium/low priority issues for better UX.');
      }
    }
    
    return issues;
    
  } catch (error) {
    console.error('\n❌ MOBILE ANALYSIS FAILED:', error);
    process.exit(1);
  }
}

// Export for use in other scripts
module.exports = { MobileIssuesAnalyzer };

// Run if called directly
if (require.main === module) {
  runMobileAnalysis();
}