import express from 'express';
import Contact from '../models/Contact.js';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all contacts of current user
router.get('/', auth, async (req, res) => {
  try {
    const contacts = await Contact.find({
      user: req.user.id
    }).populate('contact', 'username');
    
    // Transform contacts to a simpler format
    const formattedContacts = contacts.map(contact => ({
      _id: contact.contact._id,
      username: contact.contact.username
    }));
    
    res.json(formattedContacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new contact
router.post('/', auth, async (req, res) => {
  try {
    const { contactId } = req.body;
    
    // Check if contact exists
    const contactUser = await User.findById(contactId);
    if (!contactUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if contact is already added
    const existingContact = await Contact.findOne({
      user: req.user.id,
      contact: contactId
    });
    
    if (existingContact) {
      return res.status(400).json({ message: 'Contact already added' });
    }
    
    // Create new contact
    const newContact = new Contact({
      user: req.user.id,
      contact: contactId
    });
    
    await newContact.save();
    
    // Also add current user to the contact's contacts (bidirectional)
    const reverseContact = new Contact({
      user: contactId,
      contact: req.user.id
    });
    
    await reverseContact.save();
    
    // Return contact info
    res.status(201).json({
      _id: contactUser._id,
      username: contactUser.username
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;