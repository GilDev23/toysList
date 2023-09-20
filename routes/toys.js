const express = require("express");
const { ToysModel, validateToys } = require("../models/toysModel");
const { auth } = require("../middlewares/auth");
const router = express.Router();

// router.get("/", async (req, res) => {
//   res.json({ msg: "toys work!" });
// });

router.get("/", async (req, res) => {
  try {
    //?limit=X&page=X&sort=X&reveres=yes
    const limit = req.query.limit || 5;
    const page = req.query.page - 1 || 0;
    const sort = req.query.sort || "_id";
    const reverse = req.query.reverse == "yes" ? 1 : -1;
    const category = req.query.cat;

    let filteFind = {};
    // בודק אם הגיע קווארי לחיפוש ?s=
    if (req.query.s) {
      // "i" - דואג שלא תיהיה בעיית קייססינסטיב
      const searchExp = new RegExp(req.query.s, "i");
      // יחפש במאפיין הטייטל או האינפו ברשומה
      filteFind = { $or: [{ name: searchExp }, { info: searchExp }] };
    }

    if (req.query.cat) {
      // "i" - דואג שלא תיהיה בעיית קייססינסטיב
      const searchExp = new RegExp(req.query.cat, "i");
      // יחפש במאפיין הטייטל או האינפו ברשומה
      filteFind = { ...filteFind, category: searchExp };
    }
    const data = await ToysModel.find(filteFind)
      .limit(limit)
      .skip(page * limit)
      .sort({ [sort]: reverse });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.get("/single/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // ישלוף רק פריט אחד לפי האיי די שהעברנו בכתובת
    const data = await ToysModel.findOne({ _id: id });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

// /toys/price?min=&max=
router.get("/price", async (req, res) => {
  // res.json({msg:"tickets work!"})
  try {
    // נשלוף רשומות לפי קטגוריה
    const min = req.query.min || 0;
    // Infinity = אין סוף
    const max = req.query.max || Infinity;
    // $lte -> lower then or Equal קטן או שווה
    // $gte -> greater then or Equal גדול או שווה
    const data = await ToysModel.find({ price: { $lte: max, $gte: min } });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.get("/count", async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    const count = await ToysModel.countDocuments({});
    // pages: - יציג למתכנת צד לקוח כמה עמודים הוא צריך להציג סהכ
    res.json({ count, pages: Math.ceil(count / limit) });
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.post("/addToy", auth, async (req, res) => {
  const validBody = validateToys(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const toy = new ToysModel(req.body);
    // להוסיף מאפיין של יוזר איי די לרשומה
    toy.user_id = req.tokenData._id;
    await toy.save();
    res.status(201).json(toy);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.put("/:id", auth, async (req, res) => {
  const validBody = validateGame(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    const id = req.params.id;
    // ,user_id:req.tokenData._id - דואג שרק בעל הרשומה יוכל
    // לשנות את הרשומה לפי הטוקן
    const data = await ToysModel.updateOne(
      { _id: id, user_id: req.tokenData._id },
      req.body
    );
    // "modifiedCount": 1, אומר שהצליח כשקיבלנו
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    // ,user_id:req.tokenData._id - דואג שרק בעל הרשומה יוכל
    // למחוק את הרשומה לפי הטוקן
    const data = await ToysModel.deleteOne({
      _id: id,
      user_id: req.tokenData._id,
    });
    // "modifiedCount": 1, אומר שהצליח כשקיבלנו
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(502).json({ err });
  }
});

module.exports = router;
