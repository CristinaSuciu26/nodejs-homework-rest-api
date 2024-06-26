import Contact from "./contactSchema.js";

async function listContacts() {
  try {
    return await Contact.find();
  } catch (error) {
    console.error(`Error retrieving contacts: ${error.message}`);
    throw error;
  }
}

async function getContactById(contactId) {
  try {
    return await Contact.findById(contactId);
  } catch (error) {
    console.error(`Error getting contact by ID: ${error.message}`);
    throw error;
  }
}

async function removeContact(contactId) {
  try {
    return await Contact.findByIdAndDelete(contactId);
  } catch (error) {
    console.error(`Error deleting contact: ${error.message}`);
    throw error;
  }
}

async function addContact(contact) {
  try {
    return await Contact.create(contact);
  } catch (error) {
    console.error(`Error adding contact: ${error.message}`);
    throw error;
  }
}

async function updateContact(contactId, body) {
  try {
    return await Contact.findByIdAndUpdate(contactId, body, { new: true });
  } catch (error) {
    console.error(`Error updating contact: ${error.message}`);
    throw error;
  }
}

async function updateStatusContact(contactId, body) {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      { favorite: body.favorite },
      { new: true }
    );

    return updatedContact;
  } catch (error) {
    console.error(`Error updating contact's favorite status: ${error.message}`);
    throw error;
  }
}

const getContactsPaginated = async (skip, limit, filter) => {
  try {
    return await Contact.find(filter).skip(skip).limit(limit);
  } catch (error) {
    console.error(`Error fetching paginated contacts: ${error.message}`);
    throw error;
  }
};

const getTotalContacts = async (filter) => {
  try {
    const total = await Contact.countDocuments(filter);
    return total;
  } catch (error) {
    console.error("Error calculating total contacts:", error);
    throw error;
  }
};

const ContactsService = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
  getContactsPaginated,
  getTotalContacts,
};

export default ContactsService;
