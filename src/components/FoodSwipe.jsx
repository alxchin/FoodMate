import React, { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { motion } from "framer-motion";
import categories from "../data/categories";

const FoodSwipe = () => {
  const [index, setIndex] = useState(0);
  const currentCategory = categories[index];

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setIndex((prev) => (prev + 1) % categories.length); // Move to next category
    },
    onSwipedRight: () => {
      alert(`You selected: ${currentCategory.name}`);
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  // Function to prevent image dragging and right-click
  const handleDragStart = (e) => {
    e.preventDefault(); // Disable image dragging
  };

  const handleContextMenu = (e) => {
    e.preventDefault(); // Disable right-click context menu
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
        userSelect: "none",
      }}
    >
      <h2>Swipe through categories</h2>
      <div
        style={{
          width: "300px",
          height: "300px",
          borderRadius: "1rem",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          marginBottom: "1rem",
          position: "relative",
        }}
      >
        {/* Add swipeable handler directly to the image */}
        <motion.div
          {...handlers} // Attach swipe handlers here
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={`${currentCategory.image}`}
            alt={currentCategory.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              cursor: "grab", // Show a grab cursor for swiping
            }}
            onDragStart={handleDragStart} // Prevent image dragging
            onContextMenu={handleContextMenu} // Disable right-click
          />
        </motion.div>
      </div>
      <h3>{currentCategory.name}</h3>
      <p>Swipe left to skip, right to choose</p>
    </div>
  );
};

export default FoodSwipe;
