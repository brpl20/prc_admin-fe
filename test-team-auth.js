const { execSync } = require('child_process');

console.log('🚀 Testing Team Authentication Guards\n');

// Test 1: Start the frontend development server
console.log('1. Starting frontend development server...');

try {
  // Kill any existing process on port 3001
  try {
    execSync('lsof -ti:3001 | xargs kill -9', { stdio: 'ignore' });
    console.log('   Killed existing process on port 3001');
  } catch (e) {
    // Port might not be in use, that's fine
  }

  // Start the frontend server in the background
  const server = require('child_process').spawn('npm', ['run', 'dev'], {
    cwd: '/Users/brpl/code/prc_admin-fe',
    detached: true,
    stdio: 'ignore'
  });

  console.log('   Frontend server starting...');
  
  // Wait for the server to be ready
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Test 2: Check if login page loads without API calls to /teams
  console.log('\n2. Testing login page load...');
  
  const puppeteer = require('puppeteer-core');
  const browser = await puppeteer.launch({ 
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true 
  });
  
  const page = await browser.newPage();
  
  // Monitor network requests
  const networkRequests = [];
  page.on('request', request => {
    if (request.url().includes('/api/v1/teams')) {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
    }
  });

  // Navigate to login page
  await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle0' });
  
  // Wait a bit more to catch any delayed requests
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  if (networkRequests.length === 0) {
    console.log('   ✅ No unauthorized team API requests detected on login page');
  } else {
    console.log('   ❌ Unauthorized team API requests detected:');
    networkRequests.forEach(req => {
      console.log(`      ${req.method} ${req.url}`);
    });
  }

  // Test 3: Check registration page
  console.log('\n3. Testing registration page load...');
  
  const regNetworkRequests = [];
  page.on('request', request => {
    if (request.url().includes('/api/v1/teams')) {
      regNetworkRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
    }
  });

  await page.goto('http://localhost:3001/register', { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  if (regNetworkRequests.length === 0) {
    console.log('   ✅ No unauthorized team API requests detected on registration page');
  } else {
    console.log('   ❌ Unauthorized team API requests detected:');
    regNetworkRequests.forEach(req => {
      console.log(`      ${req.method} ${req.url}`);
    });
  }

  await browser.close();
  
  // Clean up - kill the server
  try {
    execSync('lsof -ti:3001 | xargs kill -9', { stdio: 'ignore' });
    console.log('\n   Cleaned up development server');
  } catch (e) {
    // Server might have already stopped
  }
  
  console.log('\n🏁 Team authentication tests completed!');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  
  // Clean up on error
  try {
    execSync('lsof -ti:3001 | xargs kill -9', { stdio: 'ignore' });
  } catch (e) {
    // Ignore cleanup errors
  }
}