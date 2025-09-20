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
    const filter = { owner: req.user.id };
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

export const getOneContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await getContactById(id, req.user.id);
    if (result === null) {
      return next(new createError.NotFound("Contact not found"));
    }
    res.status(200).json({
      status: 200,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedContact = await removeContact(id, req.user.id);

    if (deletedContact === null) {
      return next(new createError.NotFound("Not found"));
    }
    res.status(200).json({
      status: 200,
      message: "Contact was deleted",
      data: deletedContact,
    });
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const contactData = { ...req.body, owner: req.user.id };
    const newContact = await addContact(contactData);
    res.status(201).json({
      status: 201,
      message: "Contact was added successfully",
      data: newContact,
    });
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const updatedContact = await updateContactService(
      req.params.id,
      req.user.id,
      req.body
    );
    if (updatedContact === null) {
      return next(new createError.NotFound("Contact not found"));
    }
    res.status(200).json({
      status: 200,
      message: "Contact was updated successfully",
      data: updatedContact,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatusContact = async (req, res, next) => {
  try {
    const { favorite } = req.body;
    if (typeof favorite !== "boolean") {
      return res.status(400).json({ message: "Missing field favorite" });
    }
    const updatedStatus = await updateStatusContactService(
      req.params.id,
      req.user.id,
      favorite
    );
    if (updatedStatus === null) {
      return next(new createError.NotFound("Contact not found"));
    }
    res.status(200).json({
      status: 200,
      message: "Status was update successfully",
      data: updatedStatus,
    });
  } catch (error) {
    next(error);
  }
};
