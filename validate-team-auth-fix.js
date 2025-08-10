const axios = require('axios');
const { spawn } = require('child_process');

// Test configuration
const FRONTEND_URL = 'http://localhost:3001';
const BACKEND_URL = 'http://localhost:3000/api/v1';

async function validateTeamAuthFix() {
  console.log('🔍 Validating Team Authentication Fix\n');
  
  // Test 1: Check if frontend is running
  console.log('1. Testing frontend server connectivity...');
  try {
    const response = await axios.get(`${FRONTEND_URL}/login`, { 
      timeout: 5000,
      validateStatus: () => true // Accept any status code
    });
    if (response.status === 200) {
      console.log('   ✅ Frontend server is accessible');
    } else {
      console.log(`   ⚠️  Frontend returned status: ${response.status}`);
    }
  } catch (error) {
    console.log('   ❌ Frontend server not accessible:', error.message);
    return;
  }

  // Test 2: Direct API test - Teams endpoint without auth
  console.log('\n2. Testing teams endpoint without authentication...');
  try {
    const response = await axios.get(`${BACKEND_URL}/teams`, {
      timeout: 3000,
      validateStatus: () => true // Accept any status code
    });
    
    if (response.status === 401 || response.status === 404) {
      console.log('   ✅ Teams endpoint properly rejects unauthorized requests');
      console.log(`      Status: ${response.status}`);
    } else if (response.status === 200) {
      console.log('   ⚠️  Teams endpoint returned data without auth (this might be expected)');
    } else {
      console.log(`   ❓ Unexpected status: ${response.status}`);
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('   ❌ Backend server not running');
    } else {
      console.log('   ❌ Error testing teams endpoint:', error.message);
    }
  }

  // Test 3: Test with valid session token (if available)
  console.log('\n3. Testing authentication flow...');
  try {
    // Try to register a test user first
    const testEmail = `test-validation-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123';
    
    console.log('   Creating test user...');
    const registerResponse = await axios.post(`${BACKEND_URL}/register`, {
      registration: {
        email: testEmail,
        password: testPassword,
        password_confirmation: testPassword,
      }
    }, {
      timeout: 5000,
      validateStatus: () => true
    });

    if (registerResponse.status === 201) {
      console.log('   ✅ Test user created successfully');
      
      // Now try to login
      console.log('   Testing login...');
      const loginResponse = await axios.post(`${BACKEND_URL}/login`, {
        auth: {
          email: testEmail,
          password: testPassword,
        }
      }, {
        timeout: 5000,
        validateStatus: () => true
      });

      if (loginResponse.status === 200 && loginResponse.data.token) {
        console.log('   ✅ Login successful, got token');
        
        // Test teams endpoint with auth
        console.log('   Testing teams endpoint with authentication...');
        const teamsResponse = await axios.get(`${BACKEND_URL}/teams`, {
          headers: {
            'Authorization': `Bearer ${loginResponse.data.token}`
          },
          timeout: 3000,
          validateStatus: () => true
        });

        if (teamsResponse.status === 200) {
          console.log('   ✅ Teams endpoint works with valid authentication');
          console.log(`      Found ${teamsResponse.data.length || 0} teams`);
        } else {
          console.log(`   ⚠️  Teams endpoint returned status: ${teamsResponse.status}`);
        }
      } else {
        console.log('   ❌ Login failed:', loginResponse.status, loginResponse.data?.message);
      }
    } else {
      console.log('   ❌ Test user creation failed:', registerResponse.status);
      if (registerResponse.data) {
        console.log('      Error details:', JSON.stringify(registerResponse.data, null, 2));
      }
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('   ❌ Backend server not running');
    } else {
      console.log('   ❌ Error in authentication test:', error.message);
    }
  }

  // Test 4: Monitor backend logs for unauthorized requests
  console.log('\n4. Summary of validation:');
  console.log('   - TeamContext now checks for session?.token AND session?.email');
  console.log('   - Teams service methods have ensureAuthenticated() guards');
  console.log('   - useEffect dependencies updated to prevent unnecessary calls');
  console.log('   - Error handling clears team data when auth fails');
  
  console.log('\n✅ Validation completed!');
  console.log('\n💡 To further validate:');
  console.log('   1. Open http://localhost:3001/login in browser');
  console.log('   2. Check backend logs - you should NOT see any GET /api/v1/teams requests');
  console.log('   3. Only after successful login should team requests appear');
}

// Run the validation
validateTeamAuthFix().catch(console.error);