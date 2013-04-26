/**********************************************************************************************
 * Init
 **********************************************************************************************/
thisAdapter = require('swarmutil').createAdapter("Mailer", null, null, false);


/**********************************************************************************************
 * Vars
 **********************************************************************************************/
var nodemailer = require('nodemailer');
var config;
var transport;

/**********************************************************************************************
 * Functions
 **********************************************************************************************/

init();

function init() {
    config = getMyConfig();

    /*
     * <ul>
     *     <li><b>service</b> - a well known service identifier ("Gmail", "Hotmail"
     *         etc.) for auto-completing host, port and secure connection settings</li>
     *     <li><b>host</b> - hostname of the SMTP server</li>
     *     <li><b>port</b> - port of the SMTP server</li>
     *     <li><b>secureConnection</b> - use SSL</li>
     *     <li><b>name</b> - the name of the client server</li>
     *     <li><b>authMethod</b> -specified the authMethod, value can be ["plain", "login"], default is "plain"</li>
     *     <li><b>auth</b> - authentication object as <code>{user:"...", pass:"..."}</code>
     *     <li><b>ignoreTLS</b> - ignore server support for STARTTLS</li>
     *     <li><b>debug</b> - output client and server messages to console</li>
     *     <li><b>maxConnections</b> - how many connections to keep in the pool</li>
     * </ul>
     */

    var localConfig;

    switch (config.transport) {
        case "SENDMAIL":
            //localConfig = "/usr/sbin/sendmail";
            //break;
        case "SMTP":
            localConfig = config;
            break;
    }

    transport = nodemailer.createTransport(config.transport, localConfig);
}


sendMail = function (from, to, subject, text) {
    var message = {
        from: from.join(','),
        to: to.join(','),
        subject: subject,
        html: text
    };

    transport.sendMail(message, function (error) {
        if (error) {
            logErr('Error occured sending mail.', error);
            return;
        }
        console.log('Message sent successfully!');
    });
}


