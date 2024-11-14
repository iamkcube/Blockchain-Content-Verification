// models/ShardManagement.js

class ShardManagement {
    constructor(shardID) {
        this.shardID = shardID;
        this.nodeList = [];
        this.transactionHistory = [];
        this.nodeHealthStatus = {};
        this.transactionLogs = [];
        this.nodeStatusLogs = [];
    }

    addNode(node) {
        if (this.nodeList.includes(node)) {
            throw new Error("Node already exists in this shard");
        }
        this.nodeList.push(node);
        this.nodeHealthStatus[node] = 'Healthy';
        this.logNodeStatus(node, 'Added');
        console.log(`Node ${node} added to shard ${this.shardID}`);
    }

    removeNode(node) {
        const index = this.nodeList.indexOf(node);
        if (index === -1) {
            throw new Error("Node not found in shard");
        }
        this.nodeList.splice(index, 1);
        delete this.nodeHealthStatus[node];
        this.logNodeStatus(node, 'Removed');
        console.log(`Node ${node} removed from shard ${this.shardID}`);
    }

    updateNodeHealth(node, status) {
        if (!this.nodeList.includes(node)) {
            throw new Error("Node not found in shard");
        }
        this.nodeHealthStatus[node] = status;
        this.logNodeStatus(node, status);
        console.log(`Node ${node} health status updated to ${status}`);
    }

    addTransaction(transaction) {
        if (!transaction.id || !transaction.timestamp) {
            throw new Error("Transaction is missing required fields");
        }
        this.transactionHistory.push(transaction);
        this.logTransaction(transaction);
        console.log(`Transaction ${transaction.id} added to shard ${this.shardID}`);
    }

    getTransactionHistory() {
        return this.transactionHistory;
    }

    getNodeHealthStatus() {
        return this.nodeHealthStatus;
    }

    getNodeStatus(node) {
        if (!this.nodeList.includes(node)) {
            throw new Error("Node not found in shard");
        }
        return this.nodeHealthStatus[node];
    }

    logTransaction(transaction) {
        const logEntry = {
            id: transaction.id,
            timestamp: transaction.timestamp,
            type: transaction.type,
            status: transaction.status
        };
        this.transactionLogs.push(logEntry);
        console.log(`Transaction log added for transaction ID ${transaction.id}`);
    }

    logNodeStatus(node, status) {
        const logEntry = {
            node: node,
            status: status,
            timestamp: new Date().toISOString()
        };
        this.nodeStatusLogs.push(logEntry);
        console.log(`Node status log added for node ${node} with status ${status}`);
    }

    getNodeStatusLogs() {
        return this.nodeStatusLogs;
    }

    getTransactionLogs() {
        return this.transactionLogs;
    }

    isShardOperational() {
        const unhealthyNodes = Object.keys(this.nodeHealthStatus).filter(
            node => this.nodeHealthStatus[node] !== 'Healthy'
        );
        if (unhealthyNodes.length > 0) {
            console.warn(`Shard ${this.shardID} is not fully operational. Unhealthy nodes: ${unhealthyNodes.join(', ')}`);
            return false;
        }
        console.log(`Shard ${this.shardID} is fully operational`);
        return true;
    }

    getShardStatusSummary() {
        const operationalStatus = this.isShardOperational() ? 'Operational' : 'Non-operational';
        const summary = {
            shardID: this.shardID,
            nodeCount: this.nodeList.length,
            operationalStatus: operationalStatus,
            unhealthyNodes: Object.keys(this.nodeHealthStatus).filter(node => this.nodeHealthStatus[node] !== 'Healthy'),
            transactionCount: this.transactionHistory.length,
            nodeHealthStatus: this.nodeHealthStatus
        };
        return summary;
    }
}

module.exports = ShardManagement;
