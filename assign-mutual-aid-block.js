const TWILIO_SID = "YOUR_TWILIO_SID"
const TWILIO_TOKEN = "YOUR_TWILIO_TOKEN"
const TWILIO_ENDPOINT_URL = "https://api.twilio.com/2010-04-01/Accounts/" + TWILIO_SID + "/Messages.json"
const From = "YOUR_TWILIO_NUMBER"
const Authorization = "Basic " + btoa(TWILIO_SID + ":" + TWILIO_TOKEN)

const encode = p => Object.entries(p).map(kv => kv.map(encodeURIComponent).join("=")).join("&")

const members = base.getTable("Members")
const requests = base.getTable("Requests")

output.markdown("Select an outstanding request.")
let request = await input.recordAsync("Select a request:", requests)

const assigned_to = request.getCellValueAsString("Assigned to")
output.table({
    [request.getCellValueAsString("Needs")]: request.getCellValueAsString("Preferred Delivery")})
if (assigned_to) {
    output.markdown(`Request for: ` + request.getCellValueAsString("Name") + ` was already assigned to: ${assigned_to}`)
    if (await input.buttonsAsync("reassign request?", [
        {label: "yes", variant: "primary"},
        {label: "no", variant: "secondary"},]) === "yes") {
        let member = await assign(request)
        output.text("Reassigned request to: " + member.getCellValueAsString("Name"))
        await notifyButton(member, request)
    }
} else {
    let member = await input.recordAsync("Select a member to assign the request:", members)
    await requests.updateRecordAsync(request, {"Assigned to": [{id: member.id}]})
    var date = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }));
    await requests.updateRecordAsync(request, {"Date Assigned" : date.toLocaleDateString()});
    output.text("Assigned request to: " + member.getCellValueAsString("Name")) 
    await notifyButton(member, request)
}

async function notifyButton(member, request) {
    if (await input.buttonsAsync("notify member of new assignment?", [
        {label: "send", variant: "primary"},
        {label: "no", variant: "secondary"},]) === "send") {
            await notify(member, request).then(console.log, e => console.error)
    }
}

async function assign(request) {
    let member = await input.recordAsync("Select a member to assign the request:", members)
    await requests.updateRecordAsync(request, {"Assigned to": [{id: member.id}]});
    var date = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }));
    await requests.updateRecordAsync(request, {"Date Assigned" : date.toLocaleDateString()});
    return member;
}

async function generateBody(member, request) {
    var body = "Hello " + member.getCellValueAsString("Name") 
            + " you have a new mutual aid request assigned to you from " 
            + request.getCellValueAsString("Name") + " at " + request.getCellValueAsString("Address")
            + ", who needs"
    var needs = request.getCellValueAsString("Needs")
    var groceryBox = request.getCellValueAsString("Grocery Box")
    var additionalGoods = request.getCellValueAsString("Additional Goods")
    var foodRestrictions = request.getCellValueAsString("Food Restrictions")
    if(needs === "Groceries / Food") {
        if(groceryBox === "Yes") {
            body = body + " a grocery box"
        }
        if(additionalGoods) {
            if(groceryBox === "No") {
                body = body + " these goods: " + additionalGoods
            } else {
            body = body + " and " + additionalGoods
            }
        } 
        if(foodRestrictions) {
            body = body + ". Food restrictions: " + foodRestrictions
        }    
    }
    var urgent = request.getCellValueAsString("Urgent")
    
    body = body + ". Their preferred delivery date is "
    + request.getCellValueAsString("Preferred Delivery") 
    + " and their phone number is " + request.getCellValueAsString("Phone")
    if(urgent === "Yes") {
        body = body + ". This request was marked as urgent"
    }
    body = body + ". If you have questions or cannot fulfill this request, talk to the delivery coordinator in Slack ASAP"
    return body
}


async function notify(member, request) {
    var body = await generateBody(member, request)
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