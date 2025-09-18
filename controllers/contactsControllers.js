import createError from "http-errors";
import {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContactService,
  updateStatusContact as updateStatusContactService,
} from "../services/contactsServices.js";

export const getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 20, favorite } = req.query;
    const pageNum = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const limitNum = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 20;
    const offset = (pageNum - 1) * limitNum;
    const filter = {};
    if (favorite !== undefined) {
      filter.favorite = favorite === "true";
    }
    const { rows, count } = await listContacts({
      offset,
      limit: limitNum,
      filter,
    });
    res.status(200).json({
      status: 200,
      data: rows,
      count,
      page: pageNum,
      limit: limitNum,
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
      message: "Contact was deleted",
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
      message: "Contact was added successfully",
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
      message: "Contact was updated successfully",
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
