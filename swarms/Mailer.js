var mailerSwarming =
{
    meta: {
        name: "Mailer.js"
    },
    vars: {
        debug: false
    },
    sendMail: function (from, to, subject, text) {
        this.from = from;
        this.to = to;
        this.subject = subject;
        this.text = text;
        this.swarm("send");
    },
    send: {
        node: "Mailer",
        code: function () {
            sendMail(this.from, this.to, this.subject, this.text);
            this.honey("notify");
        }
    }
};
mailerSwarming;