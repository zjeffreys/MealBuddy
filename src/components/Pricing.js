import React from 'react';
import './Pricing.css';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleFreemium = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/create-checkout-session`, {
        product_id: 'prod_SDRBtowMYP9yl9',
      });
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  return (
    <div className="pricing-container">
      <h1>Pricing Plans</h1>
      <div className="pricing-card">
        <h2>Freemium Plan</h2>
        <p>$0/month</p>
        <p>Basic features for free.</p>
        <button onClick={handleFreemium}>Choose Freemium</button>
      </div>
      <div className="pricing-card">
        <h2>Premium Plan</h2>
        <p>$4.99/month</p>
        <p>Advanced features and priority support.</p>
        <button onClick={handleCheckout}>Choose Premium</button>
      </div>
    </div>
  );
};

export default Pricing;