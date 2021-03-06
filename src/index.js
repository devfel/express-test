const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(cors());
app.use(express.json());

const projects = [];

//Middleware to print information about the routes requests.
function logRequests(request, response, next) {
  const { method, url } = request;

  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.time(logLabel);
  next();
  console.timeEnd(logLabel);
}

//Middleware to validate the ID before executing a route
function validateProjectId(request, response, next) {
  const { id } = request.params;

  // if ID is not a valid one.
  if (!isUuid(id)) {
    return response.status(400).json({ error: "Project ID not valid." });
  }
  // if ID is valid, use nexto to go on with the route.
  else {
    return next();
  }
}

app.use(logRequests);
app.use("/projects/:id", validateProjectId);

// READ ROUTE (with or without filters)
app.get("/projects", (request, response) => {
  const { title } = request.query;

  const results = title
    ? projects.filter((project) => project.title.includes(title)) //all projects that includes the query word in the title
    : projects; //replace results with all the projects if title is null. (aka no filter applied).

  return response.json(results);
});

// CREATE ROUTE
app.post("/projects", (request, response) => {
  const { title, owner } = request.body;
  const project = { id: uuid(), title, owner };

  projects.push(project);

  return response.json(project);
});

// UPDATE ROUTE
app.put("/projects/:id", (request, response) => {
  const { id } = request.params;
  const { title, owner } = request.body;
  const projectIndex = projects.findIndex((elem) => elem.id === id);

  // if project does not exists.
  if (projectIndex < 0) {
    return response.status(400).json({ error: "Project not found." });
  }

  // if project was found.
  else {
    // creating project with the new information to replace the old one.
    const project = {
      id,
      title,
      owner,
    };

    projects[projectIndex] = project;
    return response.json(project);
  }
});

// DELETE ROUTE
app.delete("/projects/:id", (request, response) => {
  const { id } = request.params;
  const projectIndex = projects.findIndex((elem) => elem.id === id);

  // if project does not exists.
  if (projectIndex < 0) {
    return response.status(400).json({ error: "Project not found." });
  }

  // if project was found.
  else {
    // remove the project index using the array splice method.
    projects.splice(projectIndex, 1);
    // return 204 status for the no content success response.
    return response.status(204).send();
  }
});

app.listen(3333, () => {
  console.log("Back-end started!");
});
