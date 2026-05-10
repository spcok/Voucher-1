import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
// Note: We use express.json() but for real PayPal webhooks, 
// you may need raw body parsing to verify the webhook signature later.
app.use(express.json()); 

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Bypasses RLS for server operations
);

app.post('/api/webhooks/paypal', async (req, res) => {
  try {
    const event = req.body;

    // 1. Verify this is a completed sale
    if (event.event_type !== 'PAYMENT.SALE.COMPLETED' && event.event_type !== 'CHECKOUT.ORDER.COMPLETED') {
      return res.status(200).send('Event ignored');
    }

    // Extract payload data (PayPal's exact JSON structure may vary slightly based on your button setup)
    const buyerEmail = event.resource.payer.email_address;
    const buyerName = `${event.resource.payer.name.given_name} ${event.resource.payer.name.surname}`;
    const itemName = event.resource.purchase_units[0].items[0].name; // e.g., "Owl Encounter"
    
    // For this example, assuming participants/guests are passed in custom_id or similar fields
    const participants = 3; // Replace with actual extraction logic
    const guests = 5;       // Replace with actual extraction logic

    // 2. Lookup the Experience Prefix from Supabase
    const { data: expData, error: expError } = await supabase
      .from('experience_types')
      .select('id, prefix')
      .eq('paypal_name', itemName)
      .single();

    if (expError || !expData) throw new Error(`Experience not found: ${itemName}`);

    // 3. Generate the Voucher Code (e.g., OE010120260305)
    const dateObj = new Date();
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    const partStr = String(participants).padStart(2, '0');
    const guestStr = String(guests).padStart(2, '0');
    
    const voucherCode = `${expData.prefix}${day}${month}${year}${partStr}${guestStr}`;

    // 4. Create Customer Record
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .insert({ email: buyerEmail, name: buyerName })
      .select('id')
      .single();

    if (customerError) throw customerError;

    // 5. Create Voucher Record
    const { error: voucherError } = await supabase
      .from('vouchers')
      .insert({
        code: voucherCode,
        customer_id: customerData.id,
        experience_id: expData.id,
        participants: participants,
        guests: guests
      });

    if (voucherError) throw voucherError;

    // 6. Next step: PDF Generation & Email Dispatch goes here
    console.log(`Success! Generated voucher ${voucherCode} for ${buyerEmail}`);

    res.status(200).send('Webhook processed successfully');

  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));