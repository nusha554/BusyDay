const fs = require("fs");
const axios = require("axios");
const Image = require("ascii-art-image");
const inquirer = require("inquirer");
const color = require("colors-cli/safe");
const errorColor = color.red.bold;
const addedColor = color.green.bold;
const menuColor = color.blue.bold;
const listColor = color.magenta.bold;
const deletedColor = color.yellow.bold;
const personalMessageColor = color.green_b.bold;

const args = process.argv;

// The "index.js" is 8 characters long so -8 removes last 8 characters
const currentWorkingDirectory = args[1].slice(0, -8);

if (!fs.existsSync(currentWorkingDirectory + "todo.txt")) {
  let createStream = fs.createWriteStream("todo.txt");
  createStream.end();
  console.log(errorColor("There are no pending todos!"));
  process.exit(1);
}

const showInteractiveMenu = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "What's your name?",
      },
      {
        type: "list",
        name: "menu",
        message: "What you would like to do next?",
        choices: [
          "Create new note",
          "Show all notes",
          "Delete note",
          "Show menu",
        ],
      },
    ])
    .then((answers) => {
      if (answers.menu === "Create new note") {
        inquirer
          .prompt([
            {
              type: "input",
              name: "new_note",
              message: `So, ${answers.name}, what's on your mind?`,
            },
          ])
          .then((answers) => {
            addNewToDo(answers.new_note);
          })
          .catch((error) => {
            console.log(error);
          });
      } else if (answers.menu === "Show all notes") {
        console.log(
          personalMessageColor(
            `Hey, ${answers.name}! Those are all your notes for now:`
          )
        );
        getAllToDo();
      } else if (answers.menu === "Delete note") {
        inquirer
          .prompt([
            {
              type: "input",
              name: "delete",
              message: `So, ${answers.name}, which note to delete?`,
            },
          ])
          .then((answers) => {
            deleteToDo(answers.delete);
          })
          .catch((error) => {
            console.log(error);
          });
      } else if (answers.menu === "Show menu") {
        console.log(
          personalMessageColor(
            `Hey, ${answers.name}! Please choose one of the following:`
          )
        );
        getHelpInfo();
      } else {
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

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
  } catch (error) {}
};

const getHelpInfo = () => {
  const UsageText = `
      BusyDay Application Menu:
      $ node index.js add "todo item"  # Add a new todo
      $ node index.js get              # Show all todos
      $ node index.js delete NUMBER    # Delete a todo
      $ node index.js menu             # Show menu

  `;

  console.log(menuColor(UsageText));
};

const getAllToDo = () => {
  // Create a empty array
  let data = [];

  // Read from todo.txt and convert it into a string
  const fileData = fs
    .readFileSync(currentWorkingDirectory + "todo.txt")
    .toString();

  data = fileData.split("\n");
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

const addNewToDo = async (newNoteInput) => {
  const newTask = newNoteInput ? newNoteInput : args[3];
  let pokemonFileData = new String();
  if (newTask) {
    const isPokemon = isInputNumber(newTask);
    //if is number, add as pokemon catch
    if (isPokemon) {
      const pokemonName = await fetchFromApi(Number(newTask));

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

    fs.writeFile(
      currentWorkingDirectory + "todo.txt",
      newTodoToAdd + "\n" + fileData,

      function (err) {
        if (err) throw err;
        console.log(
          addedColor('New todo: "' + newTask + '" was added succssfully!')
        );
      }
    );
  } else {
    console.log(errorColor("Error: Missing todo string." + " Nothing added!"));
  }
};

const deleteToDo = (deleteIndexInput) => {
  const deleteIndex = deleteIndexInput ? deleteIndexInput : args[3];

  if (deleteIndex) {
    let data = [];

    const fileData = fs
      .readFileSync(currentWorkingDirectory + "todo.txt")
      .toString();

    data = fileData.split("\n");
    let filterData = data.filter(function (value) {
      return value !== "";
    });

    if (deleteIndex > filterData.length || deleteIndex <= 0) {
      console.log(
        errorColor(
          "Error: todo #" + deleteIndex + " does not exist. Nothing deleted."
        )
      );
    } else {
      filterData.splice(filterData.length - deleteIndex, 1);
      const newData = filterData.join("\n");
      fs.writeFile(
        currentWorkingDirectory + "todo.txt",
        newData,
        function (err) {
          if (err) throw err;
          console.log(
            deletedColor("Todo #" + deleteIndex + " was deleted successfully!")
          );
        }
      );
    }
  } else {
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
  case "menu": {
    getHelpInfo();
    break;
  }
  default: {
    showInteractiveMenu();
  }
}
