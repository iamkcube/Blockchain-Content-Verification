// Define roles and their allowed actions
const allowedRoles = {
    admin: ['create', 'verify', 'transfer'],
    user: ['view'],
    verifier: ['approve']
};

// Function to authenticate role and action
function authenticate(role, action) {
    return allowedRoles[role]?.includes(action);
}

module.exports = { authenticate };
