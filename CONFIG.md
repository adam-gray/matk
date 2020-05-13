# Configuration of MATK

MATK is written (poorly, this is my first time) in Javascript. It's designed to be serverless and use the integrated cloud functions of Twilio and Airtable to minimize technical knowledge needed to set it up and customize it. 

## Configuring Twilio
1. Create a Twilio account with the account you intend to use for your mutual aid network. Configure a phone number.
2. Get a COVID-19 credit by following instructions in the README.md
3. Familiarize yourself with Twilio Functions / Twilio Studio in the browser.
4. For Twilio functions, add `airtable` to the dependency list.  We're using version `^0.8.1`
5. Create function `find-request.js` and set it at the path of `/find-request`. Modify your `flow-definition.json` to have the path to `find-request` functions to be the url.  It should look like `https://foo-bar-1234.twil.io/find-request`
6. Fill in your Airtable API key and Base ID in the body of your `find-request.js`
7. Save the function.
8. Create function `update-request.js` and set it at the path of `/update-request`. Modify your `flow-definition.json` to have the path to `update-request` functions to be the url. It should look like `https://foo-bar-1234.twil.io/update-request`
9. Fill in your Airtable API key and Base ID in the body of your `update-request.js`
10.  Save the function.
11.  Make sure any other fields you need to populate (such as your Mutual Aid Group Name) are correct in `flow-definition.json`
12.  Go to the Twilio Studio Dashboard. Create a new flow.  Import `flow-definition.json` It should look like a diagram of a state machine now. 
13.  You may have to tinker with things a bit. These instructions are definitely not complete and we'd appreciate pull requests to help flesh them out further.

## Configuring Airtable
1. Create an Airtable account with the shared account email for your Mutual Aid Network. 
2. Get a year of pro credit by filling out the form and waiting a week for them to give it to you, see instructions in the README.md. You don't need the pro credit but it does make it so you can have more than 1000 rows of data and use the Scripts block for a year (current trial ends in September).
3. Create a base called `mutual-aid`. Import the 3 csv files in the `airtable-schemas` directory as tables within your base. Note that the name of the column does matter for the Twilio / Airtable interaction, so if you change a column name (such as "Name" or "Address") you need to update your Twilio functions accordingly. 
4. Go to the Blocks feature and create a new Scripting block called "Assign Mutual Aid Request"
5. Paste the contents of `assign-mutual-aid-block.js` in the scripting block. Fill in your Twilio credentials within the block.
6. Your Airtable API key is found [here](https://airtable.com/account).  The details for the Airtable API, including the base ID are found [here](https://airtable.com/api).  Click on the base you want to use and the base ID will be highlighted in green.  You need both of those in your Twilio functions to interact with your Airtable base via the API.

## How To Use Your Newly Created MATK

Once everything's set up, you should be able to text a phone number you created in Twilio to manage basic requests in both English and Spanish. We will be updating the flow-definition.json to handle the more precise fields in `Requests.csv` as our web form is conditional and allows us to find out more of the needs of the community and help them. We're offering custom grocery buying / delivery or the option to just have a box of essentials dropped off at their place. We also keep in mind dietary restrictions, allergies, lack of access to refrigeration or appliances in the web form. We hope to reflect this functionality soon.  

Currently the Airtable `Assign Mutual Aid Request` block allows you to take a request that came in via text or via web form, assign it to a member of your mutual aid group and then send them a message notifying them of the new request and where to follow up.

The next functional change will be allowing the dispatch facilitator to move a request to the Completed form to see what work is done. This can be done manually via cut and paste in the browser but is error prone. We hope to automate this via another Scripting block. 