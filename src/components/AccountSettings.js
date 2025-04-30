import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AccountSettings = () => {
  const { user, subscriptionType } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  if (!user) {
    return <p>Please log in to view your account settings.</p>;
  }

  return (
    <div className="account-settings">
      <h1>Account Settings</h1>
      <p><strong>Display Name:</strong> {user.user_metadata?.display_name || 'N/A'}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Subscription Type:</strong> {subscriptionType}</p>
      {user.user_metadata?.profile_picture && (
        <div>
          <strong>Profile Picture:</strong>
          <img
            src={user.user_metadata.profile_picture}
            alt="Profile"
            style={{ width: '100px', height: '100px', borderRadius: '50%' }}
          />
        </div>
      )}
      {subscriptionType === 'freemium' && (
        <button onClick={handleUpgrade}>Upgrade to Premium</button>
      )}
    </div>
  );
};

export default AccountSettings;