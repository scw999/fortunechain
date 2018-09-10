var FortuneChain = artifacts.require("./FortuneChain.sol");

contract('FortuneChain', function(accounts){
    var fortuneChainInstance;
    
    it("Contrant owner initialize testing", function(){
        return FortuneChain.deployed().then(function(instance){
            fortuneChainInstance = instance;
            return fortuneChainInstance.owner.call();
        }).then(function(owner){
            assert.equal(owner.toUpperCase(), accounts[0].toUpperCase(), "owner is not matched with Ganache first account");
        });
    });

    it("setBountyQuestions: Ganache second account set a new question with question information", function(){
        return FortuneChain.deployed().then(function(instance){
            fortuneChainInstance = instance;
            return fortuneChainInstance.setBountyQuestions("James born", 1, 19840205, "what is money?", 1000000000000000000, 1, {from: accounts[1], value: web3.toWei(1.0, "ether")});
        }).then(function(receipt){
        assert.equal(receipt.logs.length, 1, "first event is not created");
        assert.equal(receipt.logs[0].event, "LogQuestionUpdate", "event is not LogQuestionUpdate");
        assert.equal(receipt.logs[0].args.qId, 0, "question id is not 0");
        assert.equal(receipt.logs[0].args.questionCount, 1, "All question count is not 1");
        assert.equal(receipt.logs[0].args.qType, 1, "question type is not 1 (about money)");
        assert.equal(receipt.logs[0].args.bountyPrice, 1000000000000000000, "Bounty price is not matched with 1 ETH");
        assert.equal(receipt.logs[0].args.questionContents, "what is money?", "question content not matched");
        assert.equal(receipt.logs[0].args.questionState, 1, "question state is not set");
        assert.equal(receipt.logs[0].args.questionOwnerAddress, accounts[1], "account is not matched");
        });
    });

    it("regSolutionist: Ganache third account set a solutionist for the first question, it should pay 1% of entry fee", function(){
        return FortuneChain.deployed().then(function(instance){
            fortuneChainInstance = instance;
            return fortuneChainInstance.regSolutionist(0, {from: accounts[2], value: web3.toWei(0.01, "ether")});
        }).then(function(receipt){
        assert.equal(receipt.logs.length, 1, "first event is not created");
        assert.equal(receipt.logs[0].event, "LogQuestionUpdate", "event is not LogQuestionUpdate");
        assert.equal(receipt.logs[0].args.qId, 0, "question id is not 0");
        assert.equal(receipt.logs[0].args.questionCount, 1, "All question count is not 1");
        assert.equal(receipt.logs[0].args.questionState, 2, "question state is not sonlution pending");
        assert.equal(receipt.logs[0].args.solutionistAddress, accounts[2], "account is not matched");
        });
    });

    it("offerSolution: Ganache third account offer a solution for the first question", function(){
        return FortuneChain.deployed().then(function(instance){
            fortuneChainInstance = instance;
            return fortuneChainInstance.offerSolution(0, "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Sa, there live the blind texts. Separated they live in Bookmarksgroveeparated they live in Bookmarksgrove", {from: accounts[2], value: web3.toWei(0, "ether"), gas:300000});
        }).then(function(receipt){
        assert.equal(receipt.logs[0].event, "LogSolutionOffered", "first event is not LogSolutionOffered");
        assert.equal(receipt.logs[0].args.qId, 0, "question id is not 0");
        assert.equal(receipt.logs[0].args.questionOwnerAddress, accounts[1], "Question owener address not matched");
        assert.equal(receipt.logs[0].args.solutionDemo,"Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live t", "Question owener address not matched");
        assert.equal(receipt.logs[1].event, "LogQuestionUpdate", "second event is not LogQuestionUpdate");
        assert.equal(receipt.logs[1].args.qId, 0, "question id is not 0");
        assert.equal(receipt.logs[1].args.questionState, 3, "question state is not offered");
        assert.equal(receipt.logs[1].args.solutionistAddress, accounts[2], "solutionist account is not matched");
        });
    });
    
    it("rejectSolution: Ganache second account reject the solution for the first question", function(){
        return FortuneChain.deployed().then(function(instance){
            fortuneChainInstance = instance;
            return fortuneChainInstance.rejectSolution(0, {from: accounts[1], value: web3.toWei(0, "ether"), gas:300000});
        }).then(function(receipt){
        assert.equal(receipt.logs.length, 1, "first event is not created");
        assert.equal(receipt.logs[0].event, "LogQuestionUpdate", "second event is not LogQuestionUpdate");
        assert.equal(receipt.logs[0].args.qId, 0, "question id is not 0");
        assert.equal(receipt.logs[0].args.questionCount, 1, "All question count is not 1");
        assert.equal(receipt.logs[0].args.questionCount, 1, "All question count is not 1");
        assert.equal(receipt.logs[0].args.questionState, 5, "question state is not rejected");
        assert.equal(receipt.logs[0].args.questionOwnerAddress, accounts[1], "account is not matched");
        assert.equal(receipt.logs[0].args.solutionistAddress, 0x0000000000000000000000000000000000000000, "solutionist account is not matched");
        });
    });

    it("setBountyQuestions 2: Ganache fourth account set a new question with question information", function(){
        return FortuneChain.deployed().then(function(instance){
            fortuneChainInstance = instance;
            return fortuneChainInstance.setBountyQuestions("Amy Doe", 2, 19890912, "where is true love?", 1200000000000000000, 2, {from: accounts[3], value: web3.toWei(1.2, "ether")});
        }).then(function(receipt){
        assert.equal(receipt.logs.length, 1, "first event is not created");
        assert.equal(receipt.logs[0].event, "LogQuestionUpdate", "event is not LogQuestionUpdate");
        assert.equal(receipt.logs[0].args.qId, 1, "question id is not 1");
        assert.equal(receipt.logs[0].args.questionCount, 2, "All question count is not 2");
        assert.equal(receipt.logs[0].args.qType, 2, "question type is not 2 (about love)");
        assert.equal(receipt.logs[0].args.bountyPrice, 1200000000000000000, "Bounty price is not matched to 1.2 ETH");
        assert.equal(receipt.logs[0].args.questionContents, "where is true love?", "question content not matched");
        assert.equal(receipt.logs[0].args.questionState, 1, "question state is not set");
        assert.equal(receipt.logs[0].args.questionOwnerAddress, accounts[3], "account is not matched");
        });
    });


    it("regSolutionist: Ganache fifth account set a solutionist for the second question, it should pay 1% of entry fee", function(){
        return FortuneChain.deployed().then(function(instance){
            fortuneChainInstance = instance;
            return fortuneChainInstance.regSolutionist(1, {from: accounts[4], value: web3.toWei(0.012, "ether")});
        }).then(function(receipt){
        assert.equal(receipt.logs.length, 1, "first event is not created");
        assert.equal(receipt.logs[0].event, "LogQuestionUpdate", "event is not LogQuestionUpdate");
        assert.equal(receipt.logs[0].args.qId, 1, "question id is not 1");
        assert.equal(receipt.logs[0].args.questionCount, 2, "All question count is not 2");
        assert.equal(receipt.logs[0].args.questionState, 2, "question state is not solution pending");
        assert.equal(receipt.logs[0].args.solutionistAddress, accounts[4], "account is not matched");
        });

    });

    it("getFullQuestionInfo: Ganache fifth account get full informtation of second question", function(){
        return FortuneChain.deployed().then(function(instance){
            fortuneChainInstance = instance;
            return fortuneChainInstance.getFullQuestionInfo(1, {from: accounts[4], value: web3.toWei(0, "ether")});
        }).then(function(QuestionInfo){
            assert.equal(QuestionInfo[0], 1, "Question id is not matched with 1");
            assert.equal(web3.toAscii(QuestionInfo[1]).replace(/\0/g,''),"Amy Doe", "Questioner name is not matched with Amy Doe ");
            assert.equal(QuestionInfo[2], 2, "Question category is not matched with 'Love' ");
            assert.equal(QuestionInfo[3], 19890912, "Questioner date of birth is not matched with '19890912' ");
            assert.equal(QuestionInfo[4], 1200000000000000000, "Question bounty price is not matched with 1.2 ETH ");
            assert.equal(QuestionInfo[5], "where is true love?", "Question contents not matched ");
            assert.equal(QuestionInfo[6], 2, "Questioner gender is not matched");
            assert.equal(QuestionInfo[7], 50, "Commition rate is not matched");
        });
    });
        

    it("offerSolution: Ganache fifth account offer a solution for the second question", function(){
        return FortuneChain.deployed().then(function(instance){
            fortuneChainInstance = instance;
            return fortuneChainInstance.offerSolution(1, "One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly", {from: accounts[4], value: web3.toWei(0, "ether"), gas:300000});
        }).then(function(receipt){
        assert.equal(receipt.logs[0].event, "LogSolutionOffered", "first event is not LogSolutionOffered");
        assert.equal(receipt.logs[0].args.qId, 1, "question id is not 1");
        assert.equal(receipt.logs[0].args.questionOwnerAddress, accounts[3], "Question owener address not matched");
        assert.equal(receipt.logs[0].args.solutionDemo,"One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed int", "Question owener address not matched");
        assert.equal(receipt.logs[1].event, "LogQuestionUpdate", "second event is not LogQuestionUpdate");
        assert.equal(receipt.logs[1].args.qId, 1, "question id is not 1");
        assert.equal(receipt.logs[1].args.questionState, 3, "question state is not offered");
        assert.equal(receipt.logs[1].args.solutionistAddress, accounts[4], "solutionist account is not matched");
        });
    });

    it("acceptSolution: Ganache fourth account accept the solution for the second question", function(){
        return FortuneChain.deployed().then(function(instance){
            fortuneChainInstance = instance;
            return fortuneChainInstance.acceptSolution(1, {from: accounts[3], value: web3.toWei(0, "ether")});
        }).then(function(receipt){
        assert.equal(receipt.logs.length, 1, "first event is not created");
        assert.equal(receipt.logs[0].event, "LogQuestionUpdate", "event is not LogQuestionUpdate");
        assert.equal(receipt.logs[0].args.qId, 1, "question id is not 1");
        assert.equal(receipt.logs[0].args.questionCount, 2, "All question count is not 2");
        assert.equal(receipt.logs[0].args.questionState, 4, "question state is not solution accepted ");
        assert.equal(receipt.logs[0].args.solutionistAddress, accounts[4], "account is not matched");
        });
    });

    it("getFullSolution: Ganache fourth account get full solution of second question", function(){
        return FortuneChain.deployed().then(function(instance){
            fortuneChainInstance = instance;
            return fortuneChainInstance.getFullSolution(1, {from: accounts[3], value: web3.toWei(0, "ether")});
        }).then(function(SolutionInfo){
            assert.equal(SolutionInfo, "One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly", "Solution conetents is not matched");
        });
    });

    it("dismissQuestion: Ganache second account accept the solution for the second question", function(){
        return FortuneChain.deployed().then(function(instance){
            fortuneChainInstance = instance;
            return fortuneChainInstance.dismissQuestion(0, {from: accounts[1], value: web3.toWei(0, "ether")});
        }).then(function(receipt){
        assert.equal(receipt.logs.length, 1, "first event is not created");
        assert.equal(receipt.logs[0].event, "LogQuestionUpdate", "event is not LogQuestionUpdate");
        assert.equal(receipt.logs[0].args.qId, 0, "question id is not 0");
        assert.equal(receipt.logs[0].args.questionCount, 2, "All question count is not 2");
        assert.equal(receipt.logs[0].args.questionState, 6, "question state is not dismissed ");
        assert.equal(receipt.logs[0].args.questionOwnerAddress, accounts[1], "account is not matched");
        });
    });
});

