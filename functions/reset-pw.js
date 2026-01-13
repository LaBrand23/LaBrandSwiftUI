const admin = require('firebase-admin');
const { applicationDefault } = require('firebase-admin/app');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: applicationDefault(),
    projectId: 'labrand-ef645'
  });
}

admin.auth().getUserByEmail('brandmanager@test.com')
  .then(user => {
    console.log('Found user:', user.uid);
    return admin.auth().updateUser(user.uid, { password: 'Test123456' });
  })
  .then(() => {
    console.log('Password reset to: Test123456');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
