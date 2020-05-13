const TWILIO_SID = "YOUR_TWILIO_SID"
const TWILIO_TOKEN = "YOUR_TWILIO_TOKEN"
const TWILIO_ENDPOINT_URL = "https://api.twilio.com/2010-04-01/Accounts/" + TWILIO_SID + "/Messages.json"
const From = "YOUR_TWILIO_NUMBER"
const Authorization = 'Basic ' + btoa(TWILIO_SID + ':' + TWILIO_TOKEN)

const encode = p => Object.entries(p).map(kv => kv.map(encodeURIComponent).join("=")).join("&")

const members = base.getTable("Members")

if (await input.buttonsAsync('Notify all members?', [
    {label: 'Yes', variant: 'primary'},
    {label: 'No', variant: 'secondary'},]) === 'Yes') {
    const member_list = await members.selectRecordsAsync({ fields: ['Phone', 'Name'] })
    const messages = member_list.records.map(m => {
        var body = "Hello " + m.getCellValueAsString("Name") 
        + " this is <YOUR GROUP NAME> and we're asking if you can help us with our"
        + " weekly food distribution on Monday between 1-3PM" 
        + " at <LOCATION>" 
        + "Please reply with YES or NO if you can make it,";   
         notify(m, body).then(console.log, e => console.error)
        })
    console.log(`Sending ${messages.length} text messages.`)    
    await Promise.all(messages)
    output.markdown("Done sending text messages.")
}

async function notify(member, body) {
    const rsp = await fetch(TWILIO_ENDPOINT_URL, {
        method: 'POST',
        headers: {
            Authorization,
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: encode({
            From,
            To: member.getCellValue("Phone"),
            Body: body
        })
    })
    return rsp.json()
}