import createError from "http-errors";
import {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContactService,
  updateStatusContact as updateStatusContactService,
} from "../services/contactsServices.js";

export const getAllContacts = async (_, res) => {
  try {
    const result = await listContacts();
    res.status(200).json({
      status: 200,
      data: result,
      count: result.length,
    });
  } catch (error) {
    throw error;
  }
};

export const getOneContact = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getContactById(id);
    if (result === null) {
      throw new createError.NotFound("User not found");
    }
    res.status(200).json({
      status: 200,
      data: result,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await removeContact(id);

    if (deletedUser === null) {
      throw new createError.NotFound("Not found");
    }
    res.status(200).json({
      status: 200,
      message: "User was deleted",
      data: deletedUser,
    });
  } catch (error) {
    throw error;
  }
};

export const createContact = async (req, res) => {
  try {
    const newUser = await addContact(req.body);
    res.status(201).json({
      status: 201,
      message: "User was add successfully",
      data: newUser,
    });
  } catch (error) {
    throw error;
  }
};

export const updateContact = async (req, res) => {
  try {
    const updatedUser = await updateContactService(req.params.id, req.body);
    if (updatedUser === null) {
      throw new createError.NotFound("User not found");
    }
    res.status(200).json({
      status: 200,
      message: "User was update successfully",
      data: updatedUser,
    });
  } catch (error) {
    throw error;
  }
};

export const updateStatusContact = async (req, res) => {
  try {
    const { favorite } = req.body;
    if (typeof favorite !== "boolean") {
      return res.status(400).json({ message: "Missing field favorite" });
    }
    const updatedStatus = await updateStatusContactService(
      req.params.id,
      favorite
    );
    if (updatedStatus === null) {
      throw new createError.NotFound("User not found");
    }
    res.status(200).json({
      status: 200,
      message: "Status was update successfully",
      data: updatedStatus,
    });
  } catch (error) {
    throw error;
  }
};
