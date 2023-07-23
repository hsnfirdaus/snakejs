import SnakeJS from "./snake";

const element = document.getElementById("app");
if (!element) {
  throw new Error("APP Dom not found!");
}
new SnakeJS(element);
