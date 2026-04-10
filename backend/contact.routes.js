const express =require("express");
const sendContactMessage =require("../controllers/contact.controllers");
const router = express.Router();
router.post("/",sendContactMessage);
module.exports= router;
