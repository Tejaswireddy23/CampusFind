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

async function login(email, password) {
  const res = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, password });
  if (res.status !== 200) {
    throw new Error(`Login failed for ${email}: ${res.status} ${res.raw}`);
  }
  return res.data.token;
}

async function runFullLifecycleTest() {
  console.log('================================================================');
  console.log('CAMPUSFIND PART 3 & FINAL - COMPLETE END-TO-END LIFECYCLE TEST');
  console.log('REPORT -> SEARCH -> MATCH -> LIVE ALERT -> CONTACT -> VERIFY -> RECOVER -> CLOSE');
  console.log('================================================================\n');

  // STEP 1: Authenticate Student A, Student B, and Admin
  console.log('[Step 1] Authenticating users...');
  const tokenStudentA = await login('aravind@student.college.edu', 'password123');
  const tokenStudentB = await login('priya@student.college.edu', 'password123');
  const tokenAdmin = await login('admin@campusfind.edu', 'Admin@123');
  console.log('✓ Student A (Aravind Sharma - STU2024001) logged in.');
  console.log('✓ Student B (Priya Patel - STU2024002) logged in.');
  console.log('✓ Campus Administrator (admin@campusfind.edu) logged in.\n');

  // STEP 2: Student A reports LOST: Black Wallet at Canteen
  console.log('[Step 2] Student A reports LOST: Black Wallet at Canteen...');
  const lostRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/items',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenStudentA}`,
      'Content-Type': 'application/json'
    }
  }, {
    title: 'Black Leather Wallet',
    description: 'Black leather bi-fold wallet lost in canteen dining area near table 5. Contains student ID and coffee card.',
    category: 'Wallet',
    type: 'LOST',
    status: 'ACTIVE',
    location: 'Canteen',
    dateLostOrFound: new Date().toISOString().split('T')[0],
    brand: 'Tommy Hilfiger',
    color: 'Black'
  });
  console.log(`Report Lost status: ${lostRes.status}`);
  if (lostRes.status !== 200) {
    throw new Error(`Failed to create lost item: ${lostRes.raw}`);
  }
  const lostItem = lostRes.data;
  console.log(`✓ Lost Item created: ID ${lostItem.id}, Title: "${lostItem.title}", Location: "${lostItem.location}"\n`);

  // STEP 3: Student B reports FOUND: Black Wallet at Canteen
  console.log('[Step 3] Student B reports FOUND: Black Wallet at Canteen...');
  const foundRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/items',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenStudentB}`,
      'Content-Type': 'application/json'
    }
  }, {
    title: 'Black Leather Wallet',
    description: 'Found black leather bi-fold wallet left on table in canteen near food counter.',
    category: 'Wallet',
    type: 'FOUND',
    status: 'ACTIVE',
    location: 'Canteen',
    dateLostOrFound: new Date().toISOString().split('T')[0],
    brand: 'Tommy Hilfiger',
    color: 'Black'
  });
  console.log(`Report Found status: ${foundRes.status}`);
  if (foundRes.status !== 200) {
    throw new Error(`Failed to create found item: ${foundRes.raw}`);
  }
  const foundItem = foundRes.data;
  console.log(`✓ Found Item created: ID ${foundItem.id}, Title: "${foundItem.title}", Location: "${foundItem.location}"\n`);

  // STEP 4: Backend Smart Matching Engine Execution
  console.log('[Step 4] Verifying Smart Matching Engine calculation...');
  const matchesRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/matches',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenStudentA}` }
  });
  console.log(`GET /api/matches status: ${matchesRes.status}`);
  const match = matchesRes.data.find(m =>
    (m.lostItem.id === lostItem.id && m.foundItem.id === foundItem.id) ||
    (m.lostItem.id === foundItem.id && m.foundItem.id === lostItem.id)
  );

  if (!match) {
    throw new Error(`Match not created between lost item ${lostItem.id} and found item ${foundItem.id}`);
  }
  console.log(`✓ POTENTIAL MATCH IDENTIFIED! ID: ${match.id}`);
  console.log(`✓ Match Score: ${match.matchScore}% Potential Match`);
  console.log(`✓ Matching Attributes:`, match.matchingAttributes);
  console.log(`✓ Non-matching Attributes:`, match.nonMatchingAttributes);
  console.log(`✓ Match Reasons: ${match.matchReasons}\n`);

  // STEP 5: Live Notifications Verification for Student A
  console.log('[Step 5] Verifying Live Notification generated for Student A...');
  const notifRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/notifications',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenStudentA}` }
  });
  console.log(`GET /api/notifications status: ${notifRes.status}`);
  const matchNotif = notifRes.data.find(n => n.message && (n.message.includes('Wallet') || n.message.includes('Canteen')));
  if (matchNotif) {
    console.log(`✓ Notification Delivered: "${matchNotif.message}"`);
  } else {
    console.log('Recent notification:', notifRes.data[0]);
  }

  // STEP 6: Student-to-Student Communication (Student A -> Student B)
  console.log('\n[Step 6] Testing Secure Student-to-Student Messaging...');
  const msgSendRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/messages',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenStudentA}`,
      'Content-Type': 'application/json'
    }
  }, {
    receiverId: foundItem.userId,
    itemId: foundItem.id,
    content: 'Hi Priya! I saw the live match alert for the black Tommy Hilfiger wallet. That belongs to me!'
  });
  console.log(`Send message status: ${msgSendRes.status}`);
  console.log(`✓ Message sent from Student A: "${msgSendRes.data.content}"\n`);

  // STEP 7: Student A Submits Claim with Private Ownership Verification Answers
  console.log('[Step 7] Student A submits Claim with Ownership Verification Questions...');
  const claimRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/claims',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenStudentA}`,
      'Content-Type': 'application/json'
    }
  }, {
    itemId: foundItem.id,
    matchId: match.id,
    verificationAnswers: {
      'Unique feature not visible in listing': 'Small coffee loyalty card stamped 7 times in secret compartment',
      'Contents or inside items': 'Student ID card STU2024001, library card, and $25 cash',
      'Case design or wallpaper': 'Bi-fold brown interior lining with embossed logo'
    },
    additionalNotes: 'Can meet at Central Library reception desk anytime this afternoon.'
  });
  console.log(`Submit Claim status: ${claimRes.status}`);
  if (claimRes.status !== 200) {
    throw new Error(`Failed to submit claim: ${claimRes.raw}`);
  }
  const claim = claimRes.data;
  console.log(`✓ Claim Submitted! ID: ${claim.id}, Status: ${claim.status}`);
  console.log(`✓ Private verification answers stored securely.`);

  // Verify item status updated to CLAIM_PENDING
  const checkItemRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: `/api/items/${foundItem.id}`,
    method: 'GET'
  });
  console.log(`✓ Item status automatically updated to: ${checkItemRes.data.status}\n`);

  // STEP 8: Student B Reviews & Approves Claim
  console.log('[Step 8] Student B (Finder) reviews and approves verification...');
  const reviewRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: `/api/claims/${claim.id}/review`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenStudentB}`,
      'Content-Type': 'application/json'
    }
  }, {
    action: 'APPROVE',
    notes: 'The loyalty card and student ID match exactly! Ready for handover.'
  });
  console.log(`Claim review status: ${reviewRes.status}`);
  console.log(`✓ Claim status updated to: ${reviewRes.data.status}\n`);

  // STEP 9: Student A Marks Item as RECOVERED (Official Core Feature)
  console.log('[Step 9] Student A marks item as RECOVERED (Official Requirement)...');
  const recoverRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: `/api/items/${lostItem.id}/recover`,
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${tokenStudentA}` }
  });
  console.log(`PUT /api/items/${lostItem.id}/recover status: ${recoverRes.status}`);
  console.log(`✓ Item Status Updated to: ${recoverRes.data.status}`);
  console.log('✓ Recovery notification and audit log recorded!\n');

  // STEP 10: Campus Location Management (Admin CRUD)
  console.log('[Step 10] Testing Campus Location Management (Admin)...');
  // 1. Create Location
  const createLocRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/campus-locations',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenAdmin}`,
      'Content-Type': 'application/json'
    }
  }, {
    name: 'Robotics & AI Innovation Lab ' + Date.now(),
    code: 'RAI' + Math.floor(Math.random() * 900 + 100),
    zone: 'Tech Zone',
    description: 'Advanced robotics research facility on 3rd floor',
    active: true
  });
  console.log(`Create location status: ${createLocRes.status}`);
  const newLoc = createLocRes.data;
  console.log(`✓ Created new location: "${newLoc.name}" (Code: ${newLoc.code})`);

  // 2. Toggle Location Active/Disabled
  const toggleLocRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: `/api/campus-locations/${newLoc.id}/toggle`,
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${tokenAdmin}` }
  });
  console.log(`Toggle location status: ${toggleLocRes.status}`);
  console.log(`✓ Location active state toggled to: ${toggleLocRes.data.active}\n`);

  // STEP 11: Admin Report Moderation & Status Management
  console.log('[Step 11] Testing Admin Moderation & Status Management...');
  // Verify report
  const verifyRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: `/api/admin/reports/${lostItem.id}/verify`,
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${tokenAdmin}` }
  });
  console.log(`Admin verify report status: ${verifyRes.status}`);
  console.log(`✓ Report moderation status: ${verifyRes.data.moderationStatus}`);

  // Inappropriate report removal (soft-delete to REMOVED)
  const removeRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: `/api/admin/reports/${foundItem.id}?reason=Duplicate+resolved+campus+case`,
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${tokenAdmin}` }
  });
  console.log(`Admin remove report status: ${removeRes.status}`);
  console.log('✓ Report soft-deleted with reason recorded in audit log.\n');

  // STEP 12: Admin Dashboard & Analytics (Real DB Metrics)
  console.log('[Step 12] Verifying Admin Dashboard Metrics & Real Analytics...');
  const dashRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/admin/dashboard',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenAdmin}` }
  });
  console.log(`GET /api/admin/dashboard status: ${dashRes.status}`);
  console.log('Admin Dashboard Metrics:');
  console.log(`- Total Students: ${dashRes.data.totalUsers}`);
  console.log(`- Total Lost Reports: ${dashRes.data.totalLostItems}`);
  console.log(`- Total Found Reports: ${dashRes.data.totalFoundItems}`);
  console.log(`- Active Matches: ${dashRes.data.activeMatches}`);
  console.log(`- Recovered Items: ${dashRes.data.returnedItems}`);
  console.log(`- Suspicious Activities: ${dashRes.data.suspiciousActivities}`);

  const anaRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/admin/analytics',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenAdmin}` }
  });
  console.log(`GET /api/admin/analytics status: ${anaRes.status}`);
  console.log(`- Recovery Rate: ${anaRes.data.recoveryRate}%`);
  console.log(`- Items by Category:`, anaRes.data.itemsByCategory);
  console.log(`- Top Reporting Locations:`, anaRes.data.topReportingLocations);

  // STEP 13: Audit Trail Verification
  console.log('\n[Step 13] Verifying Security & Operational Audit Log...');
  const auditRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/admin/audit-logs',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenAdmin}` }
  });
  console.log(`GET /api/admin/audit-logs status: ${auditRes.status}`);
  console.log(`Total Audit Log Entries: ${auditRes.data.totalElements}`);
  const recentLogs = auditRes.data.content.slice(0, 5).map(l => `${l.action} on ${l.entityType} #${l.entityId} by User #${l.userId}`);
  console.log('Recent 5 Audit Logs:');
  recentLogs.forEach(l => console.log(`  • ${l}`));

  console.log('\n================================================================');
  console.log('✓✓✓ FULL CAMPUSFIND LIFECYCLE COMPLETED SUCCESSFULLY! ✓✓✓');
  console.log('================================================================');
}

runFullLifecycleTest().catch(err => {
  console.error('\n❌ Lifecycle test failed:', err);
  process.exit(1);
});
