const axios = require('./frontend/node_modules/axios');

const API_BASE = 'http://localhost:8081/api';

async function runTests() {
  console.log('================================================================');
  console.log('CAMPUSFIND - FINAL ENHANCEMENTS VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    const timestamp = Date.now();
    const student1Id = `CSE-${timestamp.toString().slice(-4)}`;
    const student1Email = `sneha.${timestamp}@student.college.edu`;
    const studentPassword = 'Password@123';

    // 1. Student Registration
    console.log('1. Testing Student Registration (Pending Admin Approval)...');
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      studentId: student1Id,
      name: 'Sneha Reddy',
      email: student1Email,
      phone: '9876543210',
      department: 'Computer Science',
      year: '3rd Year',
      section: 'B',
      password: studentPassword,
      confirmPassword: studentPassword,
    });

    assert(regRes.status === 200 || regRes.status === 201, 'Registration returns successful 200/201');
    assert(regRes.data.user.status === 'PENDING', 'New student account status is PENDING');
    assert(regRes.data.token === null, 'No JWT token issued before approval (login blocked)');

    // 2. Login Restriction for PENDING
    console.log('\n2. Testing Login Restriction for PENDING student...');
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        loginIdentifier: student1Email,
        email: student1Email,
        password: studentPassword,
      });
      assert(false, 'Pending student login should have thrown 401 Unauthorized');
    } catch (err) {
      assert(err.response?.status === 401, 'Pending student receives 401 Unauthorized on login');
      assert(
        err.response?.data?.message?.includes('waiting for administrator approval'),
        `Error message matches requirement: "${err.response?.data?.message}"`
      );
    }

    // 3. Public Account Status Lookup
    console.log('\n3. Testing Public Account Status Lookup (/api/auth/status)...');
    const statusRes = await axios.get(`${API_BASE}/auth/status?identifier=${student1Id}`);
    assert(statusRes.status === 200, 'Account status endpoint reachable');
    assert(statusRes.data.status === 'PENDING', 'Returns PENDING status');
    assert(statusRes.data.name === 'Sneha Reddy', 'Returns student name');
    assert(statusRes.data.studentId === student1Id, 'Returns student ID');

    // 4. Admin Login & Pending Approvals Queue
    console.log('\n4. Testing Admin Approvals Queue...');
    const adminLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      loginIdentifier: 'admin@campusfind.edu',
      email: 'admin@campusfind.edu',
      password: 'Admin@123',
    });
    const adminToken = adminLoginRes.data.token;
    assert(adminToken !== null, 'Admin logged in successfully and received JWT');

    const pendingListRes = await axios.get(`${API_BASE}/admin/students?status=PENDING`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const pendingStudent = pendingListRes.data.content.find((s) => s.studentId === student1Id);
    assert(!!pendingStudent, 'Registered student is visible in Admin Pending Approvals queue');

    // 5. Admin Approves Student
    console.log('\n5. Testing Admin Approval Workflow...');
    const approveRes = await axios.put(
      `${API_BASE}/admin/students/${pendingStudent.id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert(approveRes.status === 200, 'Approval endpoint returns 200');
    assert(approveRes.data.status === 'APPROVED', 'Student status transitioned PENDING -> APPROVED');
    assert(!!approveRes.data.approvedBy, `Approving admin recorded in database: ${approveRes.data.approvedBy}`);
    assert(!!approveRes.data.approvedAt, 'Approval timestamp recorded in database');

    // 6. Approved Student Login
    console.log('\n6. Testing Approved Student Login...');
    const studentLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      loginIdentifier: student1Email,
      email: student1Email,
      password: studentPassword,
    });
    assert(studentLoginRes.status === 200, 'Approved student logs in successfully');
    const studentToken = studentLoginRes.data.token;
    assert(studentToken !== null, 'JWT token issued to approved student');
    assert(studentLoginRes.data.user.status === 'APPROVED', 'User profile status is APPROVED');

    // 7. Student Rejection Workflow
    console.log('\n7. Testing Student Rejection Workflow...');
    const student2Id = `ECE-${(timestamp + 1).toString().slice(-4)}`;
    const student2Email = `rahul.${timestamp}@student.college.edu`;
    const reg2Res = await axios.post(`${API_BASE}/auth/register`, {
      studentId: student2Id,
      name: 'Rahul Verma',
      email: student2Email,
      phone: '9876543211',
      department: 'Electronics',
      year: '2nd Year',
      section: 'A',
      password: studentPassword,
      confirmPassword: studentPassword,
    });
    const student2User = reg2Res.data.user;

    const rejectionReason = 'Student ID could not be verified in college registrar database.';
    const rejectRes = await axios.put(
      `${API_BASE}/admin/students/${student2User.id}/reject`,
      { reason: rejectionReason },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert(rejectRes.status === 200, 'Reject endpoint returns 200');
    assert(rejectRes.data.status === 'REJECTED', 'Student status transitioned PENDING -> REJECTED');
    assert(rejectRes.data.rejectionReason === rejectionReason, 'Rejection reason stored safely');

    try {
      await axios.post(`${API_BASE}/auth/login`, {
        loginIdentifier: student2Email,
        email: student2Email,
        password: studentPassword,
      });
      assert(false, 'Rejected student login should have failed with 401');
    } catch (err) {
      assert(err.response?.status === 401, 'Rejected student receives 401 Unauthorized on login');
      assert(
        err.response?.data?.message?.includes(rejectionReason),
        `Rejection reason displayed in login rejection: "${err.response?.data?.message}"`
      );
    }

    // 8. Campus Alerts System
    console.log('\n8. Testing Campus-Wide Alert Broadcast...');
    const alertRes = await axios.post(
      `${API_BASE}/campus-alerts`,
      {
        title: '🚨 Important Lost & Found Alert',
        message: 'A set of keys was found near the Library. If these belong to you, please check the CampusFind portal.',
        category: 'Found Item',
        targetAudience: 'ALL STUDENTS',
        priority: 'URGENT',
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert(alertRes.status === 200 || alertRes.status === 201, 'Alert created with 200/201 status');
    assert(alertRes.data.priority === 'URGENT', 'Priority is URGENT');

    const studentAlertsRes = await axios.get(`${API_BASE}/campus-alerts`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const alertList = studentAlertsRes.data.content || studentAlertsRes.data;
    assert(alertList.some((a) => a.id === alertRes.data.id), 'Student received broadcast alert');

    // 9. Campus Locations & Report Distribution
    console.log('\n9. Testing Campus Location Distribution & Safe Deletion Guard...');
    const distRes = await axios.get(`${API_BASE}/campus-locations/distribution`);
    assert(distRes.status === 200, 'Campus location distribution endpoint returns 200');
    assert(Array.isArray(distRes.data) && distRes.data.length > 0, 'Returns campus location distribution list');
    console.log(`     Sample hotspot: ${distRes.data[0]?.name} — ${distRes.data[0]?.reportCount} reports`);

    // Verify deletion protection for active location
    const locationsRes = await axios.get(`${API_BASE}/campus-locations?all=true`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const canteenLoc = locationsRes.data.find((l) => l.name?.toLowerCase().includes('canteen'));
    if (canteenLoc) {
      try {
        await axios.delete(`${API_BASE}/campus-locations/${canteenLoc.id}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        assert(false, 'Should not allow deletion of location referenced in reports');
      } catch (err) {
        assert(err.response?.status === 400, 'Protected location deletion blocked with 400 Bad Request');
      }
    }

    // 10. Campus Analytics Verification
    console.log('\n10. Testing Campus Analytics Metrics...');
    const dashRes = await axios.get(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(dashRes.data.totalRegisteredStudents >= 2, 'Admin dashboard includes totalRegisteredStudents');
    assert(dashRes.data.approvedStudents >= 1, 'Admin dashboard includes approvedStudents');
    assert(typeof dashRes.data.pendingStudentApprovals === 'number', 'Includes pendingStudentApprovals');
    assert(typeof dashRes.data.reportsThisMonth === 'number', 'Includes reportsThisMonth');

    const anaRes = await axios.get(`${API_BASE}/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(typeof anaRes.data.recoveryRate === 'number', `Recovery Rate is ${anaRes.data.recoveryRate}%`);
    assert(anaRes.data.itemsByCategory !== undefined, 'Items by category present in analytics');
    assert(anaRes.data.topReportingLocations !== undefined, 'Top reporting locations present');

    // 11. Audit Trail Verification
    console.log('\n11. Testing Admin Audit Logs...');
    const auditRes = await axios.get(`${API_BASE}/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(auditRes.status === 200, 'Audit logs retrieved successfully');
    const actions = auditRes.data.content.map((l) => l.action);
    assert(actions.includes('STUDENT_APPROVED'), 'Audit log contains STUDENT_APPROVED');
    assert(actions.includes('STUDENT_REJECTED'), 'Audit log contains STUDENT_REJECTED');
    assert(actions.includes('CAMPUS_ALERT_CREATED'), 'Audit log contains CAMPUS_ALERT_CREATED');

  } catch (err) {
    console.error('Test Suite encountered an unexpected error:', err.response?.data || err.message);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
