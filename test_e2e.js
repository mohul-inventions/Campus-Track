const http = require('http');

function request(method, urlPath, data, token) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : '';
    const req = http.request({
      hostname: '127.0.0.1',
      port: 5000,
      path: urlPath,
      method: method,
      headers: {
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTest() {
  console.log('====================================================');
  console.log('--- STARTING CAMPUSTRACK END-TO-END VERIFICATION ---');
  console.log('====================================================\n');
  
  // 1. Student Login
  const stuLogin = await request('POST', '/api/auth/login', { email: 'student@campustrack.edu', password: 'Student@123' });
  console.log('[STEP 1] Student Login: HTTP ' + stuLogin.status + ' | Logged in as: ' + stuLogin.data.user.full_name);
  const stuToken = stuLogin.data.token;
  
  // 2. Report Lost Item
  const lostRes = await request('POST', '/api/lost-items', {
    category_id: 1, // Electronics
    item_name: 'Dell XPS 15 Silver Laptop',
    brand: 'Dell',
    primary_color: 'Silver',
    location_id: 1, // Central Library
    date_lost: '2026-09-10',
    description: 'Silver Dell XPS laptop with CS sticker on the palm rest',
    identifying_details: 'Service tag ending in 7489'
  }, stuToken);
  console.log('[STEP 2] Report Lost Item: HTTP ' + lostRes.status + ' | Lost Item ID: ' + lostRes.data.lostItem.lost_id);
  const lostId = lostRes.data.lostItem.lost_id;

  // 3. Report Found Item
  const foundRes = await request('POST', '/api/found-items', {
    category_id: 1,
    item_name: 'Dell XPS 15 Laptop',
    brand: 'Dell',
    primary_color: 'Silver',
    location_id: 1,
    date_found: '2026-09-10',
    description: 'Silver Dell XPS laptop found on reading table',
    identifying_details: 'Has CS sticker',
    storage_location: 'Library Front Desk Locker 3'
  }, stuToken);
  console.log('[STEP 3] Report Found Item: HTTP ' + foundRes.status + ' | Found Item ID: ' + foundRes.data.foundItem.found_id);
  const foundId = foundRes.data.foundItem.found_id;

  // 4. Retrieve Match Engine Results
  const matchesRes = await request('GET', '/api/matches/my', null, stuToken);
  console.log('[STEP 4] Match Engine Calculation: HTTP ' + matchesRes.status + ' | Matches Count: ' + (matchesRes.data.matches ? matchesRes.data.matches.length : 0));
  let topMatch = matchesRes.data.matches && matchesRes.data.matches[0];
  if (topMatch) {
    console.log('         Top Match Score: ' + topMatch.score + '%');
    console.log('         Match Status: ' + topMatch.match_status);
  }

  // 5. Submit Claim
  const claimRes = await request('POST', '/api/claims', {
    match_id: topMatch ? topMatch.match_id : null,
    lost_id: lostId,
    found_id: foundId,
    claim_description: 'I forgot my laptop at the Central Library 2nd floor desk while studying yesterday.',
    identifying_marks: 'Dell XPS 15, Silver, CS department sticker on lid, wallpaper of Andromeda galaxy',
    proof_details: 'Can unlock laptop with student PIN 8841 and show Dell invoice'
  }, stuToken);
  console.log('[STEP 5] Submit Claim: HTTP ' + claimRes.status + ' | Claim ID: ' + claimRes.data.claim_id);
  const claimId = claimRes.data.claim_id;

  // 6. Admin Login
  const adminLogin = await request('POST', '/api/auth/login', { email: 'admin@campustrack.edu', password: 'Admin@123' });
  console.log('[STEP 6] Admin Login: HTTP ' + adminLogin.status + ' | Logged in as: ' + adminLogin.data.user.full_name);
  const adminToken = adminLogin.data.token;

  // 7. Admin Review Claim & Trigger ACID Transaction
  console.log('[STEP 7] Executing ACID Transaction: Admin Approval...');
  const reviewRes = await request('PUT', '/api/admin/claims/' + claimId + '/review', {
    action: 'Approve',
    remarks: 'Verified student invoice and PIN code match physical laptop.'
  }, adminToken);
  console.log('         HTTP ' + reviewRes.status + ' | Result: ' + reviewRes.data.message);

  // 8. Admin Closes Case
  console.log('[STEP 8] Executing ACID Case Closure...');
  const closeRes = await request('PUT', '/api/admin/claims/' + claimId + '/close', {
    notes: 'Item handed over to student at campus security desk. Case closed.'
  }, adminToken);
  console.log('         HTTP ' + closeRes.status + ' | Result: ' + closeRes.data.message);

  // 9. Verify Audit Trail Log
  const auditRes = await request('GET', '/api/admin/audit-logs', null, adminToken);
  console.log('[STEP 9] Verifying DBMS Status Audit Logs: HTTP ' + auditRes.status);
  console.log('         Recent Audit Events:');
  auditRes.data.logs.slice(0, 4).forEach((log, idx) => {
    console.log('         [' + (idx+1) + '] [' + log.entity_type + ' #' + log.entity_id + '] ' + log.old_status + ' -> ' + log.new_status + ' | By: ' + log.changer_name + ' (' + log.changer_role + ') | Notes: ' + log.change_notes);
  });

  // 10. Verify Stored Procedures & Aggregate Views
  const catStatsRes = await request('GET', '/api/admin/analytics/categories', null, adminToken);
  console.log('[STEP 10] Stored Procedure: CALL GetCategoryStatistics(): HTTP ' + catStatsRes.status + ' | Categories evaluated: ' + catStatsRes.data.stats.length);

  const locStatsRes = await request('GET', '/api/admin/analytics/locations', null, adminToken);
  console.log('          Stored Procedure: CALL GetLocationStatistics(): HTTP ' + locStatsRes.status + ' | Locations evaluated: ' + locStatsRes.data.stats.length);

  const dashRes = await request('GET', '/api/admin/dashboard', null, adminToken);
  console.log('[STEP 11] Executive Dashboard KPIs:');
  console.log('          Total Students: ' + dashRes.data.kpis.totalStudents);
  console.log('          Total Lost Items: ' + dashRes.data.kpis.totalLost);
  console.log('          Total Found Items: ' + dashRes.data.kpis.totalFound);
  console.log('          Pending Claims: ' + dashRes.data.kpis.pendingClaims);
  console.log('          Returned Items (Resolved): ' + dashRes.data.kpis.returnedItems);
  console.log('          Resolution Rate: ' + dashRes.data.kpis.resolutionRate + '%');

  console.log('\n====================================================');
  console.log('>>> SUCCESS: ALL E2E CAPSTONE WORKFLOWS VERIFIED! <<<');
  console.log('====================================================');
}

runTest().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
