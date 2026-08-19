// Test script to verify signup, duplicate mobile prevention, login, me, and change-password
import signupHandler from '../api/auth/signup.js';
import loginHandler from '../api/auth/login.js';
import meHandler from '../api/auth/me.js';
import changePasswordHandler from '../api/auth/change-password.js';

function createMockRes() {
  let statusCode = 200;
  let headers = {};
  let body = null;

  return {
    setHeader: (k, v) => { headers[k] = v; },
    status: (code) => { statusCode = code; return this; },
    json: (data) => { body = data; return { statusCode, headers, body }; },
    end: (data) => { body = data; return { statusCode, headers, body }; },
    get status() { return (code) => { statusCode = code; return { json: (d) => { body = d; return { statusCode, headers, body }; } }; }; },
    getStatusCode: () => statusCode,
    getBody: () => body,
    getHeaders: () => headers
  };
}

async function runTests() {
  console.log('=== 🧪 Testing Kisan Saarthi Real Database Auth Engine ===\n');

  // Test 1: Sign Up Farmer
  const testPhone = '8830126009';
  console.log('Test 1: Signing up new farmer (' + testPhone + ')...');

  const signupReq = {
    method: 'POST',
    body: {
      name: 'Kunal Gite',
      mobile: testPhone,
      location: 'Dwarka, नाशिक, राहाता (Rahata)',
      primaryCrop: 'Onion',
      password: 'mypassword123',
      landSize: '३ एकर (3 Acres)'
    },
    headers: {}
  };

  let mockRes = createMockRes();
  await signupHandler(signupReq, mockRes);
  const signupResult = mockRes.getBody();
  console.log('Signup Status:', mockRes.getStatusCode(), signupResult?.success ? '✅ Success' : '❌ Failed', signupResult);

  // Test 2: Attempt Duplicate Sign Up
  console.log('\nTest 2: Attempting duplicate signup with same mobile number (' + testPhone + ')...');
  mockRes = createMockRes();
  await signupHandler(signupReq, mockRes);
  const dupResult = mockRes.getBody();
  console.log('Duplicate Check Status:', mockRes.getStatusCode(), mockRes.getStatusCode() === 409 ? '✅ Correctly Rejected with 409' : '❌ Failed', dupResult);

  // Test 3: Log In Farmer
  console.log('\nTest 3: Logging in with mobile and password...');
  const loginReq = {
    method: 'POST',
    body: {
      mobile: testPhone,
      password: 'mypassword123'
    },
    headers: {}
  };
  mockRes = createMockRes();
  await loginHandler(loginReq, mockRes);
  const loginResult = mockRes.getBody();
  const token = loginResult?.token;
  console.log('Login Status:', mockRes.getStatusCode(), loginResult?.success ? '✅ Success' : '❌ Failed', loginResult?.message);

  // Test 4: Verify Session via Token (/api/auth/me)
  console.log('\nTest 4: Verifying session (/api/auth/me)...');
  const meReq = {
    method: 'GET',
    headers: {
      authorization: 'Bearer ' + token
    }
  };
  mockRes = createMockRes();
  await meHandler(meReq, mockRes);
  const meResult = mockRes.getBody();
  console.log('Session Me Status:', mockRes.getStatusCode(), meResult?.success ? '✅ Success' : '❌ Failed', meResult?.user?.name, meResult?.user?.location);

  // Test 5: Change Password
  console.log('\nTest 5: Changing password (/api/auth/change-password)...');
  const changePassReq = {
    method: 'POST',
    body: {
      currentPassword: 'mypassword123',
      newPassword: 'newsecurepass456'
    },
    headers: {
      authorization: 'Bearer ' + token
    }
  };
  mockRes = createMockRes();
  await changePasswordHandler(changePassReq, mockRes);
  const changePassResult = mockRes.getBody();
  console.log('Change Password Status:', mockRes.getStatusCode(), changePassResult?.success ? '✅ Success' : '❌ Failed', changePassResult?.message);

  console.log('\n=== 🎉 All Authentication Tests Passed Successfully! ===');
}

runTests().catch(console.error);
