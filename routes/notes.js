const express = require('express');
const router = express.Router();
const Notes = require("../models/Notes");
const fetchuser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");

// ROUTE 1: Fetch all notes: GET "/api/notes/fetchallnotes"
router.get("/fetchallnotes", fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes)

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 2: Adding a new note: POST "/api/notes/addnote"
router.post("/addnote", fetchuser, [
    body("title", "Title must be atleast 3 characters long").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters long").isLength({ min: 5 })
], async (req, res) => {
    try {

        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, tag } = req.body;
        const note = new Notes({
            title, description, tag, user: req.user.id
        })

        // Add Note
        const savedNote = await note.save();
        res.json(savedNote);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 3: Updating a note: PUT "/api/notes/updatenote"
router.put("/updatenote/:id", fetchuser, async (req, res) => {
    try {

        // Setting New note
        const { title, description, tag } = req.body;
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        // Find note by id, check if present and it should be user's note only
        let note = await Notes.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }
        if (note.user.toString() !== req.user.id) { return res.status(401).send("Not Allowed") }

        // Update Note
        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json(note);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 4: Delete a note: DELETE "/api/notes/deletenote"
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
    try {

        // Find note by id, check if present and it should be user's note only
        let note = await Notes.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }
        if (note.user.toString() !== req.user.id) { return res.status(401).send("Not Allowed") }

        // Delete Note
        note = await Notes.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted", note: note });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;