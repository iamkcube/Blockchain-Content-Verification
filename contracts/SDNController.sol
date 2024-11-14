// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SDNController {
    mapping(address => bool) public authorizedUsers;
    address public admin;
    uint256 public userCount;

    event UserAdded(address indexed user);
    event UserRemoved(address indexed user);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);
    event UserAuthenticationAttempt(address indexed user, bool isAuthenticated);

    constructor() {
        admin = msg.sender;
        userCount = 0;
        emit AdminTransferred(address(0), admin);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Access restricted to admin");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedUsers[msg.sender], "Access restricted to authorized users");
        _;
    }

    function addUser(address user) public onlyAdmin {
        require(user != address(0), "Invalid address");
        require(!authorizedUsers[user], "User is already authorized");
        
        authorizedUsers[user] = true;
        userCount++;
        emit UserAdded(user);
    }

    function removeUser(address user) public onlyAdmin {
        require(authorizedUsers[user], "User not found");
        
        authorizedUsers[user] = false;
        userCount--;
        emit UserRemoved(user);
    }

    function authenticateUser(address user) public view returns (bool) {
        bool isAuthenticated = authorizedUsers[user];
        emit UserAuthenticationAttempt(user, isAuthenticated);
        return isAuthenticated;
    }

    function transferAdmin(address newAdmin) public onlyAdmin {
        require(newAdmin != address(0), "New admin cannot be the zero address");
        address previousAdmin = admin;
        admin = newAdmin;
        emit AdminTransferred(previousAdmin, newAdmin);
    }

    function getAuthorizedUserCount() public view returns (uint256) {
        return userCount;
    }

    function isAdmin(address user) public view returns (bool) {
        return user == admin;
    }

    function isUserAuthorized(address user) public view returns (bool) {
        return authorizedUsers[user];
    }
}
