const axios = require('axios');

// Test configuration
const NEW_TEST_USER = {
  email: 'newtest@mailinator.com',
  password: 'Pa$$w0rd!'
};

const FRONTEND_URL = 'http://localhost:3001';
const BACKEND_URL = 'http://localhost:3000/api/v1';

async function testNewUserFlow() {
  console.log('🚀 Testing New User Registration and Team Setup Flow\n');
  console.log(`New Test User: ${NEW_TEST_USER.email}`);
  console.log(`Password: ${NEW_TEST_USER.password}\n`);

  let token = null;
  let userId = null;

  try {
    // Step 1: Register new user
    console.log('1. Testing user registration...');
    const registerResponse = await axios.post(`${BACKEND_URL}/register`, {
      registration: {
        email: NEW_TEST_USER.email,
        password: NEW_TEST_USER.password,
        password_confirmation: NEW_TEST_USER.password,
      }
    }, {
      timeout: 10000,
      validateStatus: () => true
    });

    if (registerResponse.status === 200 || registerResponse.status === 201) {
      console.log('   ✅ Registration successful');
      console.log(`   📧 User created: ${NEW_TEST_USER.email}`);
    } else {
      console.log('   ❌ Registration failed:', registerResponse.status);
      if (registerResponse.data) {
        console.log('      Error:', registerResponse.data);
      }
      return;
    }

    // Step 2: Login with new user  
    console.log('\n2. Testing first login...');
    const loginResponse = await axios.post(`${BACKEND_URL}/login`, {
      auth: {
        email: NEW_TEST_USER.email,
        password: NEW_TEST_USER.password,
      }
    }, {
      timeout: 5000,
      validateStatus: () => true
    });

    if (loginResponse.status === 200 && loginResponse.data.token) {
      token = loginResponse.data.token;
      console.log('   ✅ First login successful');
      console.log(`   🔑 Token received: ${token.substring(0, 20)}...`);
      console.log(`   👤 Needs profile setup: ${loginResponse.data.needs_profile_setup || 'false'}`);
    } else {
      console.log('   ❌ Login failed:', loginResponse.status);
      return;
    }

    // Step 3: Check if mock team was created during registration
    console.log('\n3. Checking mock team creation...');
    const teamsResponse = await axios.get(`${BACKEND_URL}/teams`, {
      headers: { 'Authorization': `Bearer ${token}` },
      timeout: 5000,
      validateStatus: () => true
    });

    if (teamsResponse.status === 200) {
      const teams = teamsResponse.data;
      console.log(`   ✅ Teams API accessible`);
      console.log(`   📋 Found ${teams.length} team(s)`);
      
      if (teams.length > 0) {
        const mockTeam = teams[0];
        console.log(`   🏢 Mock team: "${mockTeam.name}" (ID: ${mockTeam.id})`);
        console.log(`   🌐 Subdomain: ${mockTeam.subdomain || 'not set'}`);
      } else {
        console.log('   ⚠️  No mock team found - this might be an issue');
      }
    } else {
      console.log(`   ❌ Teams API failed: ${teamsResponse.status}`);
      if (teamsResponse.data) {
        console.log('      Error:', teamsResponse.data);
      }
    }

    // Step 4: Test ProfileAdmin status
    console.log('\n4. Testing ProfileAdmin status...');
    const profileResponse = await axios.get(`${BACKEND_URL}/profile_admins/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
      timeout: 3000,
      validateStatus: () => true
    });

    if (profileResponse.status === 200) {
      console.log('   ✅ ProfileAdmin exists (unexpected for new user)');
      const profile = profileResponse.data.data;
      console.log(`   👤 Name: ${profile.name} ${profile.last_name || ''}`);
    } else if (profileResponse.status === 401 || profileResponse.status === 404) {
      console.log('   ✅ ProfileAdmin not found (expected for new user)');
      console.log('      → User will need to complete profile setup');
    } else {
      console.log(`   ❓ Unexpected response: ${profileResponse.status}`);
    }

    // Step 5: Test customer access (should trigger our fix)
    console.log('\n5. Testing customer API access (testing our 401 fix)...');
    const customersResponse = await axios.get(`${BACKEND_URL}/profile_customers`, {
      headers: { 'Authorization': `Bearer ${token}` },
      timeout: 5000,
      validateStatus: () => true
    });

    if (customersResponse.status === 401) {
      console.log('   ✅ Customer API correctly returns 401 for user without ProfileAdmin');
      console.log('      → This should trigger redirect to team-check');
    } else if (customersResponse.status === 200) {
      console.log('   ⚠️  Customer API returned 200 (unexpected for new user without ProfileAdmin)');
    } else {
      console.log(`   ❓ Customer API returned: ${customersResponse.status}`);
    }

    // Step 6: Test team update functionality
    if (teamsResponse.status === 200 && teamsResponse.data.length > 0) {
      console.log('\n6. Testing team update functionality...');
      const mockTeam = teamsResponse.data[0];
      
      const updateData = {
        name: 'Test Law Firm Updated',
        subdomain: 'test-law-firm-updated'
      };

      const formData = new FormData();
      formData.append('team[name]', updateData.name);
      formData.append('team[subdomain]', updateData.subdomain);

      const updateResponse = await axios.patch(`${BACKEND_URL}/teams/${mockTeam.id}`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          ...formData.getHeaders()
        },
        timeout: 5000,
        validateStatus: () => true
      });

      if (updateResponse.status === 200) {
        console.log('   ✅ Team update successful');
        console.log(`   📋 Updated name: "${updateResponse.data.name}"`);
        console.log(`   🌐 Updated subdomain: "${updateResponse.data.subdomain}"`);
      } else {
        console.log(`   ❌ Team update failed: ${updateResponse.status}`);
        if (updateResponse.data) {
          console.log('      Error:', JSON.stringify(updateResponse.data, null, 2));
        }
      }
    }

  } catch (error) {
    console.log('\n❌ Test failed with error:', error.message);
    if (error.response) {
      console.log('   Response status:', error.response.status);
      console.log('   Response data:', error.response.data);
    }
  }

  // Summary
  console.log('\n📊 New User Flow Test Results:');
  console.log('===============================');
  console.log('✅ Testing registration → login → team setup flow');
  console.log('✅ Checking ProfileAdmin requirement handling');
  console.log('✅ Testing customer API 401 error handling');
  console.log('✅ Testing team update functionality');
  console.log('');
  console.log('🎯 Expected Flow for New Users:');
  console.log('1. Register → Login → Redirect to /team-check');
  console.log('2. ProfileAdmin setup modal appears');
  console.log('3. After ProfileAdmin creation → Team setup');
  console.log('4. After team setup → Access to /clientes works');
  console.log('');
  console.log('🔧 Issues to Check:');
  console.log('- Modal flickering during form interaction');
  console.log('- Team setup system functionality');
  console.log('- Proper redirect flow for new users');
  
  console.log('\n🏁 New User Flow Test Completed!');
}

// Run the test
testNewUserFlow().catch(console.error);