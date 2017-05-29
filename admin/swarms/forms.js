/**
 * Created by ciprian on 4/20/17.
 */




var formsSwarming = {
    submitForm: function (form) {
        this.form = form;
        this.swarm("submit");
    },
    submit:{
        node:"FormsAdapter",
        code:function(){
            var self  = this;
            
            submitForm(this.form,S(function(err,res){
                if(err){
                    self.err = err.message;
                    self.home('failed');
                }else{
                    self.home('formSubmitted');
                }
            }))
        }
    },

    submitFormAnswer:function(answers,formId){
        this.answer = answers;
        this.formId = formId;
        this.swarm("submitAnswer");
    },
    submitAnswer:{
        node:"FormsAdapter",
        code:function(){
            var self = this;
            submitAnswer(this.answer,this.formId,this.meta.userId,S(function(err,res){
                if(err){
                    self.err = err.message;
                    self.home('failed');
                }else{
                    self.home('answerSubmitted');
                }
            }))
        }
    },


    getIdForEmail:{
        node:"UsersManager",
        code:function(){
            var self = this;
            getUserId(this.email,S(function (err,userId) {
                if(err){
                    self.err = err.message;
                    self.home('failed')
                }else{
                    self.userId = userId;
                    self.filter = {"user":userId};  //just a little convenience for 'retrieveFilteredAnswers'
                    self.swarm(self.finalDestination)
                }
            }))
        }
    },
    getUserZones:{
        node:"UsersManager",
        code:function(){
            var self = this;
            zonesOfUser(this.userId,S(function(err,zones){
                console.log(arguments);
                if(err){
                    self.err = err.message;
                    self.home('failed');
                }else{
                    self.filter = {"zone":zones.map(function(zone){return zone.zoneName;})}
                    self.swarm("retrieveFilteredForms");
                }
            }))
        }
    },



    retrieveForms:function(filter){
        //TO DD : impose access restrictions here
        if(!filter){
            this.userId = this.meta.userId;
            this.swarm("getUserZones");
        }
        else if(filter.userId){
            this.userId = filter.userId;
            this.swarm("getUserZones");
        }
        else if(filter.email){
            this.email = filter.email;
            this.finalDestination = "getUserZones";  //in getIdForEmail I must know that is the next phase
            this.swarm("getIdForEmail")
        }
        else{
            this.filter = {};
            this.swarm("retrieveFilteredAnswers");
        }
    },

    retrieveFilteredForms:{
        node:"FormsAdapter",
        code:function(){
            var self = this;
            retrieveForms(self.filter,S(function(err,result){
                if(err){
                    self.err = err.message;
                    self.home('failed');
                }
                else{
                    self.forms = result;
                    self.home("gotForms");
                }
            }))
        }
    },

    retrieveAnswers:function(filter){
        //TO DD : impose access restrictions here
        if(!filter){
            this.filter = {"user":this.meta.userId};
            this.swarm("retrieveFilteredAnswers");
        }
        else if(filter.userId){
            this.filter = filter;
            this.swarm("retrieveFilteredAnswers");
        }
        else if(filter.email){
            this.email = filter.email;
            this.finalDestination = "retrieveFilteredAnswers";  //in getIdForEmail I must know that is the next phase
            this.swarm("getIdForEmail")
        }
        else{
            this.filter = {};
            this.swarm("retrieveFilteredAnswers");
        }
    },

    retrieveFilteredAnswers:{
        node:"FormsAdapter",
        code:function () {
            var self = this;
            retrieveAnswers(this.filter,S(function(err,answers){
                if(err){
                    self.err = err.message;
                    self.home('failed')
                }else{
                    self.answers = answers;
                    self.home("gotAnswers");
                }
            }))
        }
    }
};
formsSwarming;
