import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const initialState = {
  userInfo: null,
  businessId: null, // Add businessId to the initial state
  error: null,
};

// Async thunk for initializing user
export const initializeUser = createAsyncThunk(
  'user/initializeUser',
  async (_, thunkAPI) => {
    const auth = getAuth();
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        try {
          if (user) {
            console.log("User detected:", user.email);
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const userData = {
                email: user.email,
                uid: user.uid,
                role: userDoc.data().role,
                businessId: userDoc.data().businessId,
              };
              resolve(userData);
            } else {
              console.error("User data not found in Firestore");
              reject(new Error('User data not found in Firestore'));
            }
          } else {
            console.log("No user signed in");
            resolve(null);
          }
        } catch (error) {
          console.error("Error in initializeUser:", error.message);
          reject(error.message);
        } finally {
          unsubscribe(); // Unsubscribe here to ensure all async work is done
        }
      });
    });
  }
);

// Async thunk for registering a new user
export const registerUser = createAsyncThunk(
  'user/registerUser',
  async ({ email, password, displayName, role, businessId }, thunkAPI) => {
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userData = {
        email,
        role,
        displayName,
        uid: user.uid,
        ...(businessId && { businessId }),  // Conditionally include businessId
      };

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, userData);

      console.log("User registered:", userData);
      return userData;
    } catch (error) {
      console.error('Registration error:', error.message);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Async thunk for user login
export const loginUser = createAsyncThunk(
  'user/loginUser',
  async ({ email, password }, thunkAPI) => {
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = {
          email: user.email,
          uid: user.uid,
          role: userDoc.data().role,
          businessId: userDoc.data().businessId, // Include businessId from Firestore
        };
        localStorage.setItem('loggedIn', 'true'); // Set loggedIn status in localStorage
        console.log("User logged in:", userData);
        return userData;
      } else {
        throw new Error('User data not found in Firestore');
      }
    } catch (error) {
      console.error('Login error:', error.message);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Async thunk for user logout
export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, thunkAPI) => {
    try {
      const auth = getAuth();
      await signOut(auth);
      localStorage.removeItem('loggedIn'); // Remove loggedIn status on logout
      console.log("User logged out");
      return {};
    } catch (error) {
      console.error('Logout error:', error.message);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Define reducers for handling setUser and clearUser actions
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.userInfo = action.payload;
      state.businessId = action.payload.businessId; // Set businessId
      state.error = null;
    },
    clearUser: (state) => {
      state.userInfo = null;
      state.businessId = null; // Clear businessId
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setBusinessId: (state, action) => {
      state.businessId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeUser.fulfilled, (state, action) => {
        state.userInfo = action.payload;
        state.businessId = action.payload?.businessId || null; // Set businessId
        state.error = null;
      })
      .addCase(initializeUser.rejected, (state, action) => {
        state.userInfo = null;
        state.businessId = null;
        state.error = action.payload;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.userInfo = action.payload;
        state.businessId = action.payload.businessId || null;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.userInfo = action.payload;
        state.businessId = action.payload.businessId || null;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.userInfo = null;
        state.businessId = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setError, clearError, setUser, clearUser, setBusinessId } = userSlice.actions;

export default userSlice.reducer;
