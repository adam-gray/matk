const AIRTABLE_API_KEY = "your-api-key"
const AIRTABLE_BASE_ID = "your-base-id"
const Airtable = require("airtable");
const base = new Airtable({apiKey: AIRTABLE_API_KEY}).base(AIRTABLE_BASE_ID);
const requests = base("requests")

async function lookup(Phone) {
  const results = await requests.select({
    maxRecords: 1,
    filterByFormula: `{Phone}='${Phone}'`
  }).firstPage()
  if (!results[0]) {
      throw new Error("Not Found")
  }
  return results[0]
}

exports.handler = (context, event, done) =>
  lookup(event.Phone)
    .then(
        user => done(null, user),
        err => done(err)
    )