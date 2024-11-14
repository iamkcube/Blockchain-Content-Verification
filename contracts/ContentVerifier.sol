// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ContentRegistry {
    struct Content {
        uint256 timestamp;
        string username;
        string contentHash; // Adding contentHash member
    }

    mapping(bytes32 => Content) public contentMap;
    mapping(bytes32 => Content[]) public ownershipHistory; // Mapping to store ownership history

    bytes32[] public contentHashKeys; // Array to store hash keys of existing content

    event ContentRegistered(string hashKey, string username, uint256 timestamp);
    event ContentModified(string hashKey, string username, uint256 timestamp);

    function registerContent(
        string memory _hashKey,
        string memory _username,
        string memory _contentHash,
        uint256 _timestamp
    ) external {
        require(bytes(_hashKey).length > 0, "Hash key must not be empty");
        require(bytes(_username).length > 0, "Username must not be empty");
        require(
            bytes(_contentHash).length > 0,
            "Content hash must not be empty"
        );

        bytes32 hashKeyBytes = keccak256(abi.encodePacked(_hashKey));
        require(
            contentMap[hashKeyBytes].timestamp == 0,
            "Content already registered"
        );

        contentMap[hashKeyBytes] = Content(_timestamp, _username, _contentHash);
        ownershipHistory[hashKeyBytes].push(
            Content(_timestamp, _username, _contentHash)
        ); // Store ownership history
        contentHashKeys.push(hashKeyBytes); // Add hash key to array
        emit ContentRegistered(_hashKey, _username, _timestamp);
    }

    // function modifyContent(string memory _hashKey, string memory _newContentHash, string memory _username, uint256 _timestamp) external {
    //     require(bytes(_hashKey).length > 0, "Hash key must not be empty");
    //     require(bytes(_newContentHash).length > 0, "New content hash must not be empty");

    //     bytes32 hashKeyBytes = keccak256(abi.encodePacked(_hashKey));
    //     require(contentMap[hashKeyBytes].timestamp != 0, "Content not found");

    //     require(keccak256(abi.encodePacked(contentMap[hashKeyBytes].username)) == keccak256(abi.encodePacked(_username)),
    //         "Only the owner can modify the content");

    //     contentMap[hashKeyBytes].timestamp = _timestamp;
    //     contentMap[hashKeyBytes].contentHash = _newContentHash;
    //     ownershipHistory[hashKeyBytes].push(Content(_timestamp, _username, _newContentHash)); // Update ownership history
    //     emit ContentModified(_hashKey, _username, _timestamp);
    // }

    function modifyContent(
        string memory _hashKey,
        string memory _newContentHash,
        string memory _username,
        uint256 _timestamp
    ) external {
        require(bytes(_hashKey).length > 0, "Hash key must not be empty");
        require(
            bytes(_newContentHash).length > 0,
            "New content hash must not be empty"
        );

        bytes32 hashKeyBytes = keccak256(abi.encodePacked(_hashKey));
        require(contentMap[hashKeyBytes].timestamp != 0, "Content not found");

        require(
            keccak256(abi.encodePacked(contentMap[hashKeyBytes].username)) ==
                keccak256(abi.encodePacked(_username)),
            "Only the owner can modify the content"
        );

        // Log debug information
        emit DebugModifyContent("Hash key: ", _hashKey);
        emit DebugModifyContent(
            "Existing content hash: ",
            contentMap[hashKeyBytes].contentHash
        );
        emit DebugModifyContent("New content hash: ", _newContentHash);

        // Update content hash
        contentMap[hashKeyBytes].timestamp = _timestamp;
        contentMap[hashKeyBytes].contentHash = _newContentHash;

        // Log success message
        emit ContentModified(_hashKey, _username, _timestamp);
    }

    // Event for debugging purposes
    event DebugModifyContent(string message, string value);

    function verifyContent(
        string memory _hashKey
    )
        external
        view
        returns (string memory, string memory, uint256, string memory)
    {
        require(bytes(_hashKey).length > 0, "Hash key must not be empty");

        bytes32 hashKeyBytes = keccak256(abi.encodePacked(_hashKey));
        Content memory content = contentMap[hashKeyBytes];

        if (content.timestamp == 0) {
            return ("Invalid content", "", 0, "");
        } else {
            return (
                _hashKey,
                content.username,
                content.timestamp,
                content.contentHash
            );
        }
    }

    function getExistingContentHashKeys()
        external
        view
        returns (bytes32[] memory)
    {
        return contentHashKeys;
    }
}