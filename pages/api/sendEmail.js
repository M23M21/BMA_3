import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { customerEmail, customerName, appointment, action, actor, actorRole } = req.body;
  
      if (!customerEmail) {
        return res.status(400).json({ error: 'Customer email is missing' });
      }

      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465, 
          secure: true, 
          auth: {
            user: 'bookappointment68@gmail.com',
            pass: 'qebe jhtt zrcq rwio',
          },
          tls: {
            rejectUnauthorized: false,
          },
          greetingTimeout: 10000, 
          logger: true, 
          debug: true, 
        });

        const roleMessage = actorRole === 'admin' ? 'by the admin' : `by ${actor}`;

        const mailOptions = {
          from: 'bookappointment68@gmail.com', // Replace with your email
          to: customerEmail,
          subject: `Your appointment has been ${action}`,
          html: `
            <h1>Appointment ${action}</h1>
            <p>Dear ${customerName},</p>
            <p>Your appointment has been ${action} ${roleMessage}.</p>
            <p>Updated details:</p>
            <ul>
              <li>Date: ${appointment.date}</li>
              <li>Time: ${appointment.time}</li>
              <li>Service: ${appointment.name}</li>
              <li>Team Member: ${appointment.teamMemberData.map(tm => tm.displayName).join(', ') || 'Not assigned'}</li>
            </ul>
            <p>If you have any questions, please contact us.</p>
          `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.response);
        res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, error: error.message });
      }
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}
