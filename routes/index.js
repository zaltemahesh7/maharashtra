    const router = require("express").Router();
    const roles = require("../components/roles/routes");
    router.use("/roles", roles)
    const users = require("../components/users/routes");
    router.use("/users", users)
    const auth = require("../components/auth/routes");
    router.use("/auth", auth)
    const districts = require("../components/districts/routes");
    router.use("/districts", districts)
    const talukas = require("../components/talukas/routes");
    router.use("/talukas", talukas)
    const villages = require("../components/villages/routes");
    router.use("/villages", villages)
    const visits = require("../components/visits/routes");
    router.use("/visits", visits)
    const visitimages = require("../components/visitimages/routes");
    router.use("/visitimages", visitimages)

    const divisions = require("../components/divisions/routes");
    router.use("/divisions", divisions)

    const uploadfile = require("../components/fileupload/routes");
    router.use("/uploadfile", uploadfile);
    module.exports = router;
