import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (first 10 chars):', supabaseKey.substring(0, 10) + '...');

async function testConnection() {
  try {
    // Test the connection by querying the documents table using the REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/documents?select=id,content&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (!response.ok) {
      console.error('Error querying Supabase:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    } else {
      const data = await response.json();
      console.log('Successfully connected to Supabase!');
      console.log('Data:', data);
    }
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
  }
}

testConnection();
