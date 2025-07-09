// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyB6S5pYaW3ARIAKIof3HdTgFFLjUsp_X6I',
  authDomain: 'banlaptop-b34ac.firebaseapp.com',
  databaseURL: 'https://banlaptop-b34ac-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'banlaptop-b34ac',
  storageBucket: 'banlaptop-b34ac.firebasestorage.app',
  messagingSenderId: '625212493169',
  appId: '1:625212493169:web:73d9d7ee0e3b47d15dfad0',
  measurementId: 'G-2J8T6MF5DG',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});


export default {auth};
