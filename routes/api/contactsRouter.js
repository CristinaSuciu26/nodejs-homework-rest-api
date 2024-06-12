import express from "express";
import ContactsService from "../../models/contactsService.js";

const contactsRouter = express.Router();

/* GET localhost:3000/api/contacts */
contactsRouter.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const favorite = req.query.favorite === "true";

    const filter = {};
    if (req.query.favorite !== undefined) {
      filter.favorite = favorite;
    }

    const contacts = await ContactsService.getContactsPaginated(
      skip,
      limit,
      filter
    );
    const totalContacts = await ContactsService.getTotalContacts(filter);

    return res.status(200).json({
      page,
      limit,
      totalContacts,
      data: contacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/* GET localhost:3000/api/contacts/:id */
contactsRouter.get("/:id", async (req, res) => {
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
contactsRouter.post("/", async (req, res) => {
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
contactsRouter.put("/:id", async (req, res) => {
  try {
    const contactId = req.params.id;
    const body = req.body;

    if (!body || (!body.name && !body.email && !body.phone)) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const updatedContact = await ContactsService.updateContact(
      contactId,
      body,
      {
        new: true,
      }
    );

    if (updatedContact) {
      return res.status(200).json({
        message: "Contact updated successfully",
        data: updatedContact,
      });
    } else {
      return res.status(404).json({ message: "Contact not found" });
    }
  } catch (error) {
    console.error("Error updating contact:", error);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
});

/* DELETE localhost:3000/api/contacts/:id */
contactsRouter.delete("/:id", async (req, res) => {
  try {
    const contactId = req.params.id;
    const removedContact = await ContactsService.removeContact(contactId);

    if (!removedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res
      .status(200)
      .json({ message: "Contact deleted successfully", data: removedContact });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: `Error: ${error.message}` });
  }
});

contactsRouter.patch("/:contactId/favorite", async (req, res) => {
  try {
    const contactId = req.params.contactId;
    const { favorite } = req.body;

    if (favorite === undefined) {
      return res.status(400).json({ message: "Missing field 'favorite'" });
    }

    const updatedContact = await ContactsService.updateStatusContact(
      contactId,
      { favorite }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json({
      message: "Favorite status retrieved successfully",
      data: { favorite: updatedContact.favorite },
    });
  } catch (error) {
    console.error("Error retrieving contact's favorite status:", error);
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
});

export default contactsRouter;
