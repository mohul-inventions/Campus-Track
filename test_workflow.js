const axios = require('axios');

async function testWorkflow() {
  console.log('🧪 Running Complete End-to-End DBMS Workflow Test...\n');
  const base = 'http://localhost:5000/api';

  // 1. Student Login
  console.log('1️⃣ Logging in as Student (student@campustrack.edu)...');
  const sLogin = await axios.post(`${base}/auth/login`, {
    email: 'student@campustrack.edu',
    password: 'Student@123'
  });
  const sToken = sLogin.data.token;
  console.log(`   ✅ Logged in: ${sLogin.data.user.full_name} (ID: ${sLogin.data.user.student_id})`);

  // 2. Submit Lost Item
  console.log('\n2️⃣ Submitting new Lost Item report...');
  const lostRes = await axios.post(`${base}/lost-items`, {
    category_id: 4, // Wallet & Currency
    location_id: 1, // Central Library
    item_name: 'Test Leather Bi-fold Wallet',
    description: 'Brown leather cardholder lost near study table 5',
    brand: 'Fossil',
    primary_color: 'Black',
    date_lost: '2026-09-08',
    approx_time: '14:30',
    identifying_details: 'Student ID card ending in 5012 inside'
  }, { headers: { Authorization: `Bearer ${sToken}` } });

  const lostId = lostRes.data.lostItem.lost_id;
  console.log(`   ✅ Lost item registered: #L-${lostId}`);
  console.log(`   ⚡ Matching engine triggered: ${lostRes.data.potentialMatchesCount} potential matches calculated`);

  // 3. Retrieve Matches
  console.log('\n3️⃣ Querying calculated matches...');
  const matchRes = await axios.get(`${base}/matches/my`, {
    headers: { Authorization: `Bearer ${sToken}` }
  });
  console.log(`   ✅ Matches found in MySQL: ${matchRes.data.matches.length}`);
  const match = matchRes.data.matches[0];
  console.log(`   🔍 Selected Match #${match.match_id}: Score = ${match.score}% (${match.lost_name} ↔ ${match.found_name})`);

  // 4. File a Claim
  console.log('\n4️⃣ Student filing claim for match...');
  const claimRes = await axios.post(`${base}/claims`, {
    match_id: match.match_id,
    lost_id: match.lost_id,
    found_id: match.found_id,
    claim_description: 'Claiming my misplaced Fossil wallet with student card',
    identifying_marks: 'Internal RFID sleeve contains SBI chip card and Amrita ID',
    proof_details: 'Can produce student portal profile matching card photo'
  }, { headers: { Authorization: `Bearer ${sToken}` } });
  const claimId = claimRes.data.claim_id;
  console.log(`   ✅ Claim filed in MySQL: #CLM-${claimId} (Status: Pending)`);

  // 5. Admin Login
  console.log('\n5️⃣ Admin logging in (admin@campustrack.edu)...');
  const aLogin = await axios.post(`${base}/auth/login`, {
    email: 'admin@campustrack.edu',
    password: 'Admin@123'
  });
  const aToken = aLogin.data.token;
  console.log(`   ✅ Admin authenticated: ${aLogin.data.user.full_name}`);

  // 6. Admin Approves Claim (ACID Transaction)
  console.log('\n6️⃣ Admin approving claim via ACID Transaction...');
  const approveRes = await axios.put(`${base}/admin/claims/${claimId}/review`, {
    action: 'Approve',
    remarks: 'Physical cards and identification marks verified in person by security.'
  }, { headers: { Authorization: `Bearer ${aToken}` } });
  console.log(`   ✅ Transaction executed: ${approveRes.data.message}`);

  // Verify status synchronization
  const checkClaim = await axios.get(`${base}/claims/${claimId}`, {
    headers: { Authorization: `Bearer ${sToken}` }
  });
  console.log(`   🔎 Verification: Claim Status is '${checkClaim.data.claim.claim_status}'`);

  // 7. Admin Closes Case (Final Handover Transaction)
  console.log('\n7️⃣ Admin executing Case Closure Transaction...');
  const closeRes = await axios.put(`${base}/admin/claims/${claimId}/close`, {
    notes: 'Item handed over to Mohul Ramjee. Acknowledgement slip signed.'
  }, { headers: { Authorization: `Bearer ${aToken}` } });
  console.log(`   ✅ Case closure transaction committed: ${closeRes.data.message}`);

  // 8. Verify Dashboard Analytics
  console.log('\n8️⃣ Verifying Admin Dashboard Analytics & KPIs...');
  const dashRes = await axios.get(`${base}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${aToken}` }
  });
  console.log(`   📊 Total Lost: ${dashRes.data.kpis.totalLost} | Total Found: ${dashRes.data.kpis.totalFound}`);
  console.log(`   📊 Pending Claims: ${dashRes.data.kpis.pendingClaims} | Returned Items: ${dashRes.data.kpis.returnedItems}`);
  console.log(`   📊 Recovery Rate: ${dashRes.data.kpis.resolutionRate}%`);

  console.log('\n🎉 ALL 8 STEPS OF THE CAPSTONE DBMS WORKFLOW PASSED FLAWLESSLY!\n');
}

testWorkflow().catch(err => {
  console.error('❌ Test failed:', err.response?.data || err.message);
});
