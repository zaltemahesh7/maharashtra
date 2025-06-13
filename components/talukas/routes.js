const router = require("express").Router();
const controller = require("./controllers");

router.post("/", controller.create);
router.put("/update/:id", controller.update);
router.get("/fetchby/districtid/:id", controller.fetch);
router.get("/:id", controller.fetchById);
router.get("/district/:id", controller.fetchByDistrictId);
router.delete("/:id", controller.delete)

module.exports = router;/** update, delete */
