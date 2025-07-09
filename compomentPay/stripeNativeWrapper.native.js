import { Platform } from 'react-native';

let CardField, useStripe;
if (Platform.OS !== 'web') {
  // chỉ require khi build/run trên iOS/Android
  ({ CardField, useStripe } = require('@stripe/stripe-react-native'));
}

export { CardField, useStripe };
