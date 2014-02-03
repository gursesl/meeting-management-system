var trimInput = function (value) {
    return value.replace(/^\s*|\s*$/g, '');
};

isNotEmpty = function(value) {
    if (value && value !== ''){
        return true;
    }
    Session.set('alert', 'Please fill in all required fields.');
    return false;
};

isEmail = function(value) {
    var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (filter.test(value)) {
        return true;
    }
    Session.set('alert', 'Please enter a valid email address.');
    return false;
};

isValidPassword = function(password) {
    if (password.length < 6) {
        Session.set('alert', 'Your password should be 6 characters or longer.');
        return false;
    }
    return true;
};

areValidPasswords = function(password, confirm) {
    if (!isValidPassword(password)) {
        return false;
    }
    if (password !== confirm) {
        Session.set('alert', 'Your two passwords are not equivalent.');
        return false;
    }
    return true;
};


Template.alert.helpers({
    alert: function() {
        return Session.get('alert');
    }
});

Template.signIn.events({
    'submit #signInForm': function(event, template) {
            //event.preventDefault();

            //var signInForm = $(e.currentTarget),

            email = trimInput(template.find("#signInEmail").value);
            //email = trimInput(signInForm.find('.email').val().toLowerCase()),

            //password = signInForm.find('.password').val();
            password = template.find("#signInPassword").value;

        if (isNotEmpty(email) && isEmail(email) && isNotEmpty(password) && isValidPassword(password)) {
            Meteor.loginWithPassword(email, password, function(err) {
                if (err) {
                    Session.set('alert', 'Invalid credentials. Please try again.');
                } else {
                    Session.set("wizardInProgress", true);
                    Session.set("keepview", "five");
                    transition(null, "five");
                    Sesson.set('alert', 'Welcome to Maria');
                    Sesson.set('wizardinprogress', null);
                    Session.set("keepview", null);
                }
            });
        }
        return false;
    },

    'click #showForgotPassword': function(e, t) {
        Session.set('showForgotPassword', true);
        return false;
    }
});

Template.signUp.events({
    'submit #signUpForm': function(e, t) {
        e.preventDefault();

        var signUpForm = $(e.currentTarget),
            email = trimInput(signUpForm.find('#signUpEmail').val().toLowerCase()),
            password = signUpForm.find('#signUpPassword').val(),
            passwordConfirm = signUpForm.find('#signUpPasswordConfirm').val();

        if (isNotEmpty(email) && isNotEmpty(password) && isEmail(email) && areValidPasswords(password, passwordConfirm)) {
            Accounts.createUser({email: email, password: password}, function(err) {
                if (err) {
                    if (err.message === 'Email already exists. [403]') {
                        Session.set('alert', 'We\'re sorry but this email is already used.');
                    } else {
                        Session.set('alert', 'We\'re sorry but something went wrong.');
                    }
                } else {
                    Session.set('alert', 'Congrats! You\'re now signed up.');
                }
            });
        }
        return false;
    },
});


Template.signOut.events({
    'click #signOut': function(e, t) {
        Meteor.logout(function() {
            Session.set('alert', 'You are logged out now');
        });
        return false;
    }
});


Template.homewizauth.helpers({
    showForgotPassword: function() {
        return Session.get('showForgotPassword');
    }
});


Template.forgotPassword.events({
    'submit #forgotPasswordForm': function(e, t) {
        e.preventDefault();

        var forgotPasswordForm = $(e.currentTarget),
            email = trimInput(forgotPasswordForm.find('#forgotPasswordEmail').val().toLowerCase());

        if (isNotEmpty(email) && isEmail(email)) {
            Accounts.forgotPassword({email: email}, function(err) {
                if (err) {
                    if (err.message === 'User not found [403]') {
                        Session.set('alert', 'This email does not exist.');
                    } else {
                        Session.set('alert', 'We\'re sorry but something went wrong.');
                    }
                } else {
                    Session.set('alert', 'Email Sent. Please check your mailbox to reset your password.');
                }
            });
        }
        return false;
    },

    'click #returnToSignIn': function(e, t) {
        Session.set('showForgotPassword', null);
        return false;
    },
});

if (Accounts._resetPasswordToken) {
    Session.set('resetPassword', Accounts._resetPasswordToken);
};

Template.homewizauth.helpers({
    resetPassword: function(){
        return Session.get('resetPassword');
    }
});

Template.resetPassword.events({
    'submit #resetPasswordForm': function(e, t) {
        e.preventDefault();
        
        var resetPasswordForm = $(e.currentTarget),
            password = resetPasswordForm.find('#resetPasswordPassword').val(),
            passwordConfirm = resetPasswordForm.find('#resetPasswordPasswordConfirm').val();

        if (isNotEmpty(password) && areValidPasswords(password, passwordConfirm)) {
            Accounts.resetPassword(Session.get('resetPassword'), password, function(err) {
                if (err) {
                    Session.set('alert', {type: 'error', message: 'We\'re sorry but something went wrong.'});
                }
                else {
                    Session.set('alert', 'Your password has been changed. Welcome back!');
                    Session.set('resetPassword', null);
                }
            });
        }
        return false;
    }
});