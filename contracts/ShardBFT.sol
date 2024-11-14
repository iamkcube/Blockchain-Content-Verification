// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ShardBFT {
    mapping(address => bool) public validNodes;
    uint public shardId;
    uint public quorum;
    address[] public validators;
    address public admin;

    event NodeRegistered(address indexed node);
    event NodeRemoved(address indexed node);
    event QuorumUpdated(uint quorum);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor(uint _shardId, uint _quorum) {
        shardId = _shardId;
        quorum = _quorum;
        admin = msg.sender;
        emit AdminTransferred(address(0), admin);
    }

    modifier onlyValidNode() {
        require(validNodes[msg.sender], "Only valid nodes can perform this action");
        _;
    }

    function registerNode(address node) public onlyAdmin {
        require(node != address(0), "Cannot register the zero address");
        require(!validNodes[node], "Node is already registered");

        validNodes[node] = true;
        validators.push(node);
        emit NodeRegistered(node);
    }

    function removeNode(address node) public onlyAdmin {
        require(validNodes[node], "Node is not registered");

        validNodes[node] = false;
        emit NodeRemoved(node);
    }

    function isValidNode(address node) public view returns (bool) {
        return validNodes[node];
    }

    function setQuorum(uint _quorum) public onlyAdmin {
        require(_quorum > 0, "Quorum must be greater than 0");
        quorum = _quorum;
        emit QuorumUpdated(_quorum);
    }

    function reachQuorum() public view returns (bool) {
        uint count = 0;
        for (uint i = 0; i < validators.length; i++) {
            if (validNodes[validators[i]]) {
                count++;
            }
        }
        return count >= quorum;
    }

    function getValidators() public view returns (address[] memory) {
        return validators;
    }

    function transferAdmin(address newAdmin) public onlyAdmin {
        require(newAdmin != address(0), "New admin cannot be the zero address");
        address previousAdmin = admin;
        admin = newAdmin;
        emit AdminTransferred(previousAdmin, newAdmin);
    }
}
