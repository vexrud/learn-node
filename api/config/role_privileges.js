module.exports = {
    privGroups: [
        { 
            id: "USERS",
            name: "User Permissions"
        },
        {
            id: "ROLES",
            name: "Role Permissions"
        },
        {
            id: "CATEGORIES",
            name: "Category Permissions"
        },
        {
            id: "AUDITLOGS",
            name: "AuditLogs Permissions"
        }
    ],

    privileges: [
        {
            key: "user_view",
            name: "User View",
            group: "USERS",
            description: "This authorization allows viewing any user record in the database."
        },
        {
            key: "user_add",
            name: "User Add",
            group: "USERS",
            description: "This authorization allows adding any new user record to the database."
        },
        {
            key: "user_update",
            name: "User Update",
            group: "USERS",
            description: "This authorization allows you to update any user registration in the database."
        },
        {
            key: "user_delete",
            name: "User Delete",
            group: "USERS",
            description: "This authority allows any user to delete a record in the database."
        },
        {
            key: "user_export",
            name: "User Export",
            group: "USERS",
            description: "This authorization allows it to be exported as an excel file."
        },      
        {
            key: "role_view",
            name: "Role View",
            group: "ROLES",
            description: "This authorization allows viewing any role record in the database."
        },
        {
            key: "role_add",
            name: "Role Add",
            group: "ROLES",
            description: "This authorization allows adding any new role record to the database."
        },
        {
            key: "role_update",
            name: "Role Update",
            group: "ROLES",
            description: "This authorization allows you to update any role registration in the database."
        },
        {
            key: "role_delete",
            name: "Role Delete",
            group: "ROLES",
            description: "This authority allows any role to delete a record in the database."
        },
        {
            key: "role_export",
            name: "Role Export",
            group: "ROLES",
            description: "This authorization allows it to be exported as an excel file."
        },        
        {
            key: "category_view",
            name: "Category View",
            group: "CATEGORIES",
            description: "This authorization allows viewing any category record in the database."
        },
        {
            key: "category_add",
            name: "Category Add",
            group: "CATEGORIES",
            description: "This authorization allows adding any new category record to the database."
        },
        {
            key: "category_update",
            name: "Category Update",
            group: "CATEGORIES",
            description: "This authorization allows you to update any category registration in the database."
        },
        {
            key: "category_delete",
            name: "Category Delete",
            group: "CATEGORIES",
            description: "This authority allows any category to delete a record in the database."
        },
        {
            key: "category_export",
            name: "Category Export",
            group: "CATEGORIES",
            description: "This authorization allows it to be exported as an excel file."
        },        
        {
            key: "auditlogs_view",
            name: "Auditlogs View",
            group: "AUDITLOGS",
            description: "This authorization allows you to view any auditlogs record in the database."
        }        
    ]
}