const passport = require("passport");
const { ExtractJwt, Strategy } = require("passport-jwt");
const Users = require("../db/models/Users");
const UserRoles = require ("../db/models/UserRoles");
const RolePrivileges = require("../db/models/RolePrivileges");
const privs = require("../config/role_privileges");
const config = require("../config");
const Response = require("./Response");
const { HTTP_CODES } = require("../config/Enum");
const CustomError = require("./Error");


module.exports = function() {
    let strategy = new Strategy({
        secretOrKey: config.JWT.SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    }, async(payload, done) => {
        try {
            const user = await Users.findOne({ _id : payload.id });

            if(!user) return done(new Error("User not found!"), null);

            const userRoles = await UserRoles.find({ user_id : payload.id })
            const rolePrivileges = await RolePrivileges.find( { role_id : {$in: userRoles.map(ur => ur.role_id )} });

            const privileges = rolePrivileges.map(rp => privs.privileges.find(x => x.key == rp.permission));
            
            done(null,
                {
                    id: user._id,
                    roles: privileges,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name
                }
            );

        } catch (err) {
            done(err, null);
        }
    });

    passport.use(strategy);

    return {
        initialize: function() {
            return passport.initialize();
        },
        authenticate: function() {
            return passport.authenticate("jwt", { session: false });
        },
        checkRoles: (...expectedRoles) => {
            return (req, res, next) => {
                let i = 0;
                let privileges = req.user.roles.map(x => x.key);

                while(i<expectedRoles.length && !privileges.includes(expectedRoles[i])) i++;

                if(i >= expectedRoles.length){
                    //error
                    let response = Response.errorResponse(new CustomError(HTTP_CODES.UNAUTHORIZED, "Need permission", "Need permission"));
                    return res.status(response.code).json(response);
                }
                
                return next();  //Authorized
            }
        }
    }
}