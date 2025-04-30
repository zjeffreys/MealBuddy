import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Pricing = () => {
  const navigate = useNavigate();
  const { subscriptionType, user } = useAuth();

  const handleCheckout = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/create-checkout-session`, {
        product_id: 'prod_SDRBtowMYP9yl9',
        user_id: user.id, // Pass the user ID
      });
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  const handleFreemium = () => {
    if (!subscriptionType) {
      navigate('/signup');
    } else {
      navigate('/dashboard');
    }
  };

  const handlePremium = () => {
    if (!subscriptionType) {
      navigate('/signup');
    } else {
      handleCheckout();
    }
  };

  return (
    <div className="pricing-container" style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
      {subscriptionType && (
        <div style={{
          backgroundColor: '#5ebd21',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '15px',
          textAlign: 'center',
          marginBottom: '20px',
          width: '100%',
        }}>
          <p>You are currently subscribed to the <strong>{subscriptionType}</strong> plan.</p>
        </div>
      )}
      <h1 style={{ width: '100%', textAlign: 'center' }}>Pricing Plans</h1>
      {subscriptionType !== 'freemium' && (
        <div className="pricing-card" style={{ border: '2px solid #5ebd21', borderRadius: '15px', padding: '20px', flex: '1 1 300px', textAlign: 'center' }}>
          <h2>Freemium Plan</h2>
          <p>$0/month</p>
          <p>Basic features for free.</p>
          <button style={{ backgroundColor: '#5ebd21', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '10px', cursor: 'pointer' }} onClick={handleFreemium}>Get Started</button>
        </div>
      )}
      <div className="pricing-card" style={{ border: '2px solid #5ebd21', borderRadius: '15px', padding: '20px', flex: '1 1 300px', textAlign: 'center' }}>
        <h2>Premium Plan</h2>
        <p>$4.99/month</p>
        <p>Advanced features and priority support.</p>
        <button style={{ backgroundColor: '#5ebd21', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '10px', cursor: 'pointer' }} onClick={handlePremium}>{subscriptionType === 'freemium' ? 'Upgrade' : 'Get Started'}</button>
      </div>
    </div>
  );
};

export default Pricing;