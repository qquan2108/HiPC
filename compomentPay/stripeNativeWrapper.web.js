import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51RgeVG4drE7VMTu3y19cSIlHqr0RqAlwpr0IsCm5dgw6wKyWbPRAL1JdyHvq1kKOX1zn1Pcx3ja16OoYERv2pxWT00ZODfs9px');

export const CardField = (props) => {
  // Bạn có thể sử dụng Elements từ @stripe/stripe-js để tạo trường nhập thẻ
  // Ví dụ: https://stripe.com/docs/stripe-js/react
  return null; // Hoặc implement với Stripe Elements
};

export const useStripe = () => ({
  confirmPayment: async (clientSecret, data) => {
    const stripe = await stripePromise;
    const result = await stripe.confirmCardPayment(clientSecret, data);
    return result; // { paymentIntent, error }
  },
});