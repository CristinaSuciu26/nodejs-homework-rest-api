import express from "express";
import ContactsService from "../../models/contacts.js";

const router = express.Router();

/* GET localhost:3000/api/contacts */
router.get("/", async (req, res, next) => {
  try {
    const contacts = await ContactsService.listContacts();
    res
      .status(200)
      .json({ message: "Contacts retrieved successfully", data: contacts });
  } catch (error) {
    console.error("Error retrieving contacts:", error);
    res.status(500).json({ message: `Error: ${error.message}` });
  }
});

/* GET localhost:3000/api/contacts/:id */
router.get("/:id", async (req, res, next) => {
  try {
    const contact = await ContactsService.getContactById(req.params.id);

    if (!contact) {
      throw new Error("Contact not found");
    }

    res
      .status(200)
      .json({ message: "Contact retrieved successfully", data: contact });
  } catch (error) {
    res.status(500).json({ message: `Error: ${error.message}` });
  }
});

/* POST localhost:3000/api/contacts/ */
router.post("/", async (req, res, next) => {
  try {
    const newContact = req.body;
    if (!newContact.name || !newContact.email || !newContact.phone) {
      return res
        .status(400)
        .json({ message: "missing required name, email, or phone field" });
    }

    const addedContact = await ContactsService.addContact(newContact);

    res
      .status(201)
      .json({ message: "Contact was successfully added", data: addedContact });
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).json({ message: `Error: ${error.message}` });
  }
});

/* PUT localhost:3000/api/contacts/:id */
router.put("/:id", async (req, res, next) => {
  try {
    const contactId = req.params.id;
    const body = req.body;

    if (!body || (!body.name && !body.email && !body.phone)) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const updatedContact = await ContactsService.updateContact(contactId, body);

    if (updatedContact) {
      return res.status(200).json({
        message: "Contact updated successfully",
        data: updatedContact,
      });
    } else {
      return res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    console.error("Error updating contact:", error);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
});

/* DELETE localhost:3000/api/contacts/:id */
router.delete("/:id", async (req, res, next) => {
  try {
    const contactId = req.params.id;
    const removeContact = await ContactsService.removeContact(contactId);
    if (!removeContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res
      .status(200)
      .json({ message: "Contact deleted succesfully", data: removeContact });
  } catch (error) {
    console.error("Error deleting contact", error);
    res.status(500).json({ message: `Error: ${error.message}` });
  }
});

export default router;
