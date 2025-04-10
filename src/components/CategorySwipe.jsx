// src/components/CategorySwipe.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import categories from "../data/categories";

const CategorySwipe = ({ onSelect }) => {
  const [index, setIndex] = useState(0);

  const handleSwipe = (direction) => {
    if (direction === "right") {
      onSelect(categories[index].name);
    }

    setIndex((prev) => Math.min(prev + 1, categories.length - 1));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-2xl font-semibold mb-4">Pick a Food Category</h2>
      <div className="relative w-[300px] h-[300px]">
        <AnimatePresence>
          {categories[index] && (
            <motion.div
              key={categories[index].name}
              className="absolute w-full h-full rounded-2xl shadow-lg overflow-hidden"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={categories[index].image}
                alt={categories[index].name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 w-full bg-black bg-opacity-50 text-white text-center py-2">
                {categories[index].name}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex gap-6 mt-6">
        <button
          className="bg-red-500 px-4 py-2 rounded-xl text-white"
          onClick={() => handleSwipe("left")}
        >
          Skip
        </button>
        <button
          className="bg-green-500 px-4 py-2 rounded-xl text-white"
          onClick={() => handleSwipe("right")}
        >
          Select
        </button>
      </div>
    </div>
  );
};

export default CategorySwipe;
