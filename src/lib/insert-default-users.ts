
import { supabase } from '@/integrations/supabase/client';

export const insertDefaultUsers = async () => {
  try {
    console.log('Checking if default users exist in database...');
    
    // Check if users already exist
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('email')
      .in('email', ['admin@kycverification.com', 'rajesh@kycverification.com']);

    if (checkError) {
      console.log('Error checking users, table might not exist:', checkError);
      return;
    }

    const existingEmails = existingUsers?.map(u => u.email) || [];
    
    // Insert admin user if doesn't exist
    if (!existingEmails.includes('admin@kycverification.com')) {
      console.log('Inserting admin user...');
      const { error: adminError } = await supabase
        .from('users')
        .insert({
          id: 'admin-1',
          name: 'Admin User',
          role: 'admin',
          email: 'admin@kycverification.com',
          phone: '9876543210',
          district: 'Bangalore Urban',
          password: 'password',
          status: 'active'
        });

      if (adminError) {
        console.error('Error inserting admin user:', adminError);
      } else {
        console.log('Admin user inserted successfully');
      }
    }

    // Insert agent user if doesn't exist  
    if (!existingEmails.includes('rajesh@kycverification.com')) {
      console.log('Inserting agent user...');
      const { error: agentError } = await supabase
        .from('users')
        .insert({
          id: 'agent-1',
          name: 'Rajesh Kumar',
          role: 'agent',
          email: 'rajesh@kycverification.com',
          phone: '9876543211',
          district: 'Bangalore Urban',
          password: 'password',
          status: 'active'
        });

      if (agentError) {
        console.error('Error inserting agent user:', agentError);
      } else {
        console.log('Agent user inserted successfully');
      }
    }

    console.log('Default users setup completed');
  } catch (error) {
    console.error('Error setting up default users:', error);
  }
};
