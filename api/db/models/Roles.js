const mongoose = require("mongoose");
const RolePrivileges = require("../models/RolePrivileges");

const schema = mongoose.Schema({
    role_name: { type: String, required: true, unique: true},
    is_active: { type: Boolean, default: true },
    created_by: {
        type: mongoose.SchemaTypes.ObjectId,
        //required: true
    }
},{
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

class Roles extends mongoose.Model {

    /**Bir role silindiğinde öncesinde ona ait olan RolePrivileges silinecek. */
    static async deleteOne(query){
        if (query._id)
        {
            await RolePrivileges.deleteMany({role_id: query._id});
        }          

        await super.deleteOne(query);
    }
}

schema.loadClass(Roles);
module.exports = mongoose.model("roles", schema);