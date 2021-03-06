const sgMail = require('@sendgrid/mail');
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(SENDGRID_API_KEY);

exports.sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: `${process.env.FROM_EMAIL}`,
    subject: 'Thank you for signing up!',
    text: `Hi ${name}! Welcome to your one stop shop for all your creative networking!`
  });
};

exports.sendCancellationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: `${process.env.FROM_EMAIL}`,
    subject: 'Sorry to see you go.',
    text: `Bye ${name}. Hope to see you soon.`
  });
};

exports.forgotPasswordEmail = (email, token, name) => {
  const exampleHTMLEmail = `<a target="_blank" rel="noopener noreferrer" href="${process.env.APP_URL}/api/password/${token}">Reset Password</a>`;

  sgMail.send({
    to: email,
    from: process.env.FROM_EMAIL,
    subject: 'Password Reset',
    text: `Hi ${name}! Please click the link below to reset your password!`,
    html: exampleHTMLEmail
  });
  console.log('sent');
};

exports.sendCancellationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: `${process.env.FROM_EMAIL}`,
    subject: 'Sorry to see you go.',
    text: `Bye ${name}. Hope to see you soon.`
  });
};

exports.createdEvent = (email, hostedBy) => {
  sgMail.send({
    to: email,
    from: `${process.env.FROM_EMAIL}`,
    subject: 'Sorry to see you go.',
    text: `Bye ${hostedBy}. Hope to see you soon.`
  });
};
