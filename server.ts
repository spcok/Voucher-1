import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('DEBUG: Environment variables loaded.');
console.log('DEBUG: SUPABASE_URL:', process.env.SUPABASE_URL);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let supabaseInstance: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!supabaseInstance) {
    const url = process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    if (url === '' || key === '' || url === 'MY_SUPABASE_URL' || key === 'MY_SUPABASE_SERVICE_ROLE_KEY') {
      throw new Error(`SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required and must be configured. URL found: ${!!url}, KEY found: ${!!key}`);
    }
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
}

let transporterInstance: ReturnType<typeof nodemailer.createTransport> | null = null;
function getTransporter() {
  if (!transporterInstance) {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !user || !pass) {
      throw new Error('SMTP_HOST, SMTP_USER, and SMTP_PASS are required');
    }
    transporterInstance = nodemailer.createTransport({
      host,
      port: parseInt(process.env.SMTP_PORT || '587'),
      auth: { user, pass },
    });
  }
  return transporterInstance;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Webhook endpoint
  app.post('/api/webhooks/paypal', async (req, res) => {
    const event = req.body;
    
    // In production, verify event signature here
    
    if (event.event_type === 'CHECKOUT.ORDER.COMPLETED') {
      try {
        const supabase = getSupabase() as any;
        const transporter = getTransporter();
        const { customer_details, order_details } = event.resource;
        
        // 1. Store customer in Supabase
        const { data: customer, error: customerError }: { data: any, error: any } = await supabase
          .from('customers')
          .upsert({ 
            email: customer_details.email_address, 
            name: customer_details.name.full_name 
          })
          .select()
          .single();
          
        if (customerError || !customer) {
          console.error('Error storing customer:', customerError);
          return res.status(500).json({ error: 'Database error' });
        }
        
        // 2. Generate voucher
        const voucherCode = 'VOUCHER-' + Math.random().toString(36).substring(7).toUpperCase();
        const { error: voucherError } = await supabase
          .from('vouchers')
          .insert({ 
            code: voucherCode, 
            customer_id: (customer as any).id,
            order_id: order_details.id
          });
          
        if (voucherError) {
          console.error('Error creating voucher:', voucherError);
          return res.status(500).json({ error: 'Voucher generation error' });
        }
        
        // 3. Send email to customer
        await transporter.sendMail({
          from: `"Voucher Dispatch" <${process.env.SMTP_USER}>`,
          to: customer_details.email_address,
          subject: 'Your Experience Voucher',
          text: `Hi ${customer_details.name.given_name},\n\nThank you for your purchase! Here is your voucher code: ${voucherCode}`,
        });
        
        return res.sendStatus(200);
      } catch (error) {
        console.error('Webhook processing error:', error);
        return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
      }
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
