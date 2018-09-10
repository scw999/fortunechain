3. Design Pattern
  1) circuit breaker
  
--> this design patten used at FortuneChain.sol
  
      * circuit breaker - In emergency situation, question updating should be stopped due to bounty price
  
      * circuit breaker - In emergency situation, solutioner registration should be stopped due to entry fee
  
      * circuit breaker - In emergency situation, accept solution should be stopped due to bounty price and commission 
   
      * circuit breaker - In emergency situation, accept solution should be stopped due to bounty price


    function dismissQuestion(uint _qId) public payable onlyQuestioner(_qId) stopInEmergency { 


    function controlCircuitBreaker(bool _set) public onlyOwner returns(bool) {
        stopped = _set;
        return stopped;
    }


  2) state machine 

--> this design patten used at FortuneChain.sol

Qstate : Set -> Pending -> offered -> Accepted or Rejected -> Dismissed

refer readme.md. 
  
  3) restricted 
 --> this design patten used at FortuneChain.sol as below 
  

modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can call this");
        _;
    }

    modifier onlyQuestioner(uint _qId) {
        require(msg.sender == questionToOwner[_qId], "Only asked Questioner for this question can call this");
        _;
    }

    modifier notQuestioner(uint _qId) {
        require(msg.sender != questionToOwner[_qId], "Questioner can not register as own question's solutionist");
        _;
    }

    modifier onlySolutionist(uint _qId) {
        require(msg.sender == solutions[_qId].solutionistAddress, "Only registered Solutionist for this question can call this");
        _;
    }

    modifier stopInEmergency {
        require(!stopped, "This is emergency situation therefore this function is stopped");
        _;
    }

    modifier onlyInEmergency {
        require(stopped, "This function only available at emergency situation");
        _;
    }

    constructor() public payable{
        owner = msg.sender;
    } 
  
  4) mortal
 --> this design patten used at FortuneChain.sol as below
 
    function kill() public onlyOwner onlyInEmergency {
        selfdestruct(owner);
    }

  5) speed bumper

--> speed bumber design pattern is not used due to time not critical project


}
