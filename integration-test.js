const axios = require('axios');

// Configure axios with the same setup as the frontend
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

async function testIntegration() {
  console.log('🚀 Starting Frontend-Backend Integration Tests\n');

  // Test 1: Basic connectivity and CORS
  console.log('1. Testing basic connectivity and CORS...');
  try {
    const response = await api.get('/teams');
    console.log('✅ Successfully fetched teams');
    console.log(`   Response status: ${response.status}`);
    console.log(`   Teams found: ${response.data.length}`);
    console.log(`   CORS headers present: ${response.headers['access-control-allow-origin'] ? 'Yes' : 'No'}`);
  } catch (error) {
    console.log('❌ Failed to fetch teams:', error.message);
  }

  // Test 2: POST request (team creation)
  console.log('\n2. Testing POST request (team creation)...');
  try {
    const teamData = {
      team: {
        name: 'Frontend Integration Test',
        subdomain: `frontend-test-${Date.now()}`
      }
    };
    const response = await api.post('/teams', teamData);
    console.log('✅ Successfully created team');
    console.log(`   Response status: ${response.status}`);
    console.log(`   Created team ID: ${response.data.id}`);
    console.log(`   Team name: ${response.data.name}`);
    
    // Store the created team ID for further tests
    global.testTeamId = response.data.id;
  } catch (error) {
    console.log('❌ Failed to create team:', error.message);
    if (error.response && error.response.data) {
      console.log('   Error details:', error.response.data);
    }
  }

  // Test 3: Error handling and validation
  console.log('\n3. Testing error handling and validation...');
  try {
    const invalidTeamData = {
      team: {
        name: '',
        subdomain: 'invalid@subdomain!'
      }
    };
    await api.post('/teams', invalidTeamData);
    console.log('❌ Should have failed validation');
  } catch (error) {
    if (error.response && error.response.status === 422) {
      console.log('✅ Validation errors handled correctly');
      console.log(`   Response status: ${error.response.status}`);
      console.log('   Validation errors:', error.response.data.errors);
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }

  // Test 4: Update team (PUT request)
  console.log('\n4. Testing PUT request (team update)...');
  if (global.testTeamId) {
    try {
      const updateData = {
        team: {
          name: 'Updated Frontend Integration Test'
        }
      };
      const response = await api.put(`/teams/${global.testTeamId}`, updateData);
      console.log('✅ Successfully updated team');
      console.log(`   Response status: ${response.status}`);
      console.log(`   Updated name: ${response.data.name}`);
    } catch (error) {
      console.log('❌ Failed to update team:', error.message);
      if (error.response && error.response.data) {
        console.log('   Error details:', error.response.data);
      }
    }
  } else {
    console.log('⚠️  Skipping update test - no team ID available');
  }

  // Test 5: Authentication-required endpoint
  console.log('\n5. Testing authentication-required endpoints...');
  try {
    await api.get('/admins');
    console.log('❌ Should have required authentication');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Authentication properly required');
      console.log('   Unauthorized access blocked correctly');
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }

  // Test 6: Login attempt
  console.log('\n6. Testing login endpoint...');
  try {
    const loginData = {
      email: 'admin@example.com',
      password: 'password123'
    };
    const response = await api.post('/login', loginData);
    console.log('✅ Login successful');
    console.log(`   Response status: ${response.status}`);
    // Store token for authenticated requests
    if (response.data.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      console.log('   JWT token received and configured');
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('⚠️  Login failed (expected with test credentials)');
      console.log('   Proper authentication error handling');
    } else {
      console.log('❌ Unexpected login error:', error.message);
    }
  }

  // Test 7: Test response time and performance
  console.log('\n7. Testing response times...');
  const startTime = Date.now();
  try {
    await api.get('/teams');
    const responseTime = Date.now() - startTime;
    console.log(`✅ API response time: ${responseTime}ms`);
    if (responseTime < 100) {
      console.log('   Excellent performance');
    } else if (responseTime < 500) {
      console.log('   Good performance');
    } else {
      console.log('   Performance could be improved');
    }
  } catch (error) {
    console.log('❌ Failed to measure response time:', error.message);
  }

  console.log('\n🏁 Integration tests completed!\n');
}

// Run the tests
testIntegration().catch(console.error);