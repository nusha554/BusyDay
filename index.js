// Publish your code as npm package and run it with npx
// Add colors to your cli tool    DONE!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Add Inquirer.js and make you cli tool interactive
// Display pokemon image (ascii art) DONE!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 
//   `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${}.png`
const fs = require("fs");
const axios = require("axios");
const Image = require("ascii-art-image");
const color = require("colors-cli/safe");
const errorColor = color.red.bold;
const addedColor = color.green.bold;
const menuColor = color.blue.bold;
const listColor = color.magenta.bold;
const deletedColor = color.yellow.bold;

const args = process.argv;

// The "index.js" is 8 characters long so -8 removes last 8 characters
const currentWorkingDirectory = args[1].slice(0, -8);

if (fs.existsSync(currentWorkingDirectory + "todo.txt") === false) {
  let createStream = fs.createWriteStream("todo.txt");
  createStream.end();
}

const isInputNumber = (inputNumber) => {
  return Number.isInteger(Number(inputNumber)) ? true : false;
};

const fetchFromApi = async (pokemonId) => {
  const pokemonName = await getPokemon(pokemonId);

  return typeof pokemonName !== "undefined" ? pokemonName : undefined;
};

const getPokemon = async (pokemonId) => {
  try {
    const response = await axios(
      `https://pokeapi.co/api/v2/pokemon/${pokemonId}/`
    );

    const pokemonName = await response.data;
    return pokemonName.name;
  } catch (error) {
  }
};

const getHelpInfo = () => {
  const UsageText = `
Usage :-
$ node index.js add "todo item"  # Add a new todo
$ node index.js get               # Show remaining todos
$ node index.js delete NUMBER       # Delete a todo`;

  console.log(menuColor(UsageText));
};

const getAllToDo = () => {
  // Create a empty array
  let data = [];

  // Read from todo.txt and convert it into a string
  const fileData = fs
    .readFileSync(currentWorkingDirectory + "todo.txt")
    .toString();

  // Split the string and store into array
  data = fileData.split("\n");

  // Filter the string for any empty lines in the file
  let filterData = data.filter(function (value) {
    return value !== "";
  });

  if (filterData.length === 0) {
    console.log(errorColor("There are no pending todos!"));
  }
  for (let i = 0; i < filterData.length; i++) {
    console.log(listColor(filterData.length - i + ". " + filterData[i]));
  }
};

const displayAsciiArt = (pokemonID) => {
  var image = new Image({
    filepath: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonID}.png`,
    alphabet: "variant4",
  });

  image.write(function (err, rendered) {
    console.log(rendered);
  });
};

const addNewToDo = async () => {
  const newTask = args[3];
  let pokemonFileData = new String();
  if (newTask) {
    const isPokemon = isInputNumber(newTask);
    //if is number, add as pokemon catch
    if (isPokemon) {
      const pokemonName = await fetchFromApi(Number(newTask));
      // pokemonFileData =
      //   typeof pokemonName !== "undefined"
      //     ? `Catch ${pokemonName}`
      //     : `Oops! Such pokemon was not found yet...`;
      // displayAsciiArt(Number(newTask));

      if (typeof pokemonName !== "undefined") {
        pokemonFileData = `Catch ${pokemonName}`;
        displayAsciiArt(Number(newTask));
      } else {
        pokemonFileData = `Oops! Such pokemon was not found yet...`;
      }
    }

    const fileData = fs
      .readFileSync(currentWorkingDirectory + "todo.txt")
      .toString();

    const newTodoToAdd = isPokemon ? pokemonFileData : newTask;

    // New task is added to previous data
    fs.writeFile(
      currentWorkingDirectory + "todo.txt",
      newTodoToAdd + "\n" + fileData,

      function (err) {
        // Handle if there is any error
        if (err) throw err;

        // Logs the new task added
        console.log(addedColor('Added todo: "' + newTask + '"'));
      }
    );
  } else {
    // If argument was no passed
    console.log(errorColor("Error: Missing todo string." + " Nothing added!"));
  }
};

const deleteToDo = () => {
  // Store which index is passed
  const deleteIndex = args[3];

  // If index is passed
  if (deleteIndex) {
    // Create a empty array
    let data = [];

    // Read the data from file and convert
    // it into string
    const fileData = fs
      .readFileSync(currentWorkingDirectory + "todo.txt")
      .toString();

    data = fileData.split("\n");
    let filterData = data.filter(function (value) {
      // Filter the data for any empty lines
      return value !== "";
    });

    // If delete index is greater than no. of task
    // or less than zero
    if (deleteIndex > filterData.length || deleteIndex <= 0) {
      console.log(
        errorColor(
          "Error: todo #" + deleteIndex + " does not exist. Nothing deleted."
        )
      );
    } else {
      // Remove the task
      filterData.splice(filterData.length - deleteIndex, 1);

      // Join the array to form a string
      const newData = filterData.join("\n");

      // Write the new data back in file
      fs.writeFile(
        currentWorkingDirectory + "todo.txt",
        newData,
        function (err) {
          if (err) throw err;
          // Logs the deleted index
          console.log(deletedColor("Todo #" + deleteIndex + " was deleted successfully!"));
        }
      );
    }
  } else {
    // Index argument was no passed
    console.log(errorColor("Error: Missing NUMBER for deleting todo."));
  }
};

switch (args[2]) {
  case "add": {
    addNewToDo();
    break;
  }
  case "get": {
    getAllToDo();
    break;
  }
  case "delete": {
    deleteToDo();
    break;
  }
  default: {
    getHelpInfo();
  }
}
