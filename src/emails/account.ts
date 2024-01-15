import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SG_API_KEY as string);

type EmailBody = {
    to: string;
    subject: string;
    text: string;
}

const sendEmail = async (email: EmailBody) => {
    const {to, subject, text} = email;

    await sendgrid.send({
        from: "hazardsoft@gmail.com",
        to,
        subject,
        text
    })
}

export { sendEmail };