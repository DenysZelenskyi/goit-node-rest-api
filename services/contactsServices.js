import { Contact } from "../models/Contact.js";

export async function listContacts() {
  return Contact.findAll();
}

export async function getContactById(contactId) {
  return Contact.findByPk(contactId);
}

export async function removeContact(contactId) {
  const contact = await getContactById(contactId);
  if (!contact) {
    return null;
  }
  await contact.destroy();
  return contact;
}

export async function addContact(payload) {
  return Contact.create(payload);
}

export async function updateContactService(id, payload) {
  const contact = await getContactById(id);
  if (!contact) {
    return null;
  }
  await contact.update(payload);
  return contact;
}

export async function updateStatusContact(id, favorite) {
  const contact = await getContactById(id);
  if (!contact) {
    return null;
  }
  await contact.update({ favorite });
  return contact;
}
