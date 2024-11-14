const SDNController = require('../contracts/SDNController');

class SDNAuthentication {
    constructor(contractInstance) {
        this.contract = contractInstance;
        this.accessLog = [];
        this.roleLog = [];
        this.usersWithFailedAttempts = new Set();
    }


    async validateAccess(userAddress) {
        try {
            const isAuthorized = await this.contract.authenticateUser(userAddress);
            if (!isAuthorized) {
                this.logAccessAttempt(userAddress, false);
                this.trackFailedAttempts(userAddress);
                throw new Error('Access Denied: Unauthorized user');
            }
            this.logAccessAttempt(userAddress, true);
            return true;
        } catch (error) {
            console.error(`Error during access validation: ${error.message}`);
            throw new Error('An error occurred during access validation');
        }
    }
    trackFailedAttempts(userAddress) {
        if (!this.usersWithFailedAttempts.has(userAddress)) {
            this.usersWithFailedAttempts.add(userAddress);
        }
    }
    async checkFailedAttempts(userAddress) {
        const maxFailedAttempts = 3;
        const failedAttempts = [...this.accessLog].filter(log => log.userAddress === userAddress && !log.success);
        if (failedAttempts.length >= maxFailedAttempts) {
            console.warn(`User ${userAddress} has exceeded the maximum failed attempts`);
            return true;
        }
        return false;
    }
    logAccessAttempt(userAddress, success) {
        const timestamp = new Date();
        this.accessLog.push({ userAddress, success, timestamp });
        console.log(`Access attempt by ${userAddress} at ${timestamp}: ${success ? 'Authorized' : 'Denied'}`);
    }
    getAccessLog() {
        return this.accessLog;
    }
    async assignUserRole(userAddress, role) {
        try {
            const isAuthorized = await this.contract.authenticateUser(userAddress);
            if (!isAuthorized) {
                throw new Error('User is not authorized to be assigned a role');
            }

            const validRoles = ['admin', 'editor', 'viewer'];
            if (!validRoles.includes(role)) {
                throw new Error('Invalid role assignment');
            }

            this.logRoleAssignment(userAddress, role);
            return `Role ${role} assigned to ${userAddress}`;
        } catch (error) {
            console.error(`Error assigning role: ${error.message}`);
            throw new Error('Failed to assign role');
        }
    }
    logRoleAssignment(userAddress, role) {
        const timestamp = new Date();
        this.roleLog.push({ userAddress, role, timestamp });
        console.log(`Role ${role} assigned to ${userAddress} at ${timestamp}`);
    }
    getRoleLog() {
        return this.roleLog;
    }
    getUsersWithFailedAttempts() {
        return [...this.usersWithFailedAttempts];
    }
    resetFailedAttempts(userAddress) {
        this.usersWithFailedAttempts.delete(userAddress);
        console.log(`Failed attempts reset for ${userAddress}`);
    }
    async notifyAdminsOnFailedAttempts(userAddress) {
        if (await this.checkFailedAttempts(userAddress)) {
            console.warn(`Alert: User ${userAddress} has exceeded failed access attempts`);

        }
    }
    async lockUserAccount(userAddress) {
        if (await this.checkFailedAttempts(userAddress)) {
            console.warn(`User ${userAddress} is locked due to excessive failed attempts`);

            this.resetFailedAttempts(userAddress);
            throw new Error('User account locked due to suspicious activity');
        }
        return true;
    }
    async resetUserAccessLog(userAddress) {
        this.accessLog = this.accessLog.filter(log => log.userAddress !== userAddress);
        console.log(`Access log reset for ${userAddress}`);
        return `Access log for ${userAddress} has been reset`;
    }
    async grantTemporaryAccess(userAddress, duration) {
        try {
            const isAuthorized = await this.contract.authenticateUser(userAddress);
            if (!isAuthorized) {
                throw new Error('User not authorized for temporary access');
            }

            const expirationTimestamp = Date.now() + duration;
            console.log(`Temporary access granted to ${userAddress} until ${new Date(expirationTimestamp)}`);
            return expirationTimestamp;
        } catch (error) {
            console.error(`Error granting temporary access: ${error.message}`);
            throw new Error('Failed to grant temporary access');
        }
    }
}

module.exports = SDNAuthentication;
