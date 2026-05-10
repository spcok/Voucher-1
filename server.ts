import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Webhook endpoint
  app.post('/api/webhooks/paypal', async (req, res) => {
    const event = req.body;
    
    // In production, verify event signature here
    
    if (event.event_type === 'CHECKOUT.ORDER.COMPLETED') {
      const { customer_details, order_details } = event.resource;
      
      // 1. Store customer in Supabase
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .upsert({ 
          email: customer_details.email_address, 
          name: customer_details.name.full_name 
        })
        .select()
        .single();
        
      if (customerError) {
        console.error('Error storing customer:', customerError);
        return res.sendStatus(500);
      }
      
      // 2. Generate voucher
      const voucherCode = 'VOUCHER-' + Math.random().toString(36).substring(7).toUpperCase();
      const { data: voucher, error: voucherError } = await supabase
        .from('vouchers')
        .insert({ 
          code: voucherCode, 
          customer_id: customer.id,
          order_id: order_details.id
        });
        
      if (voucherError) {
        console.error('Error creating voucher:', voucherError);
        return res.sendStatus(500);
      }
      
      // 3. Send email to customer
      await transporter.sendMail({
        from: '"Your Company" <no-reply@example.com>',
        to: customer_details.email_address,
        subject: 'Your Voucher',
        text: `Here is your voucher code: ${voucherCode}`,
      });
      
      return res.sendStatus(200);
    }
    
    res.sendStatus(200);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
