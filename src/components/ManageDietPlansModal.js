import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { FaTimes } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import './ManageDietPlansModal.css';

const ManageDietPlansModal = ({ isOpen, onRequestClose, dietPlans, handleToggleSubscription, searchQuery, handleSearch, filteredPlans }) => {
  const { user } = useAuth();
  const [availableDietPlans, setAvailableDietPlans] = useState([]);
  const [subscribedPlans, setSubscribedPlans] = useState([]);

  useEffect(() => {
    const fetchSubscribedPlans = async () => {
      try {
        const { data: userTags, error: userTagsError } = await supabase
          .from('user_dietary_tags')
          .select('dietary_tag_id')
          .eq('user_id', user.id);

        if (userTagsError) throw userTagsError;

        const subscribedTagIds = userTags.map((tag) => tag.dietary_tag_id);

        const { data: allTags, error: allTagsError } = await supabase
          .from('dietary_tags')
          .select('*');

        if (allTagsError) throw allTagsError;

        const subscribedPlans = allTags.filter((tag) => subscribedTagIds.includes(tag.id));
        const discoverablePlans = allTags.filter((tag) => !subscribedTagIds.includes(tag.id));

        setAvailableDietPlans(discoverablePlans);
        setSubscribedPlans(subscribedPlans);
      } catch (err) {
        console.error('Error fetching subscribed plans:', err);
      }
    };

    if (isOpen) {
      fetchSubscribedPlans();
    }
  }, [isOpen]);

  const reloadPlans = async () => {
    try {
      const { data: userTags, error: userTagsError } = await supabase
        .from('user_dietary_tags')
        .select('dietary_tag_id')
        .eq('user_id', user.id);

      if (userTagsError) throw userTagsError;

      const subscribedTagIds = userTags.map((tag) => tag.dietary_tag_id);

      const { data: allTags, error: allTagsError } = await supabase
        .from('dietary_tags')
        .select('*');

      if (allTagsError) throw allTagsError;

      const subscribedPlans = allTags.filter((tag) => subscribedTagIds.includes(tag.id));
      const discoverablePlans = allTags.filter((tag) => !subscribedTagIds.includes(tag.id));

      setAvailableDietPlans(discoverablePlans);
      setSubscribedPlans(subscribedPlans);
    } catch (err) {
      console.error('Error reloading plans:', err);
    }
  };

  if (!user) {
    console.error('User is not authenticated. Cannot manage diet plans.');
    return null;
  }

  const updateDietaryPreferences = async (plan, action) => {
    try {
      const dietaryTagId = plan.id; // Use the UUID from the fetched data
      if (!dietaryTagId) {
        throw new Error('Dietary tag ID is undefined. Please check the plan object:', plan);
      }

      if (action === 'add') {
        const { error } = await supabase
          .from('user_dietary_tags')
          .insert({ user_id: user.id, dietary_tag_id: dietaryTagId });

        if (error) throw error;
        console.log('Successfully added dietary tag:', dietaryTagId);
      } else if (action === 'remove') {
        const { error } = await supabase
          .from('user_dietary_tags')
          .delete()
          .eq('user_id', user.id)
          .eq('dietary_tag_id', dietaryTagId);

        if (error) throw error;
        console.log('Successfully removed dietary tag:', dietaryTagId);
      }

      // Reload plans after updating
      await reloadPlans();
    } catch (err) {
      console.error('Error updating dietary preferences:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Manage Diet Plans"
      className="modal"
      overlayClassName="overlay"
      ariaHideApp={false}
    >
      <FaTimes className="close-icon" onClick={onRequestClose} aria-label="Close dialog" />
      <h2>Manage Diet Plans</h2>

      <div className="subscribed-plans">
        <h3>Subscribed Plans</h3>
        <div className="available-plans">
          {subscribedPlans.map((plan, index) => (
            <div key={index} className="diet-plan-row">
              <div className="diet-plan-icon">{plan.icon}</div>
              <h4>{plan.name}</h4>
              <button
                onClick={() => updateDietaryPreferences(plan, 'remove')}
                className="subscription-button subscribed"
                aria-label={`Unsubscribe from ${plan.name}`}
              >
                Subscribed
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="discover-plans">
        <h3>Discover More Plans</h3>
        <input
          type="text"
          className="search-input"
          placeholder="Search for diet plans..."
          value={searchQuery}
          onChange={handleSearch}
          aria-label="Search for diet plans"
        />
        <div className="available-plans">
          {availableDietPlans
            .filter((plan) => !subscribedPlans.some((p) => p.id === plan.id))
            .map((plan, index) => (
              <div key={index} className="diet-plan-row">
                <div className="diet-plan-icon">{plan.icon}</div>
                <h4>{plan.name}</h4>
                <button
                  onClick={() => updateDietaryPreferences(plan, 'add')}
                  className="subscription-button unsubscribed"
                  aria-label={`Subscribe to ${plan.name}`}
                >
                  Subscribe
                </button>
              </div>
            ))}
        </div>
      </div>
    </Modal>
  );
};

export default ManageDietPlansModal;