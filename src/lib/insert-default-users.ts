
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/utils/mockData';

export const insertDefaultUsers = async () => {
  try {
    console.log('Checking and inserting default users...');
    
    // Check if users already exist in database
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('*');

    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      // Fall back to localStorage setup
      setupLocalStorageUsers();
      return;
    }

    // If no users exist in database, insert defaults
    if (!existingUsers || existingUsers.length === 0) {
      console.log('No users found in database, inserting defaults...');
      
      const defaultUsers: User[] = [
        {
          id: 'admin-1',
          name: 'Admin User',
          role: 'admin',
          email: 'admin@kycverification.com',
          phone: '+91-9876543210',
          district: 'Bangalore Urban',
          status: 'active',
          state: 'Karnataka',
          city: 'Bangalore',
          baseLocation: 'Bangalore',
          maxTravelDistance: 50,
          extraChargePerKm: 10,
          profilePicture: null,
          totalVerifications: 0,
          completionRate: 100,
          password: 'password'
        },
        {
          id: 'agent-1',
          name: 'Rajesh Kumar',
          role: 'agent',
          email: 'rajesh@kycverification.com',
          phone: '+91-9876543211',
          district: 'Bangalore Urban',
          status: 'active',
          state: 'Karnataka',
          city: 'Bangalore',
          baseLocation: 'Bangalore',
          maxTravelDistance: 30,
          extraChargePerKm: 8,
          profilePicture: null,
          totalVerifications: 25,
          completionRate: 95,
          password: 'password'
        },
        {
          id: 'tvt-1',
          name: 'Atul Sharma',
          role: 'tvtteam',
          email: 'atul@gmail.com',
          phone: '+91-9876543212',
          district: 'Delhi',
          status: 'active',
          state: 'Delhi',
          city: 'New Delhi',
          baseLocation: 'Delhi',
          maxTravelDistance: 25,
          extraChargePerKm: 12,
          profilePicture: null,
          totalVerifications: 15,
          completionRate: 98,
          password: '123456'
        }
      ];

      // Insert users into database
      const { error: insertError } = await supabase
        .from('users')
        .insert(defaultUsers.map(user => ({
          id: user.id,
          name: user.name,
          role: user.role,
          email: user.email,
          phone: user.phone,
          district: user.district,
          status: user.status,
          state: user.state,
          city: user.city,
          base_location: user.baseLocation,
          max_travel_distance: user.maxTravelDistance,
          extra_charge_per_km: user.extraChargePerKm,
          profile_picture: user.profilePicture,
          total_verifications: user.totalVerifications,
          completion_rate: user.completionRate,
          password: user.password
        })));

      if (insertError) {
        console.error('Error inserting default users:', insertError);
        setupLocalStorageUsers();
      } else {
        console.log('Default users inserted successfully');
        // Also save to localStorage as backup
        setupLocalStorageUsers();
      }
    } else {
      console.log('Users already exist in database');
      // Ensure Atul user exists
      const atulExists = existingUsers.some(user => user.email === 'atul@gmail.com');
      if (!atulExists) {
        console.log('Adding Atul user...');
        const atulUser = {
          id: 'tvt-1',
          name: 'Atul Sharma',
          role: 'tvtteam',
          email: 'atul@gmail.com',
          phone: '+91-9876543212',
          district: 'Delhi',
          status: 'active',
          state: 'Delhi',
          city: 'New Delhi',
          base_location: 'Delhi',
          max_travel_distance: 25,
          extra_charge_per_km: 12,
          profile_picture: null,
          total_verifications: 15,
          completion_rate: 98,
          password: '123456'
        };

        const { error } = await supabase
          .from('users')
          .insert([atulUser]);

        if (error) {
          console.error('Error inserting Atul user:', error);
        } else {
          console.log('Atul user added successfully');
        }
      }
      
      // Update localStorage with database users
      const transformedUsers = existingUsers.map(user => ({
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone || '',
        district: user.district || '',
        status: user.status || 'active',
        state: user.state,
        city: user.city,
        baseLocation: user.base_location,
        maxTravelDistance: user.max_travel_distance,
        extraChargePerKm: user.extra_charge_per_km,
        profilePicture: user.profile_picture,
        totalVerifications: user.total_verifications || 0,
        completionRate: user.completion_rate || 0,
        password: user.password
      }));
      localStorage.setItem('mockUsers', JSON.stringify(transformedUsers));
    }
  } catch (error) {
    console.error('Error in insertDefaultUsers:', error);
    setupLocalStorageUsers();
  }
};

const setupLocalStorageUsers = () => {
  console.log('Setting up localStorage users...');
  const defaultUsers: User[] = [
    {
      id: 'admin-1',
      name: 'Admin User',
      role: 'admin',
      email: 'admin@kycverification.com',
      phone: '+91-9876543210',
      district: 'Bangalore Urban',
      status: 'active',
      state: 'Karnataka',
      city: 'Bangalore',
      baseLocation: 'Bangalore',
      maxTravelDistance: 50,
      extraChargePerKm: 10,
      profilePicture: null,
      totalVerifications: 0,
      completionRate: 100,
      password: 'password'
    },
    {
      id: 'agent-1',
      name: 'Rajesh Kumar',
      role: 'agent',
      email: 'rajesh@kycverification.com',
      phone: '+91-9876543211',
      district: 'Bangalore Urban',
      status: 'active',
      state: 'Karnataka',
      city: 'Bangalore',
      baseLocation: 'Bangalore',
      maxTravelDistance: 30,
      extraChargePerKm: 8,
      profilePicture: null,
      totalVerifications: 25,
      completionRate: 95,
      password: 'password'
    },
    {
      id: 'tvt-1',
      name: 'Atul Sharma',
      role: 'tvtteam',
      email: 'atul@gmail.com',
      phone: '+91-9876543212',
      district: 'Delhi',
      status: 'active',
      state: 'Delhi',
      city: 'New Delhi',
      baseLocation: 'Delhi',
      maxTravelDistance: 25,
      extraChargePerKm: 12,
      profilePicture: null,
      totalVerifications: 15,
      completionRate: 98,
      password: '123456'
    }
  ];

  localStorage.setItem('mockUsers', JSON.stringify(defaultUsers));
  console.log('Default users set up in localStorage');
};
