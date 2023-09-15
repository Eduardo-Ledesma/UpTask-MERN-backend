import nodemailer from "nodemailer";

const registerEmail = async data => {
    const { name, email, token } = data;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Mail information
    const info = await transport.sendMail({
        from: '"UpTask - Project Manager" <accounts@uptask.com>',
        to: email,
        subject: 'UpTask - Confirm your account',
        text: 'Confirm your account on UpTask',
        html: `<p>Hello ${name}, you're almost ready!</p>
        <p>Only need to validate your account in the next link:
        <a href="${process.env.FRONTEND_URL}/confirm/${token}">Confirm Account.</a></p>
        <p>If you didn't create this account, please just ignore this message.</p>`
    })
}

const forgetPasswordEmail = async data => {
    const { name, email, token } = data;

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Mail information
    const info = await transport.sendMail({
        from: '"UpTask - Project Manager" <accounts@uptask.com>',
        to: email,
        subject: 'UpTask - Reset Password',
        text: 'Reset your password on UpTask',
        html: `<p>Hello ${name}</p>
        <p>Click on the next link to reset your password
        <a href="${process.env.FRONTEND_URL}/forgot-password/${token}">Click Here.</a>
        </p>`
    })
}

export {
    registerEmail,
    forgetPasswordEmail
}