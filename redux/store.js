import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';
import { combineReducers } from 'redux';
import userReducer from './slices/userSlice'; // Adjust the path as per your project

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'], // List of reducers to be persisted
  // Optionally, you can add transforms or other configurations here
};

const rootReducer = combineReducers({
  user: userReducer,
  // Add other reducers here if needed
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  // Ensure to exclude or customize middleware as needed
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore specific actions related to redux-persist
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  // Optionally, you can add enhancers here
});

export const persistor = persistStore(store);

export default store;
