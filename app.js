const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasStatusPriority = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};

app.get("/todos/", (request, response) => {
  let data = null;
  let filterQuery = "";
  const { search_q = "", priority, status } = request.query;
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      filterQuery = `SELECT * FROM TODO WHERE STATUS = '${status}' AND PRIORITY = '${priority}'`;
      break;
    case hasPriorityProperty(request.query):
      filterQuery = `SELECT * FROM TODO WHERE PRIORITY = '${priority}`;
      break;
    case hasStatusPriority(request.query):
      filterQuery = `SELECT * FROM TODO WHERE STATUS = '${status}'`;
      break;
    default:
      filterQuery = `select * from todo where todo like '%${search_q}%'`;
      break;
  }
  const todoResult = db.all(filterQuery);
  response.send(todoResult);
});

app.get("/todos/:todoId/", (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT * FROM todo WHERE id = ${todoId}`;
  const todoIDResult = db.all(getTodoQuery);
  response.send(todoIDResult);
});

app.post("/todos/", (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `INSERT INTO todo(id,todo,priority,status) values(
      ${id},'${todo}','${priority}','${status}')`;
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  console.log(request.body);
  if (status !== "" && priority == "" && todo == "") {
    updateQuery = `UPDATE todo set status = '${status}' where id = ${todoId}`;
    db.run(updateQuery);
    response.send("Status Updated");
  } else if (status == "" && priority !== "" && todo === "") {
    updateQuery = `UPDATE todo set priority = '${priority}' where id = ${todoId}`;
    db.run(updateQuery);
    response.send("Priority Updated");
  } else if (status == "" && priority == "" && todo !== "") {
    updateQuery = `UPDATE todo set todo = '${todo}' where id = ${todoId}`;
    db.run(updateQuery);
    response.send("Todo Updated");
  }
});

app.delete("/todos/:todoId/", (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo where id = ${todoId}`;
  db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
