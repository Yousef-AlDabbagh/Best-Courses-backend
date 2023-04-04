const { getAppInfo, getMostRated } = require("../controllers/admin");
const { isAuth, isAdmin } = require("../middlewares/auth");

const router = require("express").Router();

//......................................  Admin Routes  .....................................................

router.get("/app-info", isAuth, isAdmin, getAppInfo);
router.get("/most-rated", isAuth, isAdmin, getMostRated);
module.exports = router;
