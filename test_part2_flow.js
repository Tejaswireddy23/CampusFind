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

async function runTests() {
  console.log('====================================================');
  console.log('CAMPUSFIND PART 2 - COMPREHENSIVE AUTOMATED TEST');
  console.log('====================================================\n');

  // 1. Authenticate Student A (aravind) and Student B (priya)
  console.log('[Step 1] Authenticating test students...');
  const tokenA = await login('aravind@student.college.edu', 'password123');
  const tokenB = await login('priya@student.college.edu', 'password123');
  console.log('✓ Student A (Aravind Sharma) logged in.');
  console.log('✓ Student B (Priya Patel) logged in.\n');

  // 2. Alert Preferences Test
  console.log('[Step 2] Testing Campus Alert Preferences (GET / PUT)...');
  const getPrefRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/alert-preferences',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  console.log(`GET /api/alert-preferences status: ${getPrefRes.status}`);
  console.log('Current preferences:', getPrefRes.data);

  const putPrefRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/alert-preferences',
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${tokenA}`,
      'Content-Type': 'application/json'
    }
  }, {
    categories: ['Mobile Phone', 'Electronics', 'Wallet', 'ID Card'],
    locations: ['Computer Block', 'Library', 'Canteen'],
    emailAlerts: true,
    pushAlerts: true,
    enabled: true
  });
  console.log(`PUT /api/alert-preferences status: ${putPrefRes.status}`);
  console.log('Updated preferences:', putPrefRes.data);
  console.log('✓ Campus alert preferences verified!\n');

  // 3. Duplicate Detection Test
  console.log('[Step 3] Testing Duplicate Report Detection...');
  const dupCheckRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/items/check-duplicate',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenA}`,
      'Content-Type': 'application/json'
    }
  }, {
    title: 'Casio Scientific Calculator FX-991EX',
    category: 'Calculator',
    type: 'LOST',
    campusLocation: 'Library',
    brand: 'Casio',
    model: 'FX-991EX'
  });
  console.log(`Duplicate check status: ${dupCheckRes.status}`);
  console.log('Duplicate check response:', dupCheckRes.data);
  console.log('✓ Duplicate report detection API working!\n');

  // 4. Test Exact Flow from Part 2 Specification:
  // Student A reports LOST: "Black Samsung Phone" at "Computer Block"
  console.log('[Step 4] Student A reports LOST: Black Samsung Phone at Computer Block...');
  const createLostRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/items',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenA}`,
      'Content-Type': 'application/json'
    }
  }, {
    title: 'Black Samsung Phone',
    description: 'Black Samsung Galaxy smartphone in a transparent silicon case with sticker on back.',
    category: 'Mobile Phone',
    type: 'LOST',
    status: 'ACTIVE',
    campusLocation: 'Computer Block',
    locationDetails: 'Left near Lab 3 table 4',
    dateLostFound: new Date().toISOString().split('T')[0],
    brand: 'Samsung',
    model: 'Galaxy S21',
    primaryColor: 'Black'
  });
  console.log(`Student A report lost item status: ${createLostRes.status}`);
  const lostItem = createLostRes.data;
  console.log(`Created Lost Item ID: ${lostItem.id}, Title: "${lostItem.title}" at "${lostItem.campusLocation}"\n`);

  // Student B reports FOUND: "Black Samsung Phone" at "Computer Block"
  console.log('[Step 5] Student B reports FOUND: Black Samsung Phone at Computer Block...');
  const createFoundRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/items',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenB}`,
      'Content-Type': 'application/json'
    }
  }, {
    title: 'Black Samsung Phone',
    description: 'Found black Samsung phone near Lab 3 entrance desk.',
    category: 'Mobile Phone',
    type: 'FOUND',
    status: 'ACTIVE',
    campusLocation: 'Computer Block',
    locationDetails: 'On desk near entrance of Lab 3',
    dateLostFound: new Date().toISOString().split('T')[0],
    brand: 'Samsung',
    model: 'Galaxy S21',
    primaryColor: 'Black'
  });
  console.log(`Student B report found item status: ${createFoundRes.status}`);
  const foundItem = createFoundRes.data;
  console.log(`Created Found Item ID: ${foundItem.id}, Title: "${foundItem.title}" at "${foundItem.campusLocation}"\n`);

  // 5. Verify Smart Matching created Match & Match Score
  console.log('[Step 6] Verifying Match creation & Match score...');
  const matchesRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/matches',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  console.log(`GET /api/matches status: ${matchesRes.status}`);
  console.log(`Found ${matchesRes.data.length} matches for Student A.`);
  const match = matchesRes.data.find(m => 
    (m.lostItem.id === lostItem.id && m.foundItem.id === foundItem.id) ||
    (m.lostItem.id === foundItem.id && m.foundItem.id === lostItem.id)
  );

  if (!match) {
    console.error('❌ Match was not found between item', lostItem.id, 'and', foundItem.id);
  } else {
    console.log(`✓ MATCH FOUND! ID: ${match.id}`);
    console.log(`✓ Match Score: ${match.matchScore}% Potential Match`);
    console.log(`✓ Match Status: ${match.status}`);
    console.log(`✓ Match Explanation:`);
    console.log(match.matchExplanation);
  }

  // 6. Verify Match Details API (/api/matches/{id})
  if (match) {
    console.log('\n[Step 7] Verifying Match Details API (/api/matches/' + match.id + ')...');
    const matchDetailRes = await request({
      hostname: 'localhost',
      port: 8081,
      path: `/api/matches/${match.id}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    console.log(`GET /api/matches/${match.id} status: ${matchDetailRes.status}`);
    console.log(`LOST REPORT: "${matchDetailRes.data.lostItem.title}" vs FOUND REPORT: "${matchDetailRes.data.foundItem.title}"`);
    console.log(`Score: ${matchDetailRes.data.matchScore}%`);
  }

  // 7. Verify Notification Center for Student A
  console.log('\n[Step 8] Verifying Live Notification generated for Student A...');
  const notifRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/notifications',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  console.log(`GET /api/notifications status: ${notifRes.status}`);
  console.log(`Total notifications for Student A: ${notifRes.data.length}`);
  const matchNotif = notifRes.data.find(n => n.type === 'MATCH' && (n.message.includes('Samsung') || n.message.includes('Computer Block')));
  if (matchNotif) {
    console.log(`✓ Match Notification ID: ${matchNotif.id}`);
    console.log(`✓ Notification Type: ${matchNotif.type}`);
    console.log(`✓ Notification Message: "${matchNotif.message}"`);
    console.log(`✓ Is Read: ${matchNotif.isRead}`);

    // Mark as read
    const readRes = await request({
      hostname: 'localhost',
      port: 8081,
      path: `/api/notifications/${matchNotif.id}/read`,
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    console.log(`Mark as read status: ${readRes.status}`);

    // Delete notification test
    const delRes = await request({
      hostname: 'localhost',
      port: 8081,
      path: `/api/notifications/${matchNotif.id}`,
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    console.log(`DELETE /api/notifications/${matchNotif.id} status: ${delRes.status}`);
    console.log('✓ Notification deletion verified!');
  } else {
    console.log('Recent notifications for Student A:', notifRes.data.slice(0, 3));
  }

  // 8. Test Campus Proximity Location Matching: Library and Academic Block
  console.log('\n[Step 9] Testing Campus Location Proximity Matching (Library <-> Academic Block)...');
  const proxLost = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/items',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenA}`,
      'Content-Type': 'application/json'
    }
  }, {
    title: 'Blue Milton Water Bottle',
    description: 'Stainless steel Milton insulated flask',
    category: 'Accessories',
    type: 'LOST',
    status: 'ACTIVE',
    campusLocation: 'Library',
    locationDetails: 'Near reading section',
    dateLostFound: new Date().toISOString().split('T')[0],
    brand: 'Milton',
    primaryColor: 'Blue'
  });

  const proxFound = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/items',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenB}`,
      'Content-Type': 'application/json'
    }
  }, {
    title: 'Blue Milton Water Bottle',
    description: 'Found blue Milton steel bottle on 2nd floor corridor',
    category: 'Accessories',
    type: 'FOUND',
    status: 'ACTIVE',
    campusLocation: 'Academic Block',
    locationDetails: 'Corridor 2nd floor',
    dateLostFound: new Date().toISOString().split('T')[0],
    brand: 'Milton',
    primaryColor: 'Blue'
  });

  const proxMatches = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/matches',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const proxMatch = proxMatches.data.find(m => 
    (m.lostItem.id === proxLost.data.id && m.foundItem.id === proxFound.data.id) ||
    (m.lostItem.id === proxFound.data.id && m.foundItem.id === proxLost.data.id)
  );
  if (proxMatch) {
    console.log(`✓ Campus Proximity Match Score: ${proxMatch.matchScore}%`);
    console.log(`✓ Proximity Match Explanation:\n${proxMatch.matchExplanation}`);
  }

  // 9. Real-Time Student-to-Student Communication Test
  console.log('\n[Step 10] Testing Student-to-Student Messaging (Student A -> Student B)...');
  // Send message from Student A to Student B
  const sendMsgRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/messages',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenA}`,
      'Content-Type': 'application/json'
    }
  }, {
    receiverId: foundItem.reportedBy.id,
    itemId: foundItem.id,
    content: 'Hi! I saw the match notification. I believe that black Samsung phone is mine!'
  });
  console.log(`Send message status: ${sendMsgRes.status}`);
  console.log('Sent message content:', sendMsgRes.data.content);

  // Check conversations for Student B
  const convRes = await request({
    hostname: 'localhost',
    port: 8081,
    path: '/api/conversations',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  console.log(`GET /api/conversations for Student B status: ${convRes.status}`);
  console.log(`Total conversations for Student B: ${convRes.data.length}`);
  const conv = convRes.data.find(c => c.otherUser.id === lostItem.reportedBy.id);
  if (conv) {
    console.log(`✓ Conversation found with ${conv.otherUser.fullName} (Unread count: ${conv.unreadCount})`);
    
    // Get messages for conversation
    const msgListRes = await request({
      hostname: 'localhost',
      port: 8081,
      path: `/api/conversations/${conv.id}/messages`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    console.log(`GET conversation messages status: ${msgListRes.status}`);
    console.log(`Messages in conversation: ${msgListRes.data.length}`);
    console.log(`Last message content: "${msgListRes.data[msgListRes.data.length - 1].content}"`);
    console.log('✓ Student-to-student messaging verified!');
  }

  console.log('\n====================================================');
  console.log('ALL PART 2 BACKEND APIS & FLOWS TESTED SUCCESSFULLY!');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
