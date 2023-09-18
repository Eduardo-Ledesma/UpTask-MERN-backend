import sgMail from '@sendgrid/mail';

const registerEmail = async data => {
    const { name, email, token } = data;

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
        to: email,
        from: '<eduledehigo@hotmail.com>',
        subject: 'UpTask - Confirm your account',
        text: 'Confirm your account on UpTask',
        html: `<p>Hello ${name}, you're almost ready!</p>
            <p>Only need to validate your account in the next link:
            <a href="${process.env.FRONTEND_URL}/confirm/${token}">Confirm Account.</a></p>
            <p>If you didn't create this account, please just ignore this message.</p>`
    }

    await sgMail.send(msg).then(() => {
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(error)
        })
}

const forgetPasswordEmail = async data => {
    const { name, email, token } = data;

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
        to: email,
        from: '<eduledehigo@hotmail.com>',
        subject: 'UpTask - Reset Password',
        text: 'Reset your password on UpTask',
        html: `<p>Hello ${name}</p>
        <p>Click on the next link to reset your password
        <a href="${process.env.FRONTEND_URL}/forgot-password/${token}">Click Here.</a>
        </p>`
    }

    await sgMail.send(msg).then(() => {
        console.log('Email sent')
    })
    .catch((error) => {
        console.error(error)
    })
}

export {
    registerEmail,
    forgetPasswordEmail
}

