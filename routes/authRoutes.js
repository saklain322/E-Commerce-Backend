const express = require("express");
const { createUser, loginUserCtrl,
     getAllUser, getSingleUser,
     deleteAUser, updateAUser,
     blockUser, unblockUser, handleRefreshToken, logout 
    } = require("../controller/userCtrl");
const { authMiddleWare, isAdmin } = require("../middlewares/authMiddleWares");
const router = express.Router();


router.post("/register", createUser);
router.post("/login", loginUserCtrl);
router.get("/all-users", getAllUser);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/:id", authMiddleWare, isAdmin, getSingleUser);
router.delete("/:id", deleteAUser);
router.put("/edit-user",authMiddleWare, updateAUser);
router.put("/block-user/:id",authMiddleWare, isAdmin, blockUser);
router.put("/unblock-user/:id",authMiddleWare, isAdmin, unblockUser);


module.exports = router;