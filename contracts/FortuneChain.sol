pragma solidity ^0.4.23;
import "./SafeMath.sol";


/**
 * @title FortuneChain
 * @dev Bounty question and hunting solution system using tarot cards which is selected by calculated at smart contract
 */

contract FortuneChain {

    using SafeMath for uint;

//address questionerAddress
//bytes32 name
//uint qType = 1: Money, 2: Love, 3:Health, 4: Work
//uint dateOfBirth
//uint bountyPrice
//string questionContents
//uint questionState = 1: Question set, 2: Solutionist listed and solution pending, 3: Solution offered, 4: Solution accepted, 5: Solution rejected, 6: Question dismissed
//uint8 gender = 1: man, 2:woman
    struct Question {
        address questionerAddress;
        bytes32 name;
        uint qType;
        uint dateOfBirth;
        uint bountyPrice;
        string questionContents;
        uint8 gender;
    }

    struct Solution{
        address solutionistAddress;
        string solutionContents;
        uint solutionGrade;
    }

    struct Solutionist{
        address solutionistAddress;
        uint level;
        uint averageWGrade; //weighted(by ether value) average grade
        uint totEarn;
        uint totGradedEarn; //total earn which is summation of only grade given solution
        uint totSumWGrade;  //total weighted(by ether value) grade 
    }

    Question[] public questions;
    enum QState { Init, Set, Pending, Offered, Accepted, Rejected, Dismissed }
    
    mapping (address => Solutionist) public solutionists; //for solutionist level
    mapping (uint => Solution) solutions;
    mapping (uint => address) public questionToOwner;
    mapping (address => uint) OwnerQuestionCount;
    mapping (uint => uint) balance;
    mapping (uint => uint) startFromReg;
    mapping (uint => QState) questionState;
  
    uint AllQuestionCount;
    
    /* set up values controled by owner */
    uint public feeRate = 1; // first feerate is 1%
    uint public demoCharactor = 100; //the number of character of demo solution
    uint public commissionRate = 50; //first commission rate 50%
    address public owner;
    bool public stopped = false; //for circuit breaking

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

    event LogQuestionUpdate(
        uint qId,
        uint questionCount,
        uint qType,
        uint bountyPrice,
        string questionContents,
        QState questionState,
        address questionOwnerAddress,
        address solutionistAddress,
        uint[6] tarotCardNums
    );

    event LogSolutionOffered(
        uint qId,
        address questionOwnerAddress,
        string solutionDemo
    );

    constructor() public payable{
        owner = msg.sender;
    }

    /* Question state : Set */
    /** @dev for setting a new question by questioner. with input question information, calculates tarot card number 
      * this function's input value is written by questioner at Fortune Chain web service
      * @param _name questioner name
      * @param _qType question category; 1: Money, 2: Love, 3:Health, 4: Work
      * @param _dateOfBirth questioner date of birth ex) 19800315
      * @param _questionContents question detailed contents 
      * @param _bountyPrice question bounty price 
      * @param _gender questioner gender; 1: man, 2: woman
      * circuit breaker - In emergency situation, question updating should be stopped due to bounty price
     */
    function setBountyQuestions(bytes32 _name, uint _qType, uint _dateOfBirth, string _questionContents, uint _bountyPrice, uint8 _gender) public payable stopInEmergency {
        require(msg.value == _bountyPrice, "Your suggested bounty price is needed to transfer for setting your question");
        uint qId = questions.push(Question(msg.sender, _name, _qType, _dateOfBirth, _bountyPrice, _questionContents, _gender)) - 1;
        uint[6] memory tarotCardNums;

        questionToOwner[qId] = msg.sender;
        OwnerQuestionCount[msg.sender] = OwnerQuestionCount[msg.sender].add(1);
        questionState[qId] = QState.Set;

        AllQuestionCount = AllQuestionCount.add(1);
        
        balance[qId] = balance[qId].add(msg.value); //deposit question bounty

        //six card from european caltic cross spread of classic tarot
        tarotCardNums[0] = (uint(_name).add(block.timestamp)).mod(78);                               //  present mind status
        tarotCardNums[1] = (_dateOfBirth.add(uint(msg.sender)).add(msg.sender.balance)).mod(78);     //  related past
        tarotCardNums[2] = (_qType.add(uint(block.coinbase)).add(qId)).mod(78);                      //  conscious hope
        tarotCardNums[3] = (_bountyPrice.add(block.number)).mod(78);                                 //  subconscious hope
        tarotCardNums[4] = (_gender * (block.difficulty).add(gasleft())).mod(78);                    //  main advice
        tarotCardNums[5] = (stringToUint(_questionContents).add(uint(blockhash(block.number))).add(qId)) % 78;      //  future and result

        emit LogQuestionUpdate(qId, AllQuestionCount, _qType, _bountyPrice, _questionContents,  questionState[qId], questionToOwner[qId], 0, tarotCardNums);
    }  

    /** @dev for tarot card selected number calculation string information convert to integer
      * @param cString string data input
      * @return cResult converted integer from string
     */
    function stringToUint(string cString) public pure returns(uint cResult) {
        bytes memory base = bytes(cString);
        for (uint i = 0; i < base.length; i++){
            uint convert = uint(base[i]);
            if (convert >= 48 && convert <= 57){
                cResult = cResult * 10 + (convert - 48);
            }           
        }
    } 

    /* Question state : Set -> Solution Pending */
    /** @dev Regists as solutionist for qId's question. the question owned questioner account can not regist as a solutionist
      * @param _qId question id input for registering
      * Info : - When question is only set and rejected state then question is ready to get solitionist
      *        - Only one account can be registered at a question as a solutionist. but when questioner reject solutions then other solutionists has a change
      *        - when regsiter is done, solutionits can read full questioner information
      * circuit breaker - In emergency situation, solutioner registration should be stopped due to entry fee
     */ 
    function regSolutionist(uint _qId) public payable notQuestioner(_qId) stopInEmergency {
        Solution storage thisSolution = solutions[_qId];
        uint[6] memory tarotCardNums;
        require((questionState[_qId] == QState.Set) || (questionState[_qId] == QState.Rejected), "Question state is not acceptable for a new solutionist");
        require(msg.value == questions[_qId].bountyPrice * feeRate/100, "Check fee rate of bounty price of this quetion is needed for registration as a solutionist");

        //This mediation fee should be 1% from bountyPrice set by changeFeeRate function by only owner
        owner.transfer(questions[_qId].bountyPrice * feeRate/100); 
        questionState[_qId] = QState.Pending;
        thisSolution.solutionistAddress = msg.sender;

        //solutionist address is only valid within 3days from registered. after then Questioner can reject 
        startFromReg[_qId] = now; 

        emit LogQuestionUpdate(_qId, AllQuestionCount, 0, 0, "0",  questionState[_qId], questionToOwner[_qId], thisSolution.solutionistAddress, tarotCardNums);
    }

    /* Question state : Solution Pending -> Solution offered */
    /** @dev solution offered by registered solutionist of this question
      * @param _qId question id input for solution offering
      * @param _solutionContents solutionist's input full solution
      * @return solutionDemo before accept solution, questioner only can read some part of the offered solution
      * Info : - When question is only pending state then registered solutionist can offer solution
      *        - only registered solutionist can call this function
      *        - offer solution does not need to send ETH, only gas price is needed due to string
      *        - questioner can check solution demo and solutionits level and average grade for refer to accept
     */
    function offerSolution(uint _qId, string _solutionContents) public payable onlySolutionist(_qId) returns(string) {
        Solution storage thisSolution = solutions[_qId];
        bytes memory solutionDemo = new bytes(demoCharactor+1);
        uint[6] memory tarotCardNums;

        require(questionState[_qId] == QState.Pending, "Question state is not ready to accept solution");
        require(bytes(_solutionContents).length >= demoCharactor, "Solution text should be larger than minimum text length, pleas check page");
        questionState[_qId] = QState.Offered;
        thisSolution.solutionContents = _solutionContents;

        for(uint i = 0; i <= demoCharactor; i++){ //20글자 이상 쓰라고 해야함
            solutionDemo[i] = bytes(_solutionContents)[i];
        }

        emit LogSolutionOffered(_qId, questionToOwner[_qId], string(solutionDemo));
        emit LogQuestionUpdate(_qId, AllQuestionCount, 0, 0, "0",  questionState[_qId], questionToOwner[_qId], thisSolution.solutionistAddress, tarotCardNums);
        return string(solutionDemo);
    }

    /* Question state : Solution offered -> Solution reject */
    /** @dev solution rejected by the question's own questioner
      * @param _qId question id input for solution rejecting and set question again 
      * Info : - when Questioner get bad solution, questioner can reject solution and clear solutionist address 
      *        - then question reset and get ready to other solutionists.
     */ 
    function rejectSolution(uint _qId) public onlyQuestioner(_qId) { 
        Solution storage thisSolution = solutions[_qId];
        uint[6] memory tarotCardNums;

        require(questionState[_qId] == QState.Offered, "Solution rejecting can be only solution offered state from valid solutionist");
        questionState[_qId] = QState.Rejected;
        thisSolution.solutionistAddress = 0x0000000000000000000000000000000000000000; //reset address
        thisSolution.solutionContents = ""; //reset solution contents
        
        emit LogQuestionUpdate(_qId, AllQuestionCount, 0, 0, "0",  questionState[_qId], questionToOwner[_qId], thisSolution.solutionistAddress, tarotCardNums);
    }

    /* Question state : Solution offered -> Solution accept */
    /** @dev solution accpeted by the question's own questioner
      * @param _qId question id input for solution accepting 
      * Info : - when Questioner get good solution, questioner can accept solution and send bounty price to the solutionist address
      *        - when Solutionist get accepted, then level of solutionist is upgraded
      * circuit breaker - In emergency situation, accept solution should be stopped due to bounty price and commission 
     */ 
    function acceptSolution(uint _qId) public payable onlyQuestioner(_qId) stopInEmergency { 
        Solution memory thisSolution = solutions[_qId];
        Solutionist storage thisSolutionist = solutionists[thisSolution.solutionistAddress];
        uint commissionFee = questions[_qId].bountyPrice * commissionRate / 100;
        uint[6] memory tarotCardNums;

        require(questionState[_qId] == QState.Offered, "Solution accepting can be only solution offered state from valid solutionist");
        questionState[_qId] = QState.Accepted;
        thisSolution.solutionistAddress.transfer(questions[_qId].bountyPrice - commissionFee); 
        owner.transfer(commissionFee); 

        thisSolutionist.level++; //solutionist level upgrade --> this needed safemath
        thisSolutionist.totEarn += (questions[_qId].bountyPrice - commissionFee); //total earn by solutionists

        emit LogQuestionUpdate(_qId, AllQuestionCount, 0, 0,"0", questionState[_qId], questionToOwner[_qId], thisSolution.solutionistAddress, tarotCardNums);
    }

    /* Question state : Set or Pending or Rejected -> Question dismissed */
    /** @dev question dismissed by the question's own questioner
      * @param _qId question id input for question dismissing
      * Info : - when Questioner change mind to cancel about bounty question, 
      *        - questioner can be dismiss question only set or pending status within 3days from solutionist regster time
      * circuit breaker - In emergency situation, accept solution should be stopped due to bounty price
     */ 
    function dismissQuestion(uint _qId) public payable onlyQuestioner(_qId) stopInEmergency { 
        Solution storage thisSolution = solutions[_qId];
        uint[6] memory tarotCardNums;

        require((questionState[_qId] == QState.Set) || (questionState[_qId] == QState.Pending) || (questionState[_qId] == QState.Rejected), "Dismiss question can be only set or pending or rejected state ");
        
        if((questionState[_qId] == QState.Set) || (questionState[_qId] == QState.Rejected)) {          
            questionState[_qId] = QState.Dismissed;
            //when reject state it was already reset registered solutionit's address and solution
        } else if(questionState[_qId] == QState.Pending) {
            require(now > startFromReg[_qId] + 3 days, "it is not yet 3 days from solutionist listed");
            questionState[_qId] = QState.Dismissed;
            thisSolution.solutionistAddress = 0x0000000000000000000000000000000000000000; //reset address
        } 
        
        msg.sender.transfer(questions[_qId].bountyPrice);  //only questioner can be payback for bounty price
 
        emit LogQuestionUpdate(_qId, AllQuestionCount, 0, 0, "0",  questionState[_qId], questionToOwner[_qId], thisSolution.solutionistAddress, tarotCardNums);
    }

    /** @dev get full solution only for the question's own questioner 
      * @param _qId question id input for get full solution
      * @return solutionContents after accept solution, only questioner can read full solution.
     */ 
    function getFullSolution(uint _qId) public view onlyQuestioner(_qId) returns(string) {    
        Solution memory thisSolution = solutions[_qId];

        require(questionState[_qId] == QState.Accepted, "Solution reading is only available for solution Accepted state from valid solutionist");      
        
        return (thisSolution.solutionContents);
    }
   
    /** @dev set solution grade by solution accepted and checked questioner 
      * @param _qId question id input for set solution grade
      * @param _solutionGrade question id input for set solution grade 0 to 5
      * @return solutionDemo before accept solution, questioner only can read some part of the offered solution.
      * Info : - Questioner can set solution grade after solution review
      *        - Solutioner Average grade is calculated by weighted of bounty price, higher bounty price affect more at average grade
      *        - therefore it is hard to control the solutionist grade due to entry and commisstion fee
     */         
    function setSolutionGrade(uint _qId, uint _solutionGrade) public onlyQuestioner(_qId) returns(uint) { 
        Solution memory thisSolution = solutions[_qId];
        Solutionist storage thisSolutionist = solutionists[thisSolution.solutionistAddress];
        uint givenGrade = _solutionGrade;
        require(questionState[_qId] == QState.Accepted, "Solution  reading can be only solution Accepted state from valid solutionist");              
        
        if (givenGrade > 5){
            givenGrade = 5;
        }

        thisSolution.solutionGrade = givenGrade; //save each solution grade

        //weighted(by ether value) average grade calculation
        thisSolutionist.totGradedEarn = thisSolutionist.totGradedEarn.add(questions[_qId].bountyPrice);
        thisSolutionist.totSumWGrade = thisSolutionist.totSumWGrade.add(givenGrade.mul(questions[_qId].bountyPrice)); //earned ether weighted only grade given by questioner
        thisSolutionist.averageWGrade = thisSolutionist.totSumWGrade.div(thisSolutionist.totGradedEarn);

        return (thisSolutionist.averageWGrade);
    }


    /* get Info */
    
     /** @dev get full question infotmation by only registered solutionist
      * @param _qId question id input for get full question information 
      * @return _qId for check question ID
      * @return _name questioner name
      * @return _qType question category; 1: Money, 2: Love, 3:Health, 4: Work
      * @return _dateOfBirth questioner date of birth ex) 19800315
      * @return _bountyPrice question bounty price 
      * @return _questionContents question detailed contents 
      * @return _gender questioner gender; 1: man, 2: woman
      * @return commissionRate to check and display commission rate
      * Info : - when regsiter is done, only registered solutionit of the question can read full questioner information for make best solutions
     */     
    function getFullQuestionInfo(uint _qId) public view onlySolutionist(_qId) returns(uint, bytes32, uint, uint, uint, string, uint8, uint) {
        Question memory fQuestionI = questions[_qId];      
        return (_qId, fQuestionI.name, fQuestionI.qType, fQuestionI.dateOfBirth, fQuestionI.bountyPrice, fQuestionI.questionContents, fQuestionI.gender, commissionRate);
    }

     /** @dev get Solutionist infotmation by checking reliability
      * @param _qId question id input for get Solutionist information
      * @return level solutionist level (How many get accepted)
      * @return averageWGrade Average weighted graded by bounty price
      * @return totEarn total earned bounty (from now on it is not displayed yet) 
      * Info : - When solution offered, questioner can check solution demo and solutionits level and average grade for refer to accept
     */     
    function getSolutionistState(uint _qId) public view returns(uint, uint, uint){
        Solution memory thisSolution = solutions[_qId];
        Solutionist memory thisSolutionist = solutionists[thisSolution.solutionistAddress];
        return (thisSolutionist.level, thisSolutionist.averageWGrade, thisSolutionist.totEarn);
    }
    
    /* fee rate */

     /** @dev changes Entry fee rate
      * @param _newFeeRate input new entry fee rate
      * @return feeRate changed fee rate
      * Info : only controlled by contract owner
     */     
    function changeFeeRate(uint _newFeeRate) public onlyOwner returns(uint) {    
        feeRate = _newFeeRate;      
        return (feeRate);
    }

     /** @dev get Entry fee rate for display to public
      * @return feeRate latest fee rate
     */     
    function getFeeRate() public view returns(uint) {
        return (feeRate);
    }

    /** @dev changes Commission Rate
      * @param _newCommissionRate input new Commission fee rate
      * @return commissionRate changed commission Rate
      * Info : only controlled by contract owner
     */     
    function changeCommissionRate(uint _newCommissionRate) public onlyOwner returns(uint) {    
        commissionRate = _newCommissionRate;      
        return (commissionRate);
    }

    /** @dev changes the number of solution demo charactor 
      * @param _newNumber input the number of solution demo charactor
      * @return demoCharactor changed the number of solution demo charactor 
      * Info : only controlled by contract owner
     */ 
    function changeDemoCharactor(uint _newNumber) public onlyOwner returns(uint) {    
        demoCharactor = _newNumber;      
        return (demoCharactor);
    }


    /* circuit break */ 

    /** @dev contract destruct
      * Info : only controlled by contract owner, and only in emergency activated
     */ 
    function kill() public onlyOwner onlyInEmergency {
        selfdestruct(owner);
    }

    /** @dev control Circuit Breaker, to activate Circuit breaker
      * @param _set input boolen to set or reset Circuit breaker
      * @return stopped circuit breaker flag
      * Info : only controlled by contract owner
     */ 
    function controlCircuitBreaker(bool _set) public onlyOwner returns(bool) {
        stopped = _set;
        return stopped;
    }


}
