function SessionController(swarmConnection){
	var storageKey = "AppCreds";
	var storageSessionKey = "AppSession";
	var app_user = ".app-user";
	var hidden = "hidden";
	var loginSelector = "#login-screen";
	var registerSelector = "#register-screen";
	var views = [appSelector, loginSelector, registerSelector];
	var appSelector = "#app";
	var formSelector = "#login-form";
	var registerFormSelector = "#register-form";
	var formFields = " input";
	var logoutSelector = ".app-user-logout";
	var fieldError = "fieldError";
	var errorsPlaceHolder = "#errors-placeholder";
	var registerErrorHolder = "#register-errors-placeholder";
	var createAccountButton = "#signup";
	var cancelButton = "[name='cancel']";
    var authenticated = false;
    var locker = {};
    var config = Config();

	function displayView(selector){
		for(var i=0; i<views.length; i++){
			var view = views[i];
			if(view != selector){
				addOrRemoveHidden(view, "addClass");
			}
		}
		addOrRemoveHidden(selector, "removeClass");
	}

	function addOrRemoveHidden(selector, method){
		$(selector)[method](hidden);
	}

	function gotCredentials(){
		if(Utils.prototype.localStorageSupport()){
			var creds = localStorage.getItem(storageKey);
			if(creds){
				try{
                    creds = JSON.parse(creds);
				}catch(e){
					creds = {};
				}
				if(!creds.username || !creds.password){
					creds = false;
				}
			}else{
				creds = false;
			}
			return creds;
		}
		return false;
	}

	function storeCredentials(creds){
        if(Utils.prototype.localStorageSupport()){
        	if(creds){
                localStorage.setItem(storageKey, JSON.stringify(creds));
			}else{
        		localStorage.removeItem(storageKey);
			}
        }
	}

	function readFormValues(form){
		var values = {};
		$(form+formFields).each(function(index, item){
			values[item.name] = item.value;
		});
		return values;
	}

	function storeSession(session){
		if(Utils.prototype.localStorageSupport()){
			if(session){
				localStorage.setItem(storageSessionKey, session);
			}else{
				localStorage.removeItem(storageKey);
			}
		}
	}

	function readSession(){
		var session = false;
		if(Utils.prototype.localStorageSupport()){
			storedSession = localStorage.getItem(storageSessionKey);
			if(storedSession){
				session = storedSession;
			}
		}
		return session;
	}

	function doLogin(credentials){
		resetDisplayedErrors(errorsPlaceHolder);

		var creds = credentials ? credentials : readFormValues(formSelector);
		locker.creds = creds;
		swarmConnection.initConnection("userLogin", creds.username, creds.password, "success", established, failed);
	}

	function doRestore(){
		var session = readSession();
		var creds = gotCredentials();
		if(creds){
			if(session){
				locker.creds = creds;
				swarmConnection.initConnection("restoreSession", creds.username, session, "restoreSucceed", established, function(){
					storeSession();
					doLogin(creds);
				});
			}else{
				doLogin(creds);
			}
		}
	}

	function doLogout(){
		storeCredentials();
		storeSession();
		//TODO: close swarmConnection;
	}

	function doAccount(){
		var user = readFormValues(registerFormSelector);
		console.log(user);
		locker.creds = {username: user.email, password: user.password};
		swarmConnection.initConnection("registerNewUser", user, null, "success", established, function(phase, data){
			displayError(registerErrorHolder, data.error);
		});
	}

	function refreshView(){
        if(!authenticated){
        	displayView(loginSelector);
        }else{
        	displayView(appSelector);
        }
	}

	function established(done, sessionId){
		authenticated = done;
		if(done){
            storeCredentials(locker.creds);
			storeSession(sessionId);
		}
		if(locker && locker.creds){
			displayUserDetails(locker.creds.username);
		}
		refreshView();
	}

	function displayUserDetails(username){
		$(app_user).html(username);
	}

	function failed(){
		authenticated = false;
        refreshView();
        displayError(errorsPlaceHolder, "Wrong authentication data.");
        //TODO: try to reconnect
	}

	function displayError(container, error){
		$.notifyDefaults(NotifyCfg());

		var isDisplayed = $("label:contains('"+error+"')");
		if(isDisplayed.length == 0){
			var error = "<label class='"+fieldError+"'>"+error+"</label>";
			$(container).show().append(error);
		}

		if(error){
			$.notify({
				icon: 'glyphicon glyphicon-ok',
				message: error
			},{
				type: 'error'
			});
		}
	}

	function resetDisplayedErrors(container){
		$(container).show().html("");
	}

	/*var creds = gotCredentials();
	if(creds){
        doLogin(creds);
	}*/

	doRestore();

	refreshView();

	//login form
    $(formSelector).validate({
        errorClass:  fieldError,
        onkeyup:     false,
        onblur:      false,
        errorElement: 'label',
        errorLabelContainer: errorsPlaceHolder,
        rules: {
            username: "required",
            password: "required"
        },
        messages: {
            username: "Please input your username",
            password: {
                required: "You need to fill in the password"
            }
        }
    });

    $(formSelector).find(':submit').click(function(event){
		var isValid = $(formSelector).valid();
    	if(isValid){
            doLogin();
		}
		//prevents form submit
        event.preventDefault();
		return false;
	});

    $(logoutSelector).click(function(event){
    	doLogout();
	});

    //register form
	$(registerFormSelector).validate({
		errorClass:  fieldError,
		onkeyup:     false,
		onblur:      false,
		errorElement: 'label',
		errorLabelContainer: registerErrorHolder,
		rules: {
			firstName: "required",
			lastName: "required",
			email: {
				required : true,
				email: true
			},
			password: {
				required : true,
				minlength: config.password_min_size
			},
			repeat_password: {
				required : true,
				minlength: config.password_min_size,
				equalTo: "#confirm"
			}
		},
		messages: {
			firstName : "First name field is required.",
			lastName : "Last name field is required.",
			email : {
				required: "Email field is required."
			},
			password: {
				required: "Password field is required."
			},
			repeat_password: {
				required: "Confirm password field required.",
				equalTo: "Please enter the same password again."
			}
		}
	});

	$(registerFormSelector).find(':submit').click(function(event){
		var isValid = $(registerFormSelector).valid();
		if(isValid){
			doAccount();
		}
		//prevents form submit
		event.preventDefault();
		return false;
	});

    $(createAccountButton).click(function(){
		displayView(registerSelector);
	});

    $(cancelButton).click(function(){
    	refreshView();
	})
}