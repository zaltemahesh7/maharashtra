const router = require("express").Router();
const controller = require("./controllers");

router.post("/", controller.create);
router.put("/update/:id", controller.update);
router.get("/", controller.fetch);
router.get("/:id", controller.fetchById);
router.get("/userid/:userid", controller.fetchByUserId);
router.get("/report/bymonth/or/day", controller.fetchVisitReport);
router.delete("/:id", controller.delete)

module.exports = router;/** update, delete */
