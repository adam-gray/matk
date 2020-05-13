const AIRTABLE_API_KEY = "your-api-key"
const AIRTABLE_BASE_ID = "your-base-id"
const Airtable = require("airtable");
const base = new Airtable({apiKey: AIRTABLE_API_KEY}).base(AIRTABLE_BASE_ID);

exports.handler = function (context, {Name, Phone, Address, Needs, Language}, done) {
    base("Requests").create([
        {
            fields: { "Name" : Name.trim(), 
                      "Phone" : Phone, 
                      "Address" : Address.trim(),
                      "Needs" : Needs.trim(),
                      "Language" : Language }
        }
    ]).then(records => done(null, records), done);
};