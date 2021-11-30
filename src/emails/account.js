const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) =>{
    sgMail.send({
        to: email,
        from: 'noahrozario@outlook.com',
        subject: 'ATTENTION: PLEASE READ',
        text: `Welcome ${name}!`
    })
}

const cancelationEmail = (email, name) =>{
    sgMail.send({
        to: email,
        from: 'noahrozario@outlook.com',
        subject: 'cancelation',
        text: `Hello ${name}, your account has been deleted!`
    })
}

module.exports = {
    sendWelcomeEmail,
    cancelationEmail
}