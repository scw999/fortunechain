App = {
  web3Provider: null,
  contracts: {},
	
  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
	$.getJSON('FortuneChain.json', function(data) {
      App.contracts.FortuneChain = TruffleContract(data);
      App.contracts.FortuneChain.setProvider(App.web3Provider);
    });
  },

  setNewQuestion: function() {	
    var name = $('#name').val();
    var qtype = $('input[name="options"]:checked').val();
    var age = $('#age').val();
    var question = $('#question').val();
    var bounty_price = web3.toWei($('#bounty_price').val(), "ether");
    var gender = $('input[name="gender"]:checked').val();

    web3.eth.getAccounts(function(error, accounts){
      if(error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.FortuneChain.deployed().then(function(instance){
        var nameUtf8Encoded = utf8.encode(name);
        return instance.setBountyQuestions(web3.toHex(nameUtf8Encoded), qtype, age, question, bounty_price, gender, { from: account, value: bounty_price, gas:3000000 });
      }).then(function(){
        $('#name').val('');
        $('#age').val('');
        $('#question').val('');
        $('#bounty_price').val('');
        $('#buyModal').modal('hide');
        location.href='question_index.html';
      }).catch(function(err){
        console.log(err.message);
      });
    });
   },

  updateUserAccount: function() {	
    
    web3.eth.getAccounts(function(error, accounts){
      var account = accounts[0];
      $("#accountAddress").text(account);
    });

  }  

};

$(function() {
  $(window).load(function() {
    App.init();
    setInterval(App.updateUserAccount,100);

  });

  $('#qtype1Modal').on('show.bs.modal', function() {
  });

});
