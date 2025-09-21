import { Contact } from "../models/Contact.js";

export async function listContacts({
  offset = 0,
  limit = 20,
  filter = {},
} = {}) {
  return Contact.findAndCountAll({
    where: filter,
    offset,
    limit,
  });
}

export async function getContactById(contactId, ownerId) {
  return Contact.findOne({ where: { id: contactId, owner: ownerId } });
}

export async function removeContact(contactId, ownerId) {
  const contact = await getContactById(contactId, ownerId);
  if (!contact) {
    return null;
  }
  await contact.destroy();
  return contact;
}

export async function addContact(payload) {
  return Contact.create(payload);
}

export async function updateContactService(id, ownerId, payload) {
  const contact = await getContactById(id, ownerId);
  if (!contact) {
    return null;
  }
  await contact.update(payload);
  return contact;
}

export async function updateStatusContact(id, ownerId, favorite) {
  const contact = await getContactById(id, ownerId);
  if (!contact) {
    return null;
  }
  await contact.update({ favorite });
  return contact;
}
