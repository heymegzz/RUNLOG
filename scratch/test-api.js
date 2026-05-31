
const API_URL = 'http://localhost:5005/api';

async function runTests() {
  console.log('🧪 Starting API Verification Tests...\n');

  try {
    // 1. Register User
    console.log('➡️ 1. Registering a new user...');
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
      }),
    });
    const registerData = await registerRes.json();
    if (!registerRes.ok) throw new Error(registerData.message);
    
    const token = registerData.data.accessToken;
    const workspaceId = registerData.data.user.activeWorkspace;
    console.log('✅ Success! User created.');
    console.log('   - Assigned Token:', token.substring(0, 20) + '...');
    console.log('   - Auto-created Workspace ID:', workspaceId);

    // 2. Fetch Workspaces (Auth test)
    console.log('\n➡️ 2. Fetching workspaces for the user...');
    const workspacesRes = await fetch(`${API_URL}/workspaces`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const workspacesData = await workspacesRes.json();
    if (!workspacesRes.ok) throw new Error(workspacesData.message);
    
    console.log('✅ Success! Retrieved workspaces:');
    console.log('   - Workspace Name:', workspacesData.data[0].name);
    console.log('   - Your Role:', workspacesData.data[0].role);

    // 3. Create a new workspace
    console.log('\n➡️ 3. Creating an additional workspace...');
    const createWsRes = await fetch(`${API_URL}/workspaces`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ name: 'Secondary Workspace' }),
    });
    const createWsData = await createWsRes.json();
    if (!createWsRes.ok) throw new Error(createWsData.message);
    
    const newWsId = createWsData.data._id;
    console.log('✅ Success! Secondary workspace created.');
    console.log('   - New Workspace ID:', newWsId);

    // 4. Test RBAC (List members of the new workspace)
    console.log('\n➡️ 4. Testing RBAC middleware (List Members)...');
    const membersRes = await fetch(`${API_URL}/workspaces/${newWsId}/members`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'x-workspace-id': newWsId
      },
    });
    const membersData = await membersRes.json();
    if (!membersRes.ok) throw new Error(membersData.message);
    
    console.log('✅ Success! Members listed (protected route).');
    console.log('   - Members Count:', membersData.data.length);
    console.log('   - Member Role:', membersData.data[0].role);

    console.log('\n🎉 ALL TESTS PASSED! Phases 1 & 2 are working perfectly.');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    console.log('Make sure your server is running and the database connection is valid.');
  }
}

runTests();
