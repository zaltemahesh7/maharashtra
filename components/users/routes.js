const router = require("express").Router();
const controller = require("./controllers");

router.post("/", controller.create);
router.post("/  ", controller.createUserWithoutAssignment);
router.put("/update/:id", controller.update);
router.get("/", controller.fetch);
router.get("/:id", controller.fetchById);
router.get("/fetchBy/RoleId/:id", controller.fetchByRoleId);
router.delete("/:id", controller.delete);
router.get('/get/assigned/users/:roleid', controller.getAssignedUsers);
router.get('/get/user/wise/report/:roleid', controller.getUserWiseReport);
// http://20.68.129.69:4000/api/users/get/assigned/users/2?districtid=97&talukaid=xx&villageid=xx
// response will be
// [
//     {
//       userid: 15,
//       username: 'tehsildar_west',
//       role: 'Tehsildar',
//       district_name: 'Pune',
//       taluka_name: 'Haveli',
//       village_name: null
//     },
//     {
//       userid: 16,
//       username: 'tehsildar_east',
//       role: 'Tehsildar',
//       district_name: 'Pune',
//       taluka_name: 'Mulshi',
//       village_name: null
//     }
//   ]
  

module.exports = router;/** update, delete */
