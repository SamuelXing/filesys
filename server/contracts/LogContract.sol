pragma solidity ^0.4.17;

contract LogContract
{
    struct Record
    {
        bytes32 timestamp_;
        bytes32 username_;
        bytes32 content_;
    }

    Record[] log;

    function addARecord(bytes32 timestamp, bytes32 username, bytes32 content) public returns(uint)
    {
        Record memory rc;
        rc.timestamp_ = timestamp;
        rc.username_ = username;
        rc.content_ = content;
        log.push(rc);
        return log.length;
    }

    function getLogCount() public view returns(uint)
    {
        return log.length;
    }

    function getARecord(uint index) public view returns(bytes32, bytes32, bytes32)
    {
        assert(index < log.length);
        return (log[index].timestamp_, log[index].username_, log[index].content_);
    }
}