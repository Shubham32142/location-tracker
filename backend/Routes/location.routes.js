import {
  deleteAdress,
  getAddress,
  postAddress,
  updateAdress,
} from "../Controller/location.controller.js";

export function Routes(app) {
  app.post("/add", postAddress);
  app.get("/get", getAddress);
  app.put("/update/:id", updateAdress);
  app.delete("/delete/:id", deleteAdress);
}
