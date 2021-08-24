const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userNameExists = users.find((user) => user.username === username);
  if (!userNameExists) {
    return response.status(404).json({ error: "Username não existe" });
  }
  request.username = userNameExists;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const userExists = users.find((user) => user.username === username);
  if (userExists) {
    return response
      .status(400)
      .json({ error: `Usuário ${username} já existe` });
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  users.push(user);
  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  return response.json(username.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;
  console.log(username);
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  username.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { username } = request;

  const todoExists = username.todos.find((user) => user.id === id);
  if (!todoExists) {
    return response
      .status(404)
      .json({ error: `Todo com id ${id} informado não existe` });
  }
  todoExists.title = title;
  todoExists.deadline = new Date(deadline);
  return response.json(todoExists);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;
  const todoExists = username.todos.find((user) => user.id === id);
  if (!todoExists) {
    return response.status(404).json({ error: "Todo não existe" });
  }
  todoExists.done = true;
  return response.json(todoExists);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;
  const todoExists = username.todos.find((user) => user.id === id);
  if (!todoExists) {
    return response.status(404).json({ error: "Todo não existe" });
  }
  username.todos.splice(todoExists, 1);
  return response.status(204).json();
});

module.exports = app;
