// pull in our models. This will automatically load the index.js from that folder
const models = require("../models");

//get dog model
const Dog = models.Dog.DogModel;

// default fake data so that we have something to work with until we make a real dog
const dogsDefaultData = {
  name: "unknown",
  breed: "unknown",
  age: 0
};

// object for us to keep track of the last dog we made and dynamically update it sometimes
let lastDogAdded = new Dog(dogsDefaultData);

// function to find all dogs on request.
// Express functions always receive the request and the response.
const readAllDogs = (req, res, callback) => {
  // Call the model's built in find function and provide it a
  // callback to run when the query is complete
  // Find has several versions
  // one parameter is just the callback
  // two parameters is JSON of search criteria and callback.
  // That limits your search to only things that match the criteria
  // The find function returns an array of matching objects
  Dog.find(callback);
};

// function to find a specific dog on request.
// Express functions always receive the request and the response.
const readDog = (req, res) => {
  const name1 = req.query.name;

  // function to call when we get objects back from the database.
  // With Mongoose's find functions, you will get an err and doc(s) back
  const callback = (err, doc) => {
    if (err) {
      return res.json({ err }); // if error, return it
    }

    // return success
    return res.json(doc);
  };

  // Call the static function attached to DogModels.
  // This was defined in the Schema in the Model file.
  // This is a custom static function added to the DogModel
  // Behind the scenes this runs the findOne method.
  // You can find the findByName function in the model file.
  Dog.findByName(name1, callback);
};

const hostPage4 = (req, res) => {
  // function to call when we get objects back from the database.
  // With Mongoose's find functions, you will get an err and doc(s) back
  const callback = (err, docs) => {
    if (err) {
      return res.json({ err }); // if error, return it
    }

    // return success
    return res.render("page4", { dogs: docs });
  };

  readAllDogs(req, res, callback);
};

// function to handle a request to set the name
// controller functions in Express receive the full HTTP request
// and get a pre-filled out response object to send
// ADDITIONALLY, with body-parser we will get the
// body/form/POST data in the request as req.body
const setDogName = (req, res) => {
  // check if the required fields exist
  // normally you would also perform validation
  // to know if the data they sent you was real
  if (!req.body.dogsName || !req.body.breed) {
    // if not respond with a 400 error
    // (either through json or a web page depending on the client dev)
    return res.status(400).json({ error: "Name and breed are required" });
  }

  // if required fields are good, then set name
  const name = `${req.body.dogsName}`;

  // dummy JSON to insert into database
  const dogData = {
    name,
    breed: req.body.breed,
    age: req.body.age
  };

  // create a new object of DogModel with the object to save
  const newDog = new Dog(dogData);

  // create new save promise for the database
  const savePromise = newDog.save();

  savePromise.then(() => {
    // set the lastDogAdded dog to our newest dog object.
    // This way we can update it dynamically
    lastDogAdded = newDog;
    // return success
    res.json({
      name: lastDogAdded.name,
      breed: lastDogAdded.breed,
      age: lastDogAdded.age
    });
  });

  // if error, return it
  savePromise.catch(err => res.json({ err }));

  return res;
};

// function to handle requests search for a name and return the object
// controller functions in Express receive the full HTTP request
// and a pre-filled out response object to send
const searchDogName = (req, res) => {
  // check if there is a query parameter for name
  // BUT WAIT!!?!
  // Why is this req.query and not req.body like the others
  // This is a GET request. Those come as query parameters in the URL
  // For POST requests like the other ones in here, those come in a
  // request body because they aren't a query
  // POSTS send data to add while GETS query for a page or data (such as a search)
  if (!req.query.name) {
    return res.json({ error: "Name is required to perform a search" });
  }

  // Call our dog's static findByName function.
  // Since this is a static function, we can just call it without an object
  // pass in a callback (like we specified in the dog model
  // Normally would you break this code up, but I'm trying to keep it
  // together so it's easier to see how the system works
  // For that reason, I gave it an anonymous callback instead of a
  // named function you'd have to go find
  return Dog.findByName(req.query.name, (err, doc) => {
    // errs, handle them
    if (err) {
      return res.json({ err }); // if error, return it
    }

    // if no matches, let them know
    // (does not necessarily have to be an error since technically it worked correctly)
    if (!doc) {
      return res.json({ error: "That dog does not exist" });
    }

    lastDogAdded = doc;
    lastDogAdded.age++;
    const savePromise = lastDogAdded.save();

    // // send back the name as a success for now
    savePromise.then(() =>
      res.json({
        name: lastDogAdded.name,
        breed: lastDogAdded.breed,
        age: lastDogAdded.age
      })
    );

    // // if save error, just return an error for now
    savePromise.catch(err => res.json({ err }));

    // if a match, send the match back
    return res;
  });
};

// export the relevant public controller functions
module.exports = {
  page4: hostPage4,
  readDog,
  setDogName,
  searchDogName
};
