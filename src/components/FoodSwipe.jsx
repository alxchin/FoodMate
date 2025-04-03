import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { addSwipe } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, getFoodItems } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";

<Link to="/friends">Go to Friends List</Link>
const FoodSwipe = () => {
  const [foodItems, setFoodItems] = useState([]);  // State to store food items
  const [currentIndex, setCurrentIndex] = useState(0);
  const [user] = useAuthState(auth);  // Get the current user from Firebase Auth
  const userId = user ? user.uid : null;
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch food items when the component mounts
    const fetchFoodItems = async () => {
      try {
        const items = await getFoodItems();
        setFoodItems(items);  // Set the food items to state
      } catch (error) {
        console.error("Error fetching food items:", error);
      }
    };

    fetchFoodItems();
  }, []);  // Empty dependency array to run only once when the component mounts

  if (!userId) {
    navigate('/login');
    return null;  // Don't render the swipe section if user is not logged in
  }

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('no'),
    onSwipedRight: () => handleSwipe('yes'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const handleSwipe = async (swipe) => {
    const item = foodItems[currentIndex];

    try {
      await addSwipe(userId, item.id, swipe);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % foodItems.length);
    } catch (e) {
      console.error('Error adding swipe: ', e);
    }
  };

  return (
    <div {...handlers} style={{ touchAction: 'none' }}>
      {foodItems.length > 0 ? (
        <div>
          <h3>{foodItems[currentIndex].name}</h3>
          <p>{foodItems[currentIndex].location}</p>
          <img
            src={foodItems[currentIndex].image}
            alt={foodItems[currentIndex].name}
            width="150"
          />
        </div>
      ) : (
        <p>Loading food items...</p>
      )}
    </div>
  );
};

export default FoodSwipe;
