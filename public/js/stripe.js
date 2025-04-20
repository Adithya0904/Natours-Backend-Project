import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51RF6nRDHLcv8RrOfNM2XTLaxW8BSF6RNgskeizifL9eaiq43yBooLLR3LxIZqYVTvLi5MbMT2unErvUBsn6yCN7q00ZqYGCICw');

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);

    // 2) Create checkout form + chanrge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};