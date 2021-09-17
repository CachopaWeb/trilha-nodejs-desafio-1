const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  //verifica e existencia do usuario
  const userExists = users.some(user => user.username === username);
  //caso não exista retorna erro e status 400 = bad request
  if (!userExists) {
    return response.status(400).json({ error: 'User not exists' })
  } else {
    request.username = username;
    return next()
  }
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  //verifica e existencia do usuario
  const userAlreadyExists = users.some(user => user.username === username);
  //caso não exista retorna erro e status 400 = bad request
  if (userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists' })
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  //add usuario na lista
  users.push(user);
  //devolve os dados do usuário e o status 201 = created
  return response.json(user).status(201);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const user = users.find(user => user.username === username);
  //retorna todos do usuario e o status 200 = ok
  return response.json(user.todos).status(200);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(),
    deadline,
    done: false,
    title,
    created_at: new Date(),
  };
  //procura o usuario pelo username passado no header
  const user = users.find(user => user.username === username);
  //caso encontrar então adiciona o todo na lista de todos do usuario
  if (user) {
    user.todos.push(todo);
  }
  //devolve o todo criado e set o status para 201 = created
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  //procura o usuario pelo username passado no header
  const user = users.find(user => user.username === username);
  //procura o todo pelo id passado por url params
  const todo = user.todos.find(todo => todo.id === id);
  if (todo) {
    //atualiza o todo
    todo.title = title;
    todo.deadline = deadline;
    //retorna o todo do usuario e status 200 = ok
    return response.json(todo).status(200);
  } else {
    //retorna erro e status 404 = not found
    return response.status(404).json({ error: 'Todo not found' })
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  //procura o usuario pelo username passado no header
  const user = users.find(user => user.username === username);
  //procura o todo pelo id passado por url params
  const todo = user.todos.find(todo => todo.id === id);
  if (todo) {
    //altera o todo para done
    todo.done = true;
    //retorna o todo do usuario e status 200 = ok
    return response.json(todo).status(200);
  } else {
    //retorna erro e status 404 = not found
    return response.status(404).json({ error: 'Todo not found' })
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  //procura o usuario pelo username passado no header
  const user = users.find(user => user.username === username);
  //procura o todo pelo id passado por url params
  const todo = user.todos.find(todo => todo.id === id);
  //deleta o todo da lista de todos do usuario
  if (todo) {
    user.todos.splice(todo, 1);
    //retorna no body os todos que restaram e status 200 = ok
    return response.status(204).send();
  } else {
    //retorna o erro e status 404 = not found
    return response.status(404).json({ error: 'todo not found' });
  }
});

module.exports = app;