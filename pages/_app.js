// pages/_app.js

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import store, { persistor } from '../redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { initializeUser } from '../redux/slices/userSlice';
import '../styles/globals.css';
import Layout from '@/components/Layout';

const AppWrapper = ({ Component, pageProps }) => {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
};

const MyApp = ({ Component, pageProps }) => {
  useEffect(() => {
    store.dispatch(initializeUser()); // Dispatch action directly from store object
  }, []); // Run once on mount

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppWrapper Component={Component} pageProps={pageProps} />
      </PersistGate>
    </Provider>
  );
};

export default MyApp;
