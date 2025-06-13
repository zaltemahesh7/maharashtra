
const controller = require('./controller');
const router = require("express").Router();


router.post('/single', controller.uploadSingleFile);
router.post('/multiple', controller.uploadMultipleFiles);


module.exports = router;





// router.post("/", controller.create);
// router.put("/update/:id", controller.update);
// router.get("/", controller.fetch);
// router.get("/:id", controller.fetchById);
// router.delete("/:id", controller.delete);

// module.exports = router;
