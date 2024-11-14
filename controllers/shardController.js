const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

class ShardController {
    constructor() {
        this.shards = {};
        this.transactionsLogPath = path.join(__dirname, 'transactions_log.json');
        this.shardLogPath = path.join(__dirname, 'shard_log.json');
        this.transactionHistory = this.loadTransactionHistory();
        this.shardHistory = this.loadShardHistory();
    }

    loadTransactionHistory() {
        try {
            if (fs.existsSync(this.transactionsLogPath)) {
                const data = fs.readFileSync(this.transactionsLogPath);
                return JSON.parse(data);
            }
            return [];
        } catch (err) {
            console.error('Error loading transaction history:', err);
            return [];
        }
    }

    loadShardHistory() {
        try {
            if (fs.existsSync(this.shardLogPath)) {
                const data = fs.readFileSync(this.shardLogPath);
                return JSON.parse(data);
            }
            return [];
        } catch (err) {
            console.error('Error loading shard history:', err);
            return [];
        }
    }

    saveTransactionHistory() {
        try {
            fs.writeFileSync(this.transactionsLogPath, JSON.stringify(this.transactionHistory, null, 2));
        } catch (err) {
            console.error('Error saving transaction history:', err);
        }
    }

    saveShardHistory() {
        try {
            fs.writeFileSync(this.shardLogPath, JSON.stringify(this.shardHistory, null, 2));
        } catch (err) {
            console.error('Error saving shard history:', err);
        }
    }

    assignNodeToShard(nodeId, region) {
        if (!this.shards[region]) {
            this.shards[region] = [];
        }
        if (this.shards[region].includes(nodeId)) {
            throw new Error(`Node ${nodeId} is already assigned to region ${region}`);
        }
        this.shards[region].push(nodeId);
        const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
        this.shardHistory.push({
            action: 'assignNode',
            nodeId,
            region,
            timestamp,
        });
        this.saveShardHistory();
        console.log(`Node ${nodeId} assigned to shard for region ${region}`);
    }

    validateTransaction(transaction) {
        if (!transaction.id) {
            throw new Error('Transaction ID is missing');
        }
        if (transaction.amount <= 0) {
            throw new Error("Invalid transaction amount");
        }
        if (!transaction.sender || !transaction.receiver) {
            throw new Error("Sender and receiver information is missing");
        }
        console.log(`Transaction ${transaction.id} validated`);
        return true;
    }

    manageCrossShardTransaction(senderShard, receiverShard, transactionData) {
        try {
            console.log(`Processing cross-shard transaction from ${senderShard} to ${receiverShard}`, transactionData);
            this.validateTransaction(transactionData);
            const transactionId = uuidv4();
            transactionData.id = transactionId;
            transactionData.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
            this.transactionHistory.push(transactionData);
            this.saveTransactionHistory();
            console.log(`Transaction from shard ${senderShard} to shard ${receiverShard} completed successfully`);
            return { status: 'success', transactionId, message: 'Transaction successful' };
        } catch (err) {
            console.error(`Error processing cross-shard transaction: ${err.message}`);
            return { status: 'failed', message: err.message };
        }
    }

    getShardStatus() {
        console.log("Shard Status Report:");
        Object.keys(this.shards).forEach(region => {
            console.log(`Region: ${region}, Nodes: ${this.shards[region].length}`);
        });
    }

    getTransactionHistory() {
        return this.transactionHistory;
    }

    getShardHistory() {
        return this.shardHistory;
    }

    logShardActivity() {
        const activityLog = {
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
            activity: 'Shard activity logged',
            shardDetails: this.shards,
        };
        fs.appendFileSync(this.shardLogPath, JSON.stringify(activityLog, null, 2) + '\n', 'utf8');
    }

    balanceShardLoad() {
        console.log('Balancing shard load...');
        const shardLoads = Object.keys(this.shards).map(region => ({
            region,
            nodeCount: this.shards[region].length,
        }));

        const totalNodes = shardLoads.reduce((sum, shard) => sum + shard.nodeCount, 0);
        const averageLoad = totalNodes / shardLoads.length;

        shardLoads.forEach(shard => {
            if (shard.nodeCount > averageLoad) {
                const excessNodes = shard.nodeCount - averageLoad;
                console.log(`Region ${shard.region} has ${excessNodes} excess nodes`);
            } else if (shard.nodeCount < averageLoad) {
                const missingNodes = averageLoad - shard.nodeCount;
                console.log(`Region ${shard.region} has ${missingNodes} missing nodes`);
            }
        });
    }
}

module.exports = new ShardController();
