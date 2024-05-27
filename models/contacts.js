import contacts from "./contacts.json" assert { type: "json" };
import { v4 as uuidv4 } from "uuid";

async function listContacts() {
  return contacts;
}

async function getContactById(contactId) {
  return contacts.find((el) => el.id === contactId);
}

async function removeContact(contactId) {
  const index = contacts.findIndex((contact) => contact.id === contactId);

  if (index !== -1) {
    const removeContact = contacts.splice(index, 1)[0];
    return removeContact;
  } else {
    throw new Error("Contact not found");
  }
}

async function addContact(contact) {
  const newContact = {
    id: uuidv4(),
    ...contact,
  };
  contacts.push(newContact);
  return newContact;
}

async function updateContact(contactId, body) {
  const index = contacts.findIndex((contact) => contact.id === contactId);
  if (index !== -1) {
    contacts[index] = {
      ...contacts[index],
      ...body,
    };

    return contacts[index];
  } else {
    throw new Error("Contact not found");
  }
}

const ContactsService = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};

export default ContactsService;
