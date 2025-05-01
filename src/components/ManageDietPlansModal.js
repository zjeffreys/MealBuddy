import React from 'react';
import Modal from 'react-modal';
import { FaTimes } from 'react-icons/fa';
import './ManageDietPlansModal.css';

const ManageDietPlansModal = ({ isOpen, onRequestClose, dietPlans, handleToggleSubscription, searchQuery, handleSearch, filteredPlans }) => {
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
          {dietPlans.map((plan, index) => (
            <div key={index} className="diet-plan-row">
              <div className="diet-plan-icon">{plan.icon}</div>
              <h4>{plan.name}</h4>
              <button
                onClick={() => handleToggleSubscription(plan)}
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
          {filteredPlans
            .filter((plan) => !dietPlans.some((p) => p.name === plan.name))
            .map((plan, index) => (
              <div key={index} className="diet-plan-row">
                <div className="diet-plan-icon">{plan.icon}</div>
                <h4>{plan.name}</h4>
                <button
                  onClick={() => handleToggleSubscription(plan)}
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