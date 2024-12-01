const express = require('express');
const { resolve } = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let db;
(async () => {
  db = await open({
    filename:"./database.sqlite'",
    driver: sqlite3.Database,
  });
  console.log('Database connected successfully!');
})();



app.get('/', (req, res) => {
  res.send('Welcome to FoodieFinds');
});

// get all restaurants
async function fetchAllRestaurants() {
  let query = `SELECT * from restaurants`;
  let response = await db.all(query, []);
  return { restaurants: response };
}
app.get('/restaurants', async (req, res) => {
  try {
    let results = await fetchAllRestaurants();
    if (results.restaurants.length === 0) {
      return res.status(404).json({ message: 'No restaurants found' });
    }
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// get restaurant by ID
async function findRestaurantById(id) {
  let query = 'SELECT * from restaurants where id = ?';
  let response = await db.get(query, [id]);
  return { restaurant: response };
}
app.get('/restaurants/details/:id', async (req, res) => {
  let id = req.params.id;
  try {
    let results = await findRestaurantById(id);
    if (JSON.stringify(results) === '{}') {
      return res
        .status(404)
        .json({ message: `No restaurant found with id ${id}` });
    }
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// get restaurants by cuisine
async function fetchRestaurantsByCuisine(cuisine) {
  let query = `SELECT * from restaurants where cuisine = ?`;
  let response = await db.all(query, [cuisine]);
  return { restaurants: response };
}
app.get('/restaurants/cuisine/:cuisine', async (req, res) => {
  let cuisine = req.params.cuisine;
  try {
    let results = await fetchRestaurantsByCuisine(cuisine);
    if (results.restaurants.length === 0) {
      return res
        .status(404)
        .json({ message: `No restaurant found with  ${cuisine} cuisine` });
    }
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// get restaurants by filter
async function filterRestaurants(isVeg, hasOutdoorSeating, isLuxury) {
  let query =
    'SELECT * from restaurants WHERE isVeg=? and hasOutdoorSeating=? and isLuxury=?';
  let response = await db.all(query, [isVeg, hasOutdoorSeating, isLuxury]);
  return { restaurants: response };
}
app.get('/restaurants/filter', async (req, res) => {
  let isVeg = req.query.isVeg;
  let hasOutdoorSeating = req.query.hasOutdoorSeating;
  let isLuxury = req.query.isLuxury;
  try {
    let results = await filterRestaurants(isVeg, hasOutdoorSeating, isLuxury);
    if (results.restaurants.length === 0) {
      return res.status(404).json({
        message: `${isLuxury === 'true' ? 'Luxurious' : 'Non Luxurious'} ${
          isVeg === 'true' ? 'Veg' : 'Non Veg'
        } restaurant  ${
          hasOutdoorSeating === 'true' ? 'with' : 'without'
        } outdoor seating not found`,
      });
    }
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// get restaurants sorted by rating
async function sortRestaurantsByRating() {
  let query = `SELECT * from restaurants order by rating desc `;
  let response = await db.all(query, []);
  return { restaurants: response };
}
app.get('/restaurants/sort-by-rating', async (req, res) => {
  try {
    let results = await sortRestaurantsByRating();
    if (results.restaurants.length === 0) {
      return res.status(404).json({ message: 'No restaurants found' });
    }
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// get all dishes
async function fetchAllDishes() {
  let query = 'SELECT * from dishes';
  let response = await db.all(query, []);
  return { dishes: response };
}
app.get('/dishes', async (req, res) => {
  try {
    let results = await fetchAllDishes();
    if (results.dishes.length == 0) {
      return res.status(404).json({ message: 'No dishes found' });
    }
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// get dish by id
async function findDishById(id) {
  let query = 'SELECT * from dishes where id= ? ';
  let response = await db.get(query, [id]);
  return { dish: response };
}
app.get('/dishes/details/:id', async (req, res) => {
  let id = req.params.id;
  try {
    let results = await findDishById(id);
    if (JSON.stringify(results) === '{}') {
      return res.status(404).json({ message: `No dish found with id ${id}` });
    }
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// get dishes by filter
async function filterDishes(isVeg) {
  let query = 'SELECT * from dishes where isVeg = ? ';
  let response = await db.all(query, [isVeg]);
  return { dishes: response };
}
app.get('/dishes/filter', async (req, res) => {
  let isVeg = req.query.isVeg;
  try {
    let results = await filterDishes(isVeg);
    if (results.dishes.length === 0) {
      return res.status(404).json({
        message: `${
          isVeg === 'true'
            ? 'Veg'
            : isVeg === 'false'
            ? 'Non-Veg'
            : isVeg + ' is the incorrect value passed in the parameter.'
        } dishes not found`,
      });
    }
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// get dished sorted by price
async function sortDishesByPrice() {
  let query = 'SELECT * from dishes order by price asc';
  let response = await db.all(query, []);
  return { dishes: response };
}
app.get('/dishes/sort-by-price', async (req, res) => {
  try {
    let results = await sortDishesByPrice();
    if (results.dishes.length === 0) {
      return res.status(404).json({ message: 'No dishes found' });
    }
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
