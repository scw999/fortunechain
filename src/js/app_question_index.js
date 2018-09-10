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

        return App.listenToNewQEvents(); 
        
        }) 
    
    },

    updateUserAccount: function() {	
    
      web3.eth.getAccounts(function(error, accounts){
        var account = accounts[0];
        $("#accountAddress").text(account);
        
        App.updateAllStatusButtons(account);
      });
  
    },  
    
  
    registerSolutionist: function() {	
      var qId = $('#qIdRegModal').val()-1;
      var bountyPrice = $('#bountyPrice').val();
      var entryFee = web3.toWei($('#entryFee').val(), "ether");

      web3.eth.getAccounts(function(error, accounts){
        if(error) {
          console.log(error);
        }
      
        var account = accounts[0];

        App.contracts.FortuneChain.deployed().then(function(instance){
           return instance.regSolutionist(qId, { from: account, value: entryFee, gas:3000000  });
        }).then(function(){
          $('#registerModal').modal('hide');

        }).catch(function(err){
          console.log(err.message);
        });

      });  
    },
      
    listenToNewQEvents: function() {
      App.contracts.FortuneChain.deployed().then(function(instance){
        instance.LogQuestionUpdate({}, { fromBlock: 0, toBlock: 'latest'}).watch(function(error,event){
          if(!error){
            var list = $('#list');
            var template = $('#template');
            var _qId = parseInt(event.args.qId)+1; 
            console.log(parseInt(event.args.bountyPrice));

            if(event.args.questionState == 1) { 
              $('#events').append('<p>' + web3.fromWei(event.args.bountyPrice, "ether") + 'ETH new bounty question :' + ' " ' + event.args.questionContents +' " ' + 'has been updated at question list as No.' + event.args.questionCount + '</p>');
 
              //panel creation and question information update 
              template.find('.qId').text(event.args.questionCount);

              

              if(event.args.qType == 1) {
                
                template.find('.card1').attr('src', 'images/viscontiTarot/'+event.args.tarotCardNums[0]+'.jpg');
                template.find('.card2').attr('src', 'images/viscontiTarot/'+event.args.tarotCardNums[1]+'.jpg');
                template.find('.card3').attr('src', 'images/viscontiTarot/'+event.args.tarotCardNums[2]+'.jpg');
                template.find('.card4').attr('src', 'images/viscontiTarot/'+event.args.tarotCardNums[3]+'.jpg');
                template.find('.card5').attr('src', 'images/viscontiTarot/'+event.args.tarotCardNums[4]+'.jpg');
                template.find('.card6').attr('src', 'images/viscontiTarot/'+event.args.tarotCardNums[5]+'.jpg');
  
                template.find('.qType').text("Money");
              } else if(event.args.qType == 2) {
                template.find('.card1').attr('src', 'images/casanovaTarot/'+event.args.tarotCardNums[0]+'.jpg');
                template.find('.card2').attr('src', 'images/casanovaTarot/'+event.args.tarotCardNums[1]+'.jpg');
                template.find('.card3').attr('src', 'images/casanovaTarot/'+event.args.tarotCardNums[2]+'.jpg');
                template.find('.card4').attr('src', 'images/casanovaTarot/'+event.args.tarotCardNums[3]+'.jpg');
                template.find('.card5').attr('src', 'images/casanovaTarot/'+event.args.tarotCardNums[4]+'.jpg');
                template.find('.card6').attr('src', 'images/casanovaTarot/'+event.args.tarotCardNums[5]+'.jpg');
                template.find('.qType').text("Love");
              } else if(event.args.qType == 3) {
                template.find('.card1').attr('src', 'images/klimtTarot/'+event.args.tarotCardNums[0]+'.jpg');
                template.find('.card2').attr('src', 'images/klimtTarot/'+event.args.tarotCardNums[1]+'.jpg');
                template.find('.card3').attr('src', 'images/klimtTarot/'+event.args.tarotCardNums[2]+'.jpg');
                template.find('.card4').attr('src', 'images/klimtTarot/'+event.args.tarotCardNums[3]+'.jpg');
                template.find('.card5').attr('src', 'images/klimtTarot/'+event.args.tarotCardNums[4]+'.jpg');
                template.find('.card6').attr('src', 'images/klimtTarot/'+event.args.tarotCardNums[5]+'.jpg');
                template.find('.qType').text("Health");
              } else if(event.args.qType == 4) {
                template.find('.card1').attr('src', 'images/waiteTarot/'+event.args.tarotCardNums[0]+'.jpg');
                template.find('.card2').attr('src', 'images/waiteTarot/'+event.args.tarotCardNums[1]+'.jpg');
                template.find('.card3').attr('src', 'images/waiteTarot/'+event.args.tarotCardNums[2]+'.jpg');
                template.find('.card4').attr('src', 'images/waiteTarot/'+event.args.tarotCardNums[3]+'.jpg');
                template.find('.card5').attr('src', 'images/waiteTarot/'+event.args.tarotCardNums[4]+'.jpg');
                template.find('.card6').attr('src', 'images/waiteTarot/'+event.args.tarotCardNums[5]+'.jpg');
                template.find('.qType').text("Work");
              }

             
              console.log(parseInt(event.args.tarotCardNums[0]));
              console.log(parseInt(event.args.tarotCardNums[1]));
              console.log(parseInt(event.args.tarotCardNums[2]));
              console.log(parseInt(event.args.tarotCardNums[3]));
              console.log(parseInt(event.args.tarotCardNums[4]));
              console.log(parseInt(event.args.tarotCardNums[5]));
             

              template.find('.qContent').text(event.args.questionContents);
              template.find('.bountyPrice').text(web3.fromWei(event.args.bountyPrice, "ether"));
              template.find('.getQuestionState').text("Question Set");

                list.append(template.html());

            } else if(event.args.questionState == 2) {

              $('#events').append('<p>' + ' No.' + (_qId) + '  question : ' + event.args.solutionistAddress+ ' is "registered" as a solutionist of this question' + '</p>');           
              $('.panel-fortuneChain').eq(event.args.qId).find('.getQuestionState').text("Solution Pending");

            } else if(event.args.questionState == 3) {

              $('#events').append('<p>' + 'No.' + (_qId) + '  question : ' + ' Solution is "offered" from solutionist' + '</p>');
              $('.panel-fortuneChain').eq(event.args.qId).find('.getQuestionState').text("Solution Offered");

            } else if(event.args.questionState == 4) {

              $('#events').append('<p>' + 'No.' + (_qId) + '  question : ' + ' Solution is "accepted" from questioner' + '</p>');
              $('.panel-fortuneChain').eq(event.args.qId).find('.getQuestionState').text("Solution accepted and Solved");

            } else if(event.args.questionState == 5) {

              $('#events').append('<p>' + 'No.' + (_qId) + '  question : ' + ' Solution is "rejected" from questioner' + '</p>');
              $('.panel-fortuneChain').eq(event.args.qId).find('.getQuestionState').text("Solution rejected and reset");
            
            } else if(event.args.questionState == 6) {
              $('#events').append('<p>' + 'No.' + (_qId) + '  question : ' + ' this question is "dismissed" from questioner' + '</p>');
              $('.panel-fortuneChain').eq(event.args.qId).find('.getQuestionState').text("Question Dismissed");

            }

          } else {
            console.error(error);
          }
        })
        
     })

    },

    offerSolution: function() {	
      var qId = $('#qIdSoutionInputModal').val()-1
      var sContent = $('#solutionContent').val();
      
      web3.eth.getAccounts(function(error, accounts){
        if(error) {
          console.log(error);
        }
  
        var account = accounts[0];
  
        App.contracts.FortuneChain.deployed().then(function(instance){
          return instance.offerSolution( qId, sContent, { from: account, value: 0, gas:3000000 });
        }).then(function(){
          $('#solutionContent').val('');
          $('#questionId').val('');
          $('#questionBprice').val('');
          $('#questionerAddress').val('');
          $('#questionCategory').val('');
          $('#questionerName').val('');
          $('#questionerBdate').val('');
          $('#questionerGender').val('');
          $('#questionDetail').val('');
          $('#solutionInputModal').modal('hide');
        }).catch(function(err){
          console.log(err.message);
        });
      });
    },

    acceptSolution: function() {	
      var qId = $('#qIdSoutionCheckModal').val()-1

      web3.eth.getAccounts(function(error, accounts){
        if(error) {
          console.log(error);
        }
  
        var account = accounts[0];
  
        App.contracts.FortuneChain.deployed().then(function(instance){
          return instance.acceptSolution( qId, { from: account, value: 0 });
        }).then(function(){
          $('#solutionDemo').val('');
          $('#solutionCheckModal').modal('hide');
        }).catch(function(err){
          console.log(err.message);
        });
      });
    },  

    rejectSolution: function() {	
      var qId = $('#qIdSoutionCheckModal').val()-1
      console.log(qId);
      web3.eth.getAccounts(function(error, accounts){
        if(error) {
          console.log(error);
        }
  
        var account = accounts[0];
  
        App.contracts.FortuneChain.deployed().then(function(instance){
          return instance.rejectSolution( qId, { from: account, value: 0, gas:3000000  });
        }).then(function(){
          $('#solutionDemo').val('');
          $('#solutionCheckModal').modal('hide');


        }).catch(function(err){
          console.log(err.message);
        });
      });
    },

    setSolutionGrade: function() {	
      var qId = $('#qIdFullSolutionModal').val()-1
      var solutionGrade = $('#setSolutionGrade').val()
      console.log(qId);
      console.log(solutionGrade);
      web3.eth.getAccounts(function(error, accounts){
        if(error) {
          console.log(error);
        }
  
        var account = accounts[0];
  
        App.contracts.FortuneChain.deployed().then(function(instance){
          return instance.setSolutionGrade( qId, solutionGrade, { from: account, value: 0 });
        }).then(function(){
          $('#getFullSolutionModal').modal('hide');
          
        }).catch(function(err){
          console.log(err.message);
        });
      });
    },

    dismissQuestion: function() {	
      var qId = $('#qIdDismissModal').val()-1
      console.log(qId);
      web3.eth.getAccounts(function(error, accounts){
        if(error) {
          console.log(error);
        }
  
        var account = accounts[0];
  
        App.contracts.FortuneChain.deployed().then(function(instance){
          return instance.dismissQuestion( qId, { from: account, value: 0 });
        }).then(function(){
          $('#questionDismissModal').modal('hide');
          
        }).catch(function(err){
          console.log(err.message);
        });
      });
    },

    updateAllStatusButtons: function(account) {
      App.contracts.FortuneChain.deployed().then(function(instance){
        instance.LogQuestionUpdate({}, { fromBlock: 0, toBlock: 'latest'}).watch(function(error,event){
          if(!error){
            var _qId = parseInt(event.args.qId)+1;
            var _qState = parseInt(event.args.questionState);
            var _qOwnerAddress = event.args.questionOwnerAddress;
            var _qSolutionistAddress = event.args.solutionistAddress;

            console.log(account);
            switch (_qState){
              case 1: //set state

                $('.panel-fortuneChain').eq(_qId).find('.btn-dismissed').attr('style' , "display: none;" ); //dismissed button off
                if (account == _qOwnerAddress) { //question owner account                
                  $('.panel-fortuneChain').eq(_qId).find('.btn-dismiss').removeAttr('style');                 //dismiss button on
                  $('.panel-fortuneChain').eq(_qId).find('.btn-listing').attr('style' , "display: none;" );   //register button off
                } else {  // other account
                  $('.panel-fortuneChain').eq(_qId).find('.btn-dismiss').attr('style' , "display: none;" );   //dismiss button off 
                  $('.panel-fortuneChain').eq(_qId).find('.btn-listing').removeAttr('style');                 //register button on
                }
                break;

              case 2: //pending state
                  $('.panel-fortuneChain').eq(_qId).find('.btn-listing').text('Solution Pending').attr('disabled', true); //change to solution pending button
                  $('.panel-fortuneChain').eq(_qId).find('.btn-dismissed').attr('style' , "display: none;" ); //dismissed button off
                if (account == _qOwnerAddress) { //question owner account              
                  $('.panel-fortuneChain').eq(_qId).find('.btn-dismiss').removeAttr('style');                 //dismiss button on
                  $('.panel-fortuneChain').eq(_qId).find('.btn-listing').removeAttr('style');                 //solution pending button on
                  $('.panel-fortuneChain').eq(_qId).find('.btn-answer').attr('style' , "display: none;" );    //answer button off
                } else if (account == _qSolutionistAddress) { //registered solutionist account                                   
                  $('.panel-fortuneChain').eq(_qId).find('.btn-dismiss').attr('style' , "display: none;" );   //dismiss button off
                  $('.panel-fortuneChain').eq(_qId).find('.btn-listing').removeAttr('style');                 //solution pending button on
                  $('.panel-fortuneChain').eq(_qId).find('.btn-answer').removeAttr('style');                  //answer button on
                } else { //other account
                  $('.panel-fortuneChain').eq(_qId).find('.btn-dismiss').attr('style' , "display: none;" );   //dismiss button off
                  $('.panel-fortuneChain').eq(_qId).find('.btn-listing').removeAttr('style');                 //solution pending button on
                  $('.panel-fortuneChain').eq(_qId).find('.btn-answer').attr('style' , "display: none;" );    //answer button off
                }
                break;            

              case 3: //offered state
                  $('.panel-fortuneChain').eq(_qId).find('.btn-answer').text('Accept Pending').attr('disabled', true); //change to accept pending button
                  $('.panel-fortuneChain').eq(_qId).find('.btn-dismissed').attr('style' , "display: none;" ); //dismissed button off
                if (account == _qOwnerAddress) { //question owner account              
                  $('.panel-fortuneChain').eq(_qId).find('.btn-dismiss').attr('style' , "display: none;" );   //dismiss button off
                  $('.panel-fortuneChain').eq(_qId).find('.btn-listing').attr('style' , "display: none;" );   //solution pending button off
                  $('.panel-fortuneChain').eq(_qId).find('.btn-answer').removeAttr('style');                  //accept Pending button on
                  $('.panel-fortuneChain').eq(_qId).find('.btn-check').removeAttr('style');                   //Check button on
                } else { //other account
                  $('.panel-fortuneChain').eq(_qId).find('.btn-dismiss').attr('style' , "display: none;" );   //dismiss button off
                  $('.panel-fortuneChain').eq(_qId).find('.btn-listing').attr('style' , "display: none;" );   //solution pending button off
                  $('.panel-fortuneChain').eq(_qId).find('.btn-answer').removeAttr('style');                  //accept Pending button on
                  $('.panel-fortuneChain').eq(_qId).find('.btn-check').attr('style' , "display: none;" );     //check button off
                }
                break;

              case 4: //accepted state
                  $('.panel-fortuneChain').eq(_qId).find('.btn-dismissed').attr('style' , "display: none;" ); //dismissed button off
                  if (account == _qOwnerAddress) { //question owner account              
                  $('.panel-fortuneChain').eq(_qId).find('.btn-dismiss').attr('style' , "display: none;" );   //dismiss button off
                  $('.panel-fortuneChain').eq(_qId).find('.btn-listing').attr('style' , "display: none;" );   //solution pending button off
                  $('.panel-fortuneChain').eq(_qId).find('.btn-answer').attr('style' , "display: none;" );    //accept Pending button off
                  $('.panel-fortuneChain').eq(_qId).find('.btn-check').attr('style' , "display: none;" );     //check button off
                  $('.panel-fortuneChain').eq(_qId).find('.btn-solved').removeAttr('style');                  //solved! button on
                  $('.panel-fortuneChain').eq(_qId).find('.btn-getsolution').removeAttr('style');             //get full solution button on
                } else { //other account
                  $('.panel-fortuneChain').eq(_qId).find('.btn-dismiss').attr('style' , "display: none;" );   //dismiss button off
                  $('.panel-fortuneChain').eq(_qId).find('.btn-listing').attr('style' , "display: none;" );   //solution pending button off
                  $('.panel-fortuneChain').eq(_qId).find('.btn-answer').attr('style' , "display: none;" );    //accept Pending button off
                  $('.panel-fortuneChain').eq(_qId).find('.btn-check').attr('style' , "display: none;" );     //check button off
                  $('.panel-fortuneChain').eq(_qId).find('.btn-solved').removeAttr('style');                  //solved! button on
                  $('.panel-fortuneChain').eq(_qId).find('.btn-getsolution').attr('style' , "display: none;");//get full solution button off
                }
                break;

              case 5: //rejected state
                  $('.panel-fortuneChain').eq(_qId).find('.btn-dismissed').attr('style' , "display: none;" ); //dismissed button off
                if (account == _qOwnerAddress) { //question owner account              
                  $('.panel-fortuneChain').eq(_qId).find('.btn-dismiss').removeAttr('style');                  //dismiss button on
                  $('.panel-fortuneChain').eq(_qId).find('.btn-listing').text('Registration').attr('disabled', false); //change to register button
                  $('.panel-fortuneChain').eq(_qId).find('.btn-listing').attr('style' , "display: none;" );    //register button off
                  $('.panel-fortuneChain').eq(_qId).find('.btn-answer').text('Answer').attr('disabled', false);//change to answer button
                  $('.panel-fortuneChain').eq(_qId).find('.btn-answer').attr('style' , "display: none;" );     //answer button off
                  $('.panel-fortuneChain').eq(_qId).find('.btn-check').attr('style' , "display: none;" );      //check button off
                  $('.panel-fortuneChain').eq(_qId).find('.btn-solved').attr('style' , "display: none;" );     //solved! button off
                  $('.panel-fortuneChain').eq(_qId).find('.btn-getsolution').attr('style' , "display: none;" );//get full solution button off                  
                } else { //other account
                  $('.panel-fortuneChain').eq(_qId).find('.btn-dismiss').attr('style' , "display: none;" );    //dismiss button off
                  $('.panel-fortuneChain').eq(_qId).find('.btn-listing').text('Registration').attr('disabled', false); //change to register button
                  $('.panel-fortuneChain').eq(_qId).find('.btn-listing').removeAttr('style');                  //register button on
                  $('.panel-fortuneChain').eq(_qId).find('.btn-answer').text('Answer').attr('disabled', false);//change to answer button
                  $('.panel-fortuneChain').eq(_qId).find('.btn-answer').attr('style' , "display: none;" );     //answer button off
                  $('.panel-fortuneChain').eq(_qId).find('.btn-check').attr('style' , "display: none;" );      //check button off
                  $('.panel-fortuneChain').eq(_qId).find('.btn-solved').attr('style' , "display: none;" );     //solved! button off
                  $('.panel-fortuneChain').eq(_qId).find('.btn-getsolution').attr('style' , "display: none;" );//get full solution button off   
                }
                break;

              case 6: //dismissed state
                $('.panel-fortuneChain').eq(_qId).find('.btn-dismiss').attr('style' , "display: none;" );    //dismiss button off
                $('.panel-fortuneChain').eq(_qId).find('.btn-listing').attr('style' , "display: none;" );    //solution Pending button off
                $('.panel-fortuneChain').eq(_qId).find('.btn-answer').attr('style' , "display: none;" );     //accept Pending button off
                $('.panel-fortuneChain').eq(_qId).find('.btn-check').attr('style' , "display: none;" );      //check button off
                $('.panel-fortuneChain').eq(_qId).find('.btn-solved').attr('style' , "display: none;" );     //solved! button off
                $('.panel-fortuneChain').eq(_qId).find('.btn-getsolution').attr('style' , "display: none;" );//get full solution button off
                $('.panel-fortuneChain').eq(_qId).find('.btn-dismissed').removeAttr('style');                //dismissed button on
                $('.panel-fortuneChain').eq(_qId).find('.btn-dismissed').attr('disabled', true);             //dismissed button disabled- just status display 
                break;

            }

          } else {
            console.error(error);
          }
        })
      })
    }
    

  };

  $(function() {
    $(window).load(function() {
      App.init();
      setInterval(App.updateUserAccount,400);
            
    });
  
  
    $('#registerModal').on('show.bs.modal', function(e) {
      var id = $(e.relatedTarget).parent().find('.qId').text();
      var bountyPrice = $(e.relatedTarget).parent().find('.bountyPrice').text();
      var entryFee; 

      $(e.currentTarget).find('#qIdRegModal').val(id);
      $(e.currentTarget).find('#bountyPrice').val(bountyPrice);

      App.contracts.FortuneChain.deployed().then(function(instance) {
           return instance.getFeeRate.call();
         }).then(function(feeRate) {
          $("#getFeeRate").text(feeRate);

          entryFee = bountyPrice*feeRate/100;
          $("#getEntryFee").text(entryFee); 
          $(e.currentTarget).find('#entryFee').val(entryFee);
          }).catch(function(err) {
           console.log(err.message);
         })  
    });


    $('#solutionInputModal').on('show.bs.modal', function(e) {
        var id = $(e.relatedTarget).parent().find('.qId').text();
        
        $(e.currentTarget).find('#qIdSoutionInputModal').val(id);

        App.contracts.FortuneChain.deployed().then(function(instance){
          return instance.getFullQuestionInfo.call(id-1);
        }).then(function(fullInfo){
          var qId = parseInt(fullInfo[0]);
          var qName = fullInfo[1];
          var qType = fullInfo[2];
          var qBdate = fullInfo[3];
          var bPrice = web3.fromWei(fullInfo[4]);
          var qContent = fullInfo[5];
          var qGender = fullInfo[6];
          var commissionRate = fullInfo[7];
          var earnPrice = bPrice*commissionRate/100;

          $("#getComissionRate").text(commissionRate);
          $("#getEarnPrice").text(earnPrice); 

          $(e.currentTarget).find('#questionId').text(qId+1);
          $(e.currentTarget).find('#questionBprice').text(bPrice);

          if(qType == 1) {
            $(e.currentTarget).find('#questionCategory').text("Money");
          } else if(qType == 2) {
            $(e.currentTarget).find('#questionCategory').text("Love");
          } else if(qType == 3) {
            $(e.currentTarget).find('#questionCategory').text("Health");
          } else if(qType == 4) {
            $(e.currentTarget).find('#questionCategory').text("Work");
          }
          $(e.currentTarget).find('#questionerName').text(web3.toUtf8(qName));
          $(e.currentTarget).find('#questionerBdate').text(qBdate);
          if(qGender == 1) {
            $(e.currentTarget).find('#questionerGender').text("Man");
          } else if(qGender == 2) {
            $(e.currentTarget).find('#questionerGender').text("Woman");
          } 
          $(e.currentTarget).find('#questionDetail').text(qContent);

        }).catch(function(err){
          console.log(err.message);
        }) 
    });

 
    $('#solutionCheckModal').on('show.bs.modal', function(e) {
      var id = $(e.relatedTarget).parent().find('.qId').text();
    
      $(e.currentTarget).find('#qIdSoutionCheckModal').val(id);

      web3.eth.getAccounts(function(error, accounts){
        if(error) {
          console.log(error);
        }

        var account = accounts[0];

        App.contracts.FortuneChain.deployed().then(function(instance){
          var contactInstance = instance;
          instance.LogSolutionOffered({}, { fromBlock: 0, toBlock: 'latest'}).watch(function(error,event){
            if(!error){
              if ((account == event.args.questionOwnerAddress) && ((id-1) == event.args.qId)) {
                $("#solutionDemo").text(event.args.solutionDemo);    // soution demo  내용 업데이트              
                console.log(event.args.solutionDemo);
              } else {
                $('#solutionDemo').val('');
              }          
            } else {
              console.error(error);
            }
          });
          return contactInstance.getSolutionistState.call(id-1);
        }).then(function(solutionistInfo){
          var sLevel = parseInt(solutionistInfo[0]);
          var sAWGrade = parseInt(solutionistInfo[1]);
          var sTotEarn = parseInt(solutionistInfo[2]);
  
          console.log(sLevel);
          console.log(sAWGrade);
          console.log(sTotEarn);

          $(e.currentTarget).find('#solutionistLevel').text(sLevel);
          $(e.currentTarget).find('#solutionAWGrade').text(sAWGrade);
         
        }).catch(function(err){
          console.log(err.message);
        })

      })
    });
    
    $('#getFullSolutionModal').on('show.bs.modal', function(e) {
      var id = $(e.relatedTarget).parent().find('.qId').text();
      console.log(id);
    
      $(e.currentTarget).find('#qIdFullSolutionModal').val(id);

      App.contracts.FortuneChain.deployed().then(function(instance){
        return instance.getFullSolution.call(id-1);
      }).then(function(solutionContents){
         $(e.currentTarget).find('#fullSolution').text(solutionContents);

      }).catch(function(err){
        console.log(err.message);
      }) 
    });
    
   
    $('#questionDismissModal').on('show.bs.modal', function(e) {
      var id = $(e.relatedTarget).parent().find('.qId').text();
      console.log(id);
      $(e.currentTarget).find('#qIdDismissModal').val(id);

     })


  });
  