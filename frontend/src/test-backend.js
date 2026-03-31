// Simple test to check backend connection
const testBackendConnection = async () => {
  console.log('Testing backend connection...');
  
  try {
    // Test basic API call
    const response = await fetch('http://localhost/Tabolator_Casestudy/backend/api/categories');
    const data = await response.json();
    
    console.log('Backend test results:');
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    console.log('Headers:', response.headers);
    
    if (response.ok && data.success) {
      console.log('✅ Backend is working!');
      console.log('Categories found:', data.data?.length || 0);
    } else {
      console.log('❌ Backend connection failed');
      console.log('Error message:', data.message || 'Unknown error');
    }
    
  } catch (error) {
    console.error('❌ Network error:', error);
    console.log('Possible issues:');
    console.log('1. XAMPP Apache is not running');
    console.log('2. XAMPP MySQL is not running');
    console.log('3. Backend PHP files are missing');
    console.log('4. Database is not set up');
    console.log('5. CORS issues');
  }
};

// Auto-run test
testBackendConnection();

export default testBackendConnection;
