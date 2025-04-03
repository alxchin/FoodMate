import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

const FoodList = () => {
  const [foodList, setFoodList] = useState([]);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "foodItems")); // Fetch from Firestore
        const foodData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); 
        setFoodList(foodData);
      } catch (error) {
        console.error("Error fetching food data:", error);
      }
    };

    fetchFood();
  }, []);

  return (
    <div>
      <h2>Food Choices</h2>
      {foodList.map(item => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <p>{item.location}</p>
          <img src={item.image} alt={item.name} width="150" />
        </div>
      ))}
    </div>
  );
};

export default FoodList;
