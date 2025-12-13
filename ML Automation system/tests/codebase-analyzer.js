/**
 * HingeCraft ML Automation System - Codebase Analyzer
 * Searches entire codebase for potential issues, bottlenecks, and breakdowns
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Analysis results
const analysisResults = {
  timestamp: new Date().toISOString(),
  issues: [],
  warnings: [],
  recommendations: [],
  performance: [],
  security: [],
  errors: []
};

/**
 * Recursively find all JavaScript files
 */
function findJSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .git, and other common directories
      if (!['node_modules', '.git', 'dist', 'build', 'coverage', 'tests'].includes(file)) {
        findJSFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js') && !file.endsWith('.test.js') && !file.endsWith('.spec.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Analyze file for potential issues
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Check for common issues
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // 1. Check for synchronous file operations (performance issue)
    if (line.match(/fs\.(readFileSync|writeFileSync|existsSync|mkdirSync)/)) {
      analysisResults.performance.push({
        file: relativePath,
        line: lineNum,
        issue: 'Synchronous file operation detected',
        severity: 'medium',
        recommendation: 'Consider using async/await with fs.promises for better performance',
        code: line.trim()
      });
    }
    
    // 2. Check for potential memory leaks (unclosed connections, event listeners)
    if (line.match(/\.on\(.*\)/) && !line.match(/\.once\(/)) {
      if (!content.includes('removeListener') && !content.includes('off(')) {
        analysisResults.warnings.push({
          file: relativePath,
          line: lineNum,
          issue: 'Event listener may not be cleaned up',
          severity: 'low',
          recommendation: 'Ensure event listeners are removed when no longer needed',
          code: line.trim()
        });
      }
    }
    
    // 3. Check for SQL injection vulnerabilities
    if (line.match(/db\.query\([^)]*\+/) || line.match(/db\.query\([^)]*\$\{/)) {
      analysisResults.security.push({
        file: relativePath,
        line: lineNum,
        issue: 'Potential SQL injection vulnerability',
        severity: 'high',
        recommendation: 'Use parameterized queries with $1, $2, etc. instead of string concatenation',
        code: line.trim()
      });
    }
    
    // 4. Check for missing error handling
    if (line.match(/await\s+\w+\(/) && !content.substring(0, content.indexOf(line)).match(/try\s*\{/)) {
      const nextLines = lines.slice(index, index + 5).join('\n');
      if (!nextLines.match(/catch|\.catch/)) {
        analysisResults.warnings.push({
          file: relativePath,
          line: lineNum,
          issue: 'Async operation without error handling',
          severity: 'medium',
          recommendation: 'Wrap async operations in try-catch blocks',
          code: line.trim()
        });
      }
    }
    
    // 5. Check for hardcoded credentials
    if (line.match(/(password|secret|key|token)\s*[:=]\s*['"][^'"]{8,}['"]/i)) {
      analysisResults.security.push({
        file: relativePath,
        line: lineNum,
        issue: 'Potential hardcoded credential',
        severity: 'high',
        recommendation: 'Move credentials to environment variables or config files',
        code: line.trim().substring(0, 50) + '...'
      });
    }
    
    // 6. Check for console.log in production code
    if (line.match(/console\.(log|error|warn)/) && !filePath.includes('test')) {
      analysisResults.warnings.push({
        file: relativePath,
        line: lineNum,
        issue: 'Console statement in production code',
        severity: 'low',
        recommendation: 'Use logger utility instead of console',
        code: line.trim()
      });
    }
    
    // 7. Check for large loops without breaks
    if (line.match(/for\s*\(.*\)\s*\{/) || line.match(/while\s*\(.*\)\s*\{/)) {
      const loopContent = content.substring(content.indexOf(line));
      const loopEnd = loopContent.indexOf('}');
      if (loopEnd > 0) {
        const loopBody = loopContent.substring(0, loopEnd);
        if (loopBody.split('\n').length > 100 && !loopBody.includes('break') && !loopBody.includes('return')) {
          analysisResults.performance.push({
            file: relativePath,
            line: lineNum,
            issue: 'Large loop without break conditions',
            severity: 'medium',
            recommendation: 'Consider adding break conditions or pagination for large datasets',
            code: line.trim()
          });
        }
      }
    }
    
    // 8. Check for missing await in async functions
    if (line.match(/async\s+function|async\s+\(/) && line.match(/await\s+\w+\(/)) {
      // This is okay
    } else if (line.match(/async\s+function|async\s+\(/)) {
      const funcContent = content.substring(content.indexOf(line));
      const funcEnd = funcContent.indexOf('}');
      if (funcEnd > 0) {
        const funcBody = funcContent.substring(0, funcEnd);
        if (funcBody.match(/\.then\(|\.catch\(/)) {
          analysisResults.warnings.push({
            file: relativePath,
            line: lineNum,
            issue: 'Async function using .then() instead of await',
            severity: 'low',
            recommendation: 'Use await for better readability and error handling',
            code: line.trim()
          });
        }
      }
    }
    
    // 9. Check for potential race conditions
    if (line.match(/Promise\.all\(/) && line.match(/\.map\(/)) {
      analysisResults.warnings.push({
        file: relativePath,
        line: lineNum,
        issue: 'Potential race condition with Promise.all and map',
        severity: 'medium',
        recommendation: 'Ensure proper error handling and consider rate limiting',
        code: line.trim()
      });
    }
    
    // 10. Check for missing database transaction handling
    if (line.match(/db\.query\(/) && content.match(/INSERT|UPDATE|DELETE/)) {
      const queries = content.match(/db\.query\(/g);
      if (queries && queries.length > 1) {
        if (!content.includes('BEGIN') && !content.includes('COMMIT') && !content.includes('transaction')) {
          analysisResults.warnings.push({
            file: relativePath,
            line: lineNum,
            issue: 'Multiple database queries without transaction',
            severity: 'medium',
            recommendation: 'Consider using database transactions for multiple related queries',
            code: line.trim()
          });
        }
      }
    }
  });
  
  // Check file-level issues
  // 1. Check for very large files
  if (lines.length > 1000) {
    analysisResults.performance.push({
      file: relativePath,
      line: 0,
      issue: 'Very large file (>1000 lines)',
      severity: 'low',
      recommendation: 'Consider splitting into smaller modules',
      code: `${lines.length} lines`
    });
  }
  
  // 2. Check for missing exports
  if (!content.includes('module.exports') && !content.includes('export') && !filePath.includes('index.js')) {
    analysisResults.warnings.push({
      file: relativePath,
      line: 0,
      issue: 'File may not be exported',
      severity: 'low',
      recommendation: 'Ensure file is properly exported if it should be used elsewhere',
      code: 'No exports found'
    });
  }
}

/**
 * Analyze entire codebase
 */
function analyzeCodebase() {
  console.log('🔍 Analyzing codebase for issues...');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const srcDir = path.join(__dirname, '../src');
  const configDir = path.join(__dirname, '../config');
  
  const files = [
    ...findJSFiles(srcDir),
    ...findJSFiles(configDir)
  ];
  
  console.log(`Found ${files.length} JavaScript files to analyze\n`);
  
  files.forEach((file, index) => {
    try {
      analyzeFile(file);
      if ((index + 1) % 10 === 0) {
        process.stdout.write(`\rAnalyzed ${index + 1}/${files.length} files...`);
      }
    } catch (error) {
      analysisResults.errors.push({
        file: path.relative(process.cwd(), file),
        error: error.message
      });
    }
  });
  
  console.log(`\rAnalyzed ${files.length}/${files.length} files... ✅\n`);
}

/**
 * Generate analysis report
 */
function generateReport() {
  const reportPath = path.join(__dirname, '../codebase-analysis-report.json');
  const reportHtmlPath = path.join(__dirname, '../codebase-analysis-report.html');
  
  // Calculate statistics
  const stats = {
    totalFiles: 0,
    issues: {
      total: analysisResults.performance.length + analysisResults.security.length + analysisResults.warnings.length,
      performance: analysisResults.performance.length,
      security: analysisResults.security.length,
      warnings: analysisResults.warnings.length,
      errors: analysisResults.errors.length
    },
    severity: {
      high: analysisResults.security.filter(s => s.severity === 'high').length,
      medium: [...analysisResults.performance, ...analysisResults.security].filter(s => s.severity === 'medium').length,
      low: analysisResults.warnings.length
    }
  };
  
  // Save JSON report
  const report = {
    summary: stats,
    timestamp: analysisResults.timestamp,
    performance: analysisResults.performance,
    security: analysisResults.security,
    warnings: analysisResults.warnings,
    errors: analysisResults.errors
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Generate HTML report
  const htmlReport = generateHtmlReport(stats, report);
  fs.writeFileSync(reportHtmlPath, htmlReport);
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 CODEBASE ANALYSIS COMPLETE');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Total Issues: ${stats.issues.total}`);
  console.log(`  - Performance: ${stats.issues.performance}`);
  console.log(`  - Security: ${stats.issues.security}`);
  console.log(`  - Warnings: ${stats.issues.warnings}`);
  console.log(`  - Errors: ${stats.issues.errors}`);
  console.log('');
  console.log(`Severity Breakdown:`);
  console.log(`  - High: ${stats.severity.high}`);
  console.log(`  - Medium: ${stats.severity.medium}`);
  console.log(`  - Low: ${stats.severity.low}`);
  console.log('');
  console.log(`📄 Reports saved:`);
  console.log(`   JSON: ${reportPath}`);
  console.log(`   HTML: ${reportHtmlPath}`);
  console.log('═══════════════════════════════════════════════════════');
}

/**
 * Generate HTML report
 */
function generateHtmlReport(stats, report) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Codebase Analysis Report - HingeCraft ML Automation</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1400px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .stat-card { background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #4CAF50; }
    .stat-value { font-size: 2em; font-weight: bold; color: #4CAF50; }
    .stat-label { color: #666; margin-top: 5px; }
    .high { border-left-color: #f44336; }
    .medium { border-left-color: #ff9800; }
    .low { border-left-color: #2196F3; }
    .high .stat-value { color: #f44336; }
    .medium .stat-value { color: #ff9800; }
    .low .stat-value { color: #2196F3; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #4CAF50; color: white; }
    tr:hover { background: #f5f5f5; }
    .code { font-family: monospace; background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
    .issue-card { background: #fff; border-left: 4px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 4px; }
    .issue-card.high { border-left-color: #f44336; }
    .issue-card.medium { border-left-color: #ff9800; }
    .issue-card.low { border-left-color: #2196F3; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 Codebase Analysis Report - HingeCraft ML Automation System</h1>
    <p><strong>Analysis Date:</strong> ${new Date(analysisResults.timestamp).toLocaleString()}</p>
    
    <h2>📊 Summary Statistics</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${stats.issues.total}</div>
        <div class="stat-label">Total Issues</div>
      </div>
      <div class="stat-card high">
        <div class="stat-value">${stats.severity.high}</div>
        <div class="stat-label">High Severity</div>
      </div>
      <div class="stat-card medium">
        <div class="stat-value">${stats.severity.medium}</div>
        <div class="stat-label">Medium Severity</div>
      </div>
      <div class="stat-card low">
        <div class="stat-value">${stats.severity.low}</div>
        <div class="stat-label">Low Severity</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.issues.performance}</div>
        <div class="stat-label">Performance Issues</div>
      </div>
      <div class="stat-card high">
        <div class="stat-value">${stats.issues.security}</div>
        <div class="stat-label">Security Issues</div>
      </div>
    </div>
    
    ${report.security.length > 0 ? `
    <h2>🔴 Security Issues (High Priority)</h2>
    ${report.security.map(issue => `
      <div class="issue-card ${issue.severity}">
        <strong>${issue.file}:${issue.line}</strong> - ${issue.issue}<br>
        <small><strong>Recommendation:</strong> ${issue.recommendation}</small><br>
        <code class="code">${issue.code}</code>
      </div>
    `).join('')}
    ` : ''}
    
    ${report.performance.length > 0 ? `
    <h2>⚡ Performance Issues</h2>
    ${report.performance.map(issue => `
      <div class="issue-card ${issue.severity}">
        <strong>${issue.file}:${issue.line}</strong> - ${issue.issue}<br>
        <small><strong>Recommendation:</strong> ${issue.recommendation}</small><br>
        <code class="code">${issue.code}</code>
      </div>
    `).join('')}
    ` : ''}
    
    ${report.warnings.length > 0 ? `
    <h2>⚠️ Warnings</h2>
    ${report.warnings.slice(0, 50).map(issue => `
      <div class="issue-card ${issue.severity}">
        <strong>${issue.file}:${issue.line}</strong> - ${issue.issue}<br>
        <small><strong>Recommendation:</strong> ${issue.recommendation}</small><br>
        <code class="code">${issue.code}</code>
      </div>
    `).join('')}
    ${report.warnings.length > 50 ? `<p><em>... and ${report.warnings.length - 50} more warnings (see JSON report for full list)</em></p>` : ''}
    ` : ''}
    
    ${report.errors.length > 0 ? `
    <h2>❌ Analysis Errors</h2>
    <table>
      <tr><th>File</th><th>Error</th></tr>
      ${report.errors.map(e => `
        <tr>
          <td>${e.file}</td>
          <td>${e.error}</td>
        </tr>
      `).join('')}
    </table>
    ` : ''}
  </div>
</body>
</html>`;
}

// Run analysis if executed directly
if (require.main === module) {
  analyzeCodebase();
  generateReport();
}

module.exports = { analyzeCodebase, generateReport };
