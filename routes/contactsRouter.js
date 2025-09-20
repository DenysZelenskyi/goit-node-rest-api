import express from "express";

import {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateContact,
  updateStatusContact,
} from "../controllers/contactsControllers.js";
import auth from "../middlewares/auth.js";

const contactsRouter = express.Router();

import validateBody from "../helpers/validateBody.js";
import {
  createContactSchema,
  updateContactSchema,
} from "../schemas/contactsSchemas.js";

contactsRouter.get("/", auth, getAllContacts);

contactsRouter.get("/:id", auth, getOneContact);

contactsRouter.delete("/:id", auth, deleteContact);

contactsRouter.post(
  "/",
  auth,
  validateBody(createContactSchema),
  createContact
);

contactsRouter.put(
  "/:id",
  auth,
  validateBody(updateContactSchema),
  updateContact
);

contactsRouter.patch("/:id/favorite", auth, updateStatusContact);

export default contactsRouter;
