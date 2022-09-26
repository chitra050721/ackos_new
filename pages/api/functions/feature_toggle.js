var MongoClient = require('mongodb').MongoClient;

export default async function handler(req, res) {
    const db = await MongoClient.connect(process.env.MONGO_URI);
    const dbo = db.db("test");

    if (req.method === 'POST') {
        const { err, result } = await dbo.collection("feature_toggles").insertOne(req.body);
        if (err) throw err;
        db.close();
        return res.json({ result, message: "success" });
    } if (req.method === 'GET') {
        const filterOptions = {
            ...req.query.stack_api_key ? { stackApiKey: req.query.stack_api_key } : undefined,
            ...req.query.feature_toggle_id ? { _id: req.query.feature_toggle_id } : undefined
        }
        const data = await dbo.collection("feature_toggles").find(filterOptions).toArray();
        if (data.err) throw err;
        db.close();
        return res.json(data);
    } if (req.method === 'PATCH') {
        const data = await dbo.collection("feature_toggles").findOneAndUpdate({
            _id: req.query.feature_toggle_id
        }, {
            $set: {
                ...req.body
            }
        }, {
            returnOriginal: false
        })
        if (!data || !data.value) throw err;
        db.close();
        return res.json(data.value);
    } if (req.method === 'DELETE') {
        const data = await dbo.collection("feature_toggles").deleteMany({
            stackApiKey: req.query.stack_api_key
        });
        if (data.err) throw err;
        db.close();
        return res.json(data);
    } else {
        return res.json({ message: "invalid url" });
    }
}
