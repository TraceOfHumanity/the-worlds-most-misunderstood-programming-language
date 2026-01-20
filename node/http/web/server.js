const Butter = require("./butter");

const PORT = 4060;

const server = new Butter();

server.route("get", "/", (req, res) => {
  res.sendFile("./public/index.html", "text/html");
});

server.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
