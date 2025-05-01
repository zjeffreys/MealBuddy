import React, { useState } from 'react';
import { FaPlusCircle, FaBacon, FaWeight, FaLeaf } from 'react-icons/fa';
import ManageDietPlansModal from './ManageDietPlansModal';
import './SubscribedDietPlans.css';
import Typography from '@mui/material/Typography';

const SubscribedDietPlans = ({ dietPlans, setDietPlans }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availablePlans] = useState([
    { name: 'Keto', icon: <FaBacon /> },
    { name: 'Weight Loss', icon: <FaWeight /> },
    { name: 'Vegan', icon: <FaLeaf /> },
    { name: 'Paleo', icon: <FaLeaf /> },
    { name: 'Mediterranean', icon: <FaLeaf /> },
  ]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleToggleSubscription = (plan) => {
    if (dietPlans.some((p) => p.name === plan.name)) {
      setDietPlans(dietPlans.filter((p) => p.name !== plan.name));
    } else {
      setDietPlans([...dietPlans, plan]);
    }
  };

  const filteredPlans = availablePlans.filter((plan) =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="subscribed-diet-plans" style={{ width: '100%' }}>
      <h3>Subscribed Diet Plans</h3>
      <Typography variant="body2" color="textSecondary" style={{ margin: '10px 0 0 0', fontSize: '1rem', padding: '0 0 10px 0' }}>
        Select or manage your diet plans above to personalize your meal suggestions!
      </Typography>
      <div className="diet-plan-cards">
        {dietPlans.map((plan, index) => (
          <div key={index} className="diet-plan-card">
            <div className="diet-plan-icon">{plan.icon}</div>
            <h4>{plan.name}</h4>
          </div>
        ))}
        <div 
          className="diet-plan-card" 
          onClick={toggleModal}
          style={{ 
            cursor: 'pointer', 
            backgroundColor: '#f0f8ff', 
            borderStyle: 'dashed' 
          }}
        >
          <div className="diet-plan-icon" style={{ color: '#2196f3' }}>
            <FaPlusCircle />
          </div>
          <h4>Add More</h4>
        </div>
      </div>

      <ManageDietPlansModal
        isOpen={isModalOpen}
        onRequestClose={toggleModal}
        dietPlans={dietPlans}
        handleToggleSubscription={handleToggleSubscription}
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        filteredPlans={filteredPlans}
      />
    </div>
  );
};

export default SubscribedDietPlans;