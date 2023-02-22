UserSchema = require("./Schema/user.js"),

module.exports.fetchuser = async function(key){

    let users = await UserSchema.findOne({ name: key });

    if(users){
        return users;
    }else{
        users = new UserSchema({
            name: key,
            registeredAt: Date.now()
        })
        await users.save().catch(err => console.log(err));
        return users;
    }
};