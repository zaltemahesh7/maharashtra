const router = require("express").Router();
const controller = require("./controllers");

router.post("/", controller.create);
router.put("/update/:id", controller.update);
router.get("/fetchby/talukaid/:id", controller.fetch);
router.get("/:id", controller.fetchById);
router.get("/taluka/:id", controller.fetchByTalukaId);
router.delete("/:id", controller.delete)

module.exports = router;/** update, delete */
