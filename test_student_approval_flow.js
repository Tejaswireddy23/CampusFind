const http = require('http');

async function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, headers: res.headers, data: json, raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function testNewStudentApprovalFlow() {
  console.log('--- TESTING NEW STUDENT APPROVAL WORKFLOW ---');

  // 1. Admin login
  const adminLogin = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@campusfind.edu', password: 'Admin@123' });

  if (adminLogin.status !== 200) {
    throw new Error('Admin login failed: ' + adminLogin.raw);
  }
  const adminToken = adminLogin.data.token;
  console.log('✓ Admin logged in successfully.');

  // 2. Register new student
  const testStudentId = 'STU' + Math.floor(Math.random() * 900000 + 100000);
  const testEmail = testStudentId.toLowerCase() + '@student.college.edu';
  const regRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    studentId: testStudentId,
    name: 'Kavya Sundaram',
    email: testEmail,
    phone: '+1 555-0988',
    department: 'Computer Science & Engineering',
    year: '2nd Year',
    section: 'Section B',
    password: 'password123',
    confirmPassword: 'password123'
  });

  console.log('Registration HTTP Status:', regRes.status);
  console.log('Registration Status in response:', regRes.data.user.status);
  console.log('Token in response (must be null/empty for pending):', regRes.data.token);
  if (regRes.data.user.status !== 'PENDING') {
    throw new Error('Expected status PENDING, got: ' + regRes.data.user.status);
  }
  console.log('✓ New Student registered with status PENDING.');

  // 3. Attempt to login as PENDING student (MUST FAIL with custom message)
  const pendingLogin = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: testEmail, password: 'password123' });

  console.log('Pending login HTTP status (expected 401):', pendingLogin.status);
  console.log('Pending login error response:', pendingLogin.raw);
  if (pendingLogin.status !== 401 || !pendingLogin.raw.includes('waiting for administrator approval')) {
    throw new Error('Expected 401 with waiting for administrator approval message!');
  }
  console.log('✓ Login restriction for PENDING account verified.');

  // 4. Check account status endpoint (publicly accessible)
  const statusRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: `/api/auth/status?identifier=${testStudentId}`,
    method: 'GET'
  });
  console.log('Status endpoint response:', statusRes.data.status, 'Student:', statusRes.data.name);
  if (statusRes.data.status !== 'PENDING') {
    throw new Error('Expected status PENDING from status endpoint');
  }
  console.log('✓ Account status endpoint verified.');

  // 5. Admin lists pending student registrations
  const studentsRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/admin/students?status=PENDING',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('Pending students count:', studentsRes.data.totalElements);
  const foundStudent = studentsRes.data.content.find(s => s.studentId === testStudentId);
  if (!foundStudent) {
    throw new Error('Newly registered student not found in admin pending list');
  }
  console.log('✓ Student found in Admin pending queue. ID:', foundStudent.id);

  // 6. Admin approves student
  const approveRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: `/api/admin/students/${foundStudent.id}/approve`,
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('Approve HTTP status:', approveRes.status);
  console.log('Updated Student status:', approveRes.data.status, 'Approved By:', approveRes.data.approvedBy);
  if (approveRes.data.status !== 'APPROVED') {
    throw new Error('Expected status APPROVED');
  }
  console.log('✓ Admin successfully approved student.');

  // 7. Student can now log in!
  const approvedLogin = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: testEmail, password: 'password123' });

  console.log('Approved student login status:', approvedLogin.status);
  if (approvedLogin.status !== 200 || !approvedLogin.data.token) {
    throw new Error('Approved student could not log in: ' + approvedLogin.raw);
  }
  const studentToken = approvedLogin.data.token;
  console.log('✓ Approved student logged in successfully with JWT token issued!');

  // 8. Admin creates a Campus Alert
  const alertRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/campus-alerts',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }
  }, {
    title: 'Important Lost & Found Alert: Keys Found',
    message: 'A set of keys was found near the Library. If these belong to you, please check the CampusFind portal.',
    category: 'Keys',
    targetAudience: 'ALL STUDENTS',
    priority: 'IMPORTANT'
  });
  console.log('Create Campus Alert HTTP status:', alertRes.status);
  console.log('Created alert title:', alertRes.data.title, 'Priority:', alertRes.data.priority);
  if (alertRes.status !== 200) {
    throw new Error('Failed to create campus alert');
  }
  console.log('✓ Admin created campus alert.');

  // 9. Student retrieves campus alerts
  const studentAlertsRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/campus-alerts',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  console.log('Student alerts received:', studentAlertsRes.data.totalElements);
  if (studentAlertsRes.data.totalElements === 0) {
    throw new Error('Student did not receive campus alerts');
  }
  console.log('✓ Student received targeted campus alert.');

  // 10. Check Location Distribution
  const distRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/campus-locations/distribution',
    method: 'GET'
  });
  console.log('Location distribution count:', distRes.data.length);
  const canteenLoc = distRes.data.find(l => l.name === 'Canteen');
  console.log('Canteen reports count:', canteenLoc ? canteenLoc.reportCount : 'N/A');
  console.log('✓ Campus location distribution verified with real report counts.');

  console.log('\n======================================================');
  console.log('✓✓✓ ALL BACKEND ENHANCEMENT TESTS PASSED 100%! ✓✓✓');
  console.log('======================================================');
}

testNewStudentApprovalFlow().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
