// This is a dummy API to simulate authentication functionality
// In a real app, you would replace this with actual API calls

// Simulated delay to mimic network request
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Sample users database
const users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '9876543210',
    password: 'password123',
    photo: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '9876543211',
    password: 'password123',
    photo: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
];

/**
 * Enhanced loginWithGoogle function to better simulate Google authentication
 */
const loginWithGoogle = async (googleData) => {
  return new Promise((resolve, reject) => {
    // Simulating API call with delay
    setTimeout(() => {
      try {
        // Check if this Google account already exists in our mock database
        const existingUser = users.find(user => 
          user.email === googleData.email && user.googleId
        );
        
        if (existingUser) {
          // User exists, return the user with a token
          resolve({
            user: {
              id: existingUser.id,
              name: existingUser.name,
              email: existingUser.email,
              phone: existingUser.phone,
              profilePic: existingUser.profilePic || googleData.photo,
              googleId: existingUser.googleId
            },
            token: generateToken(existingUser.id)
          });
        } else {
          // Create a new user with Google data
          const newUser = {
            id: users.length + 1,
            name: googleData.name,
            email: googleData.email,
            phone: "",
            password: "", // No password for social login
            profilePic: googleData.photo,
            googleId: `google_${Date.now()}`, // Simulate a Google ID
            createdAt: new Date().toISOString()
          };
          
          // Add to our user database
          users.push(newUser);
          
          // Return the newly created user with a token
          resolve({
            user: {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              phone: newUser.phone,
              profilePic: newUser.profilePic,
              googleId: newUser.googleId
            },
            token: generateToken(newUser.id)
          });
        }
      } catch (error) {
        reject({ message: "Failed to authenticate with Google" });
      }
    }, 1000);
  });
};

/**
 * Implementation for Facebook login
 */
const loginWithFacebook = async (facebookData) => {
  return new Promise((resolve, reject) => {
    // Simulating API call with delay
    setTimeout(() => {
      try {
        // Check if this Facebook account already exists
        const existingUser = users.find(user => 
          (user.email === facebookData.email && user.facebookId) || 
          user.facebookId === facebookData.id
        );
        
        if (existingUser) {
          // User exists, return the user with a token
          resolve({
            user: {
              id: existingUser.id,
              name: existingUser.name,
              email: existingUser.email,
              phone: existingUser.phone,
              profilePic: existingUser.profilePic || facebookData.picture?.data?.url,
              facebookId: existingUser.facebookId
            },
            token: generateToken(existingUser.id)
          });
        } else {
          // Create a new user with Facebook data
          const newUser = {
            id: users.length + 1,
            name: facebookData.name,
            email: facebookData.email || `fb_${Date.now()}@facebook.com`, // Some FB users might not have email
            phone: "",
            password: "", // No password for social login
            profilePic: facebookData.picture?.data?.url || "",
            facebookId: facebookData.id || `fb_${Date.now()}`,
            createdAt: new Date().toISOString()
          };
          
          // Add to our user database
          users.push(newUser);
          
          // Return the newly created user with a token
          resolve({
            user: {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              phone: newUser.phone,
              profilePic: newUser.profilePic,
              facebookId: newUser.facebookId
            },
            token: generateToken(newUser.id)
          });
        }
      } catch (error) {
        reject({ message: "Failed to authenticate with Facebook" });
      }
    }, 1000);
  });
};

/**
 * Implementation for Apple login
 */
const loginWithApple = async (appleData) => {
  return new Promise((resolve, reject) => {
    // Simulating API call with delay
    setTimeout(() => {
      try {
        // Apple sign in might not provide email on subsequent logins
        // So we'll check by Apple ID
        const existingUser = users.find(user => 
          user.appleId === appleData.identityToken || 
          (appleData.email && user.email === appleData.email && user.appleId)
        );
        
        if (existingUser) {
          // User exists, return the user with a token
          resolve({
            user: {
              id: existingUser.id,
              name: existingUser.name,
              email: existingUser.email,
              phone: existingUser.phone,
              profilePic: existingUser.profilePic,
              appleId: existingUser.appleId
            },
            token: generateToken(existingUser.id)
          });
        } else {
          // Create a new user with Apple data
          const newUser = {
            id: users.length + 1,
            name: appleData.fullName?.givenName && appleData.fullName?.familyName ? 
                  `${appleData.fullName.givenName} ${appleData.fullName.familyName}` : 
                  "Apple User",
            email: appleData.email || `apple_${Date.now()}@privaterelay.appleid.com`,
            phone: "",
            password: "", // No password for social login
            profilePic: "",
            appleId: appleData.identityToken || `apple_${Date.now()}`,
            createdAt: new Date().toISOString()
          };
          
          // Add to our user database
          users.push(newUser);
          
          // Return the newly created user with a token
          resolve({
            user: {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              phone: newUser.phone,
              profilePic: newUser.profilePic,
              appleId: newUser.appleId
            },
            token: generateToken(newUser.id)
          });
        }
      } catch (error) {
        reject({ message: "Failed to authenticate with Apple" });
      }
    }, 1000);
  });
};

export const dummyAuthApi = {
  // Login with phone number
  loginWithPhone: async (phone, password) => {
    await delay(1500); // Simulate network delay
    
    const user = users.find(user => user.phone === phone);
    
    if (!user) {
      throw { message: 'User not found with this phone number' };
    }
    
    if (user.password !== password) {
      throw { message: 'Invalid password' };
    }
    
    // Return user data and a dummy token
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        photo: user.photo
      },
      token: `dummy-token-${user.id}-${Date.now()}`,
      refreshToken: `dummy-refresh-token-${user.id}-${Date.now()}`
    };
  },
  
  // Login with Google
  loginWithGoogle: loginWithGoogle,

  // Login with Facebook
  loginWithFacebook: loginWithFacebook,
  
  // Login with Apple
  loginWithApple: loginWithApple,
  
  // Register with phone
  registerWithPhone: async (userData) => {
    await delay(1500); // Simulate network delay
    
    // Check if phone already exists
    if (users.some(user => user.phone === userData.phone)) {
      throw { message: 'Phone number already registered' };
    }
    
    // In a real app, you would save this to a database
    const newUser = {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email || '',
      phone: userData.phone,
      password: userData.password,
      photo: 'https://randomuser.me/api/portraits/lego/2.jpg'
    };
    
    // Add the new user to our "database"
    users.push(newUser);
    
    // Return success response
    return {
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        photo: newUser.photo
      }
    };
  },
  
  // Request OTP
  requestOTP: async (phone) => {
    await delay(1000); // Simulate network delay
    
    // This would normally send an SMS with a code
    // For testing, let's assume OTP is always '123456'
    return {
      success: true,
      message: 'OTP sent successfully',
      // In development, return the OTP for testing
      otp: '123456'
    };
  },
  
  // Verify OTP
  verifyOTP: async (phone, otp) => {
    await delay(1000); // Simulate network delay
    
    // For testing, any OTP of '123456' is valid
    if (otp !== '123456') {
      throw { message: 'Invalid OTP' };
    }
    
    return {
      success: true,
      message: 'OTP verified successfully'
    };
  }
};

export default dummyAuthApi; 