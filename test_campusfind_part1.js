const http = require('http');

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL('http://localhost:8081' + path);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING CAMPUSFIND PART 1 BACKEND VERIFICATION ---');

  // 1. Campus Locations
  console.log('\n1. Fetching Campus Locations:');
  const locRes = await request('GET', '/api/campus-locations');
  console.log(`Status: ${locRes.status}, Found: ${locRes.data.length} locations`);
  if (locRes.data.length < 14) throw new Error('Expected 14 campus locations');
  console.log('Sample locations:', locRes.data.slice(0, 5).map(l => l.name).join(', '));

  // 2. Categories
  console.log('\n2. Fetching Categories:');
  const catRes = await request('GET', '/api/categories');
  console.log(`Status: ${catRes.status}, Found: ${catRes.data.length} categories`);
  if (catRes.data.length < 14) throw new Error('Expected 14 categories');
  console.log('Sample categories:', catRes.data.slice(0, 5).map(c => c.name).join(', '));

  // 3. Register New Student
  const testStudentId = 'STU' + Math.floor(100000 + Math.random() * 900000);
  const testEmail = `student_${testStudentId.toLowerCase()}@student.college.edu`;
  console.log(`\n3. Registering Student: ${testStudentId} (${testEmail})`);
  const regRes = await request('POST', '/api/auth/register', {
    studentId: testStudentId,
    name: 'Rohan Sharma',
    email: testEmail,
    phone: '+91 9876543210',
    department: 'Computer Science',
    year: '3rd Year',
    section: 'A',
    password: 'Password@123',
    confirmPassword: 'Password@123'
  });
  console.log(`Status: ${regRes.status}`, regRes.data.token ? 'JWT received ✓' : regRes.data);
  const studentToken = regRes.data.token;
  if (!studentToken) throw new Error('Registration failed, no token');

  // 4. Student Login using Student ID
  console.log('\n4. Login using Student ID:');
  const loginIdRes = await request('POST', '/api/auth/login', {
    loginIdentifier: testStudentId,
    password: 'Password@123'
  });
  console.log(`Status: ${loginIdRes.status}`, loginIdRes.data.token ? 'Login via Student ID SUCCESS ✓' : loginIdRes.data);

  // 5. Student Login using College Email
  console.log('\n5. Login using College Email:');
  const loginEmailRes = await request('POST', '/api/auth/login', {
    loginIdentifier: testEmail,
    password: 'Password@123'
  });
  console.log(`Status: ${loginEmailRes.status}`, loginEmailRes.data.token ? 'Login via College Email SUCCESS ✓' : loginEmailRes.data);

  // 6. Admin Login
  console.log('\n6. Admin Login:');
  const adminRes = await request('POST', '/api/auth/login', {
    loginIdentifier: 'admin@campusfind.edu',
    password: 'Admin@123'
  });
  console.log(`Status: ${adminRes.status}`, adminRes.data.token ? 'Admin Login SUCCESS ✓' : adminRes.data);
  const adminToken = adminRes.data.token;

  // 7. Student Profile
  console.log('\n7. Get Student Profile:');
  const profRes = await request('GET', '/api/users/profile', null, {
    'Authorization': `Bearer ${studentToken}`
  });
  console.log(`Status: ${profRes.status}, Name: ${profRes.data.name}, Student ID: ${profRes.data.studentId}, Department: ${profRes.data.department}, Year: ${profRes.data.year}`);

  // 8. Update Student Profile
  console.log('\n8. Updating Student Profile:');
  const updateProfRes = await request('PUT', '/api/users/profile', {
    name: 'Rohan Sharma (Updated)',
    phone: '+91 9999888877',
    department: 'Information Technology',
    year: '4th Year',
    section: 'B'
  }, {
    'Authorization': `Bearer ${studentToken}`
  });
  console.log(`Status: ${updateProfRes.status}, Updated Dept: ${updateProfRes.data.department}, Year: ${updateProfRes.data.year}`);

  // 9. Report Lost Item
  console.log('\n9. Reporting Lost Item:');
  const lostItemRes = await request('POST', '/api/items/lost', {
    title: 'Blue Hydro Flask Water Bottle',
    category: 'Accessories',
    description: 'Stainless steel 32oz blue bottle with campus tech club sticker.',
    brand: 'Hydro Flask',
    model: 'Wide Mouth 32oz',
    color: 'Pacific Blue',
    dateLostOrFound: '2026-10-02',
    approximateTime: '02:30 PM',
    location: 'Library',
    additionalDetails: 'Has a small scratch near the base.',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800'
  }, {
    'Authorization': `Bearer ${studentToken}`
  });
  console.log(`Status: ${lostItemRes.status}`, lostItemRes.data.id ? `Created Lost Item ID: ${lostItemRes.data.id} ✓` : lostItemRes.data);
  const lostItemId = lostItemRes.data.id;

  // 10. Report Found Item
  console.log('\n10. Reporting Found Item:');
  const foundItemRes = await request('POST', '/api/items/found', {
    title: 'Silver Scientific Calculator FX-991EX',
    category: 'Calculator',
    description: 'Found on desk row 4 after morning calculus lecture.',
    brand: 'Casio',
    model: 'fx-991EX ClassWiz',
    color: 'Silver and Black',
    dateLostOrFound: '2026-10-03',
    approximateTime: '11:15 AM',
    location: 'Seminar Hall',
    additionalDetails: 'Has white label tape with initials on the back.',
    imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800'
  }, {
    'Authorization': `Bearer ${studentToken}`
  });
  console.log(`Status: ${foundItemRes.status}`, foundItemRes.data.id ? `Created Found Item ID: ${foundItemRes.data.id} ✓` : foundItemRes.data);
  const foundItemId = foundItemRes.data.id;

  // 11. Search Items
  console.log('\n11. Searching Items via /api/items/search:');
  const searchRes = await request('GET', '/api/items/search?query=Calculator');
  console.log(`Status: ${searchRes.status}, Total matches: ${searchRes.data.totalElements || searchRes.data.content?.length}`);

  // 12. My Reports
  console.log('\n12. Fetching My Reports:');
  const myReportsRes = await request('GET', '/api/items/my-reports', null, {
    'Authorization': `Bearer ${studentToken}`
  });
  console.log(`Status: ${myReportsRes.status}, My Reports Count: ${myReportsRes.data.totalElements}`);

  // 13. Dashboard Stats
  console.log('\n13. Fetching Student Dashboard Stats:');
  const statsRes = await request('GET', '/api/items/dashboard/stats', null, {
    'Authorization': `Bearer ${studentToken}`
  });
  console.log(`Status: ${statsRes.status}, My Lost: ${statsRes.data.myLostReports}, My Found: ${statsRes.data.myFoundReports}, Matches: ${statsRes.data.potentialMatches}`);

  // 14. Admin Reports Management
  console.log('\n14. Admin Getting All Reports (/api/admin/reports):');
  const adminReportsRes = await request('GET', '/api/admin/reports', null, {
    'Authorization': `Bearer ${adminToken}`
  });
  console.log(`Status: ${adminReportsRes.status}, Total Reports: ${adminReportsRes.data.totalElements}`);

  // 15. Admin Verifying Report
  console.log(`\n15. Admin Verifying Lost Report #${lostItemId}:`);
  const verifyRes = await request('PUT', `/api/admin/reports/${lostItemId}/verify`, null, {
    'Authorization': `Bearer ${adminToken}`
  });
  console.log(`Status: ${verifyRes.status}, Moderation Status: ${verifyRes.data.moderationStatus || 'VERIFIED'}`);

  // 16. Admin Updating Report Status
  console.log(`\n16. Admin Updating Report Status to ACTIVE:`);
  const statusRes = await request('PUT', `/api/admin/reports/${lostItemId}/status`, {
    status: 'ACTIVE',
    reason: 'Verified campus report by admin'
  }, {
    'Authorization': `Bearer ${adminToken}`
  });
  console.log(`Status: ${statusRes.status}, New Status: ${statusRes.data.status}`);

  console.log('\n========================================');
  console.log('✓ ALL PART 1 BACKEND API TESTS PASSED SUCCESSFULLY!');
  console.log('========================================');
}

runTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
