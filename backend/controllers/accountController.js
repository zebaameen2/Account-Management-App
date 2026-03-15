import supabase from '../config/supabaseClient.js';

// GET /api/account/balance
export const getBalance = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('balance')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ balance: user.balance });
  } catch (err) {
    console.error('Get balance error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// GET /api/account/statement
export const getStatement = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all transactions where user is sender or receiver
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        id,
        amount,
        transaction_type,
        created_at,
        balance_after,
        sender_id,
        receiver_id,
        sender:users!transactions_sender_id_fkey(id, name, email),
        receiver:users!transactions_receiver_id_fkey(id, name, email)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Statement DB error:', error);
      return res.status(500).json({ error: 'Error fetching statement.' });
    }

    // Filter to show only the relevant side of the transaction
    const userTransactions = transactions.filter(tx => {
      if (tx.transaction_type === 'debit' && tx.sender_id === userId) return true;
      if (tx.transaction_type === 'credit' && tx.receiver_id === userId) return true;
      return false;
    });

    res.status(200).json({ transactions: userTransactions });
  } catch (err) {
    console.error('Statement error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// POST /api/account/transfer
export const transferMoney = async (req, res) => {
  try {
    const { receiver_email, amount } = req.body;
    const senderId = req.user.id;

    if (!receiver_email || !amount) {
      return res.status(400).json({ error: 'Receiver email and amount are required.' });
    }

    const transferAmount = parseFloat(amount);

    if (isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    if (transferAmount < 1) {
      return res.status(400).json({ error: 'Minimum transfer amount is ₹1.' });
    }

    // Fetch sender's current balance
    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('id, name, email, balance')
      .eq('id', senderId)
      .single();

    if (senderError || !sender) {
      return res.status(404).json({ error: 'Sender account not found.' });
    }

    // Check if sender is trying to send to themselves
    if (sender.email.toLowerCase() === receiver_email.toLowerCase()) {
      return res.status(400).json({ error: 'You cannot transfer money to yourself.' });
    }

    // Check sufficient balance
    if (sender.balance < transferAmount) {
      return res.status(400).json({
        error: `Insufficient balance. Your current balance is ₹${sender.balance.toFixed(2)}.`
      });
    }

    // Fetch receiver
    const { data: receiver, error: receiverError } = await supabase
      .from('users')
      .select('id, name, email, balance')
      .eq('email', receiver_email.toLowerCase().trim())
      .single();

    if (receiverError || !receiver) {
      return res.status(404).json({ error: 'Receiver not found. Please check the email address.' });
    }

    // Calculate new balances
    const newSenderBalance = parseFloat((sender.balance - transferAmount).toFixed(2));
    const newReceiverBalance = parseFloat((receiver.balance + transferAmount).toFixed(2));

    // Update sender balance
    const { error: senderUpdateError } = await supabase
      .from('users')
      .update({ balance: newSenderBalance })
      .eq('id', senderId);

    if (senderUpdateError) {
      console.error('Sender update error:', senderUpdateError);
      return res.status(500).json({ error: 'Transfer failed. Please try again.' });
    }

    // Update receiver balance
    const { error: receiverUpdateError } = await supabase
      .from('users')
      .update({ balance: newReceiverBalance })
      .eq('id', receiver.id);

    if (receiverUpdateError) {
      // Rollback sender balance
      await supabase.from('users').update({ balance: sender.balance }).eq('id', senderId);
      console.error('Receiver update error:', receiverUpdateError);
      return res.status(500).json({ error: 'Transfer failed. Please try again.' });
    }

    // Insert DEBIT transaction for sender
    const { error: debitError } = await supabase
      .from('transactions')
      .insert([{
        sender_id: senderId,
        receiver_id: receiver.id,
        amount: transferAmount,
        transaction_type: 'debit',
        balance_after: newSenderBalance
      }]);

    // Insert CREDIT transaction for receiver
    const { error: creditError } = await supabase
      .from('transactions')
      .insert([{
        sender_id: senderId,
        receiver_id: receiver.id,
        amount: transferAmount,
        transaction_type: 'credit',
        balance_after: newReceiverBalance
      }]);

    if (debitError || creditError) {
      console.error('Transaction insert error:', debitError || creditError);
      // Balances already updated, just log the error
    }

    res.status(200).json({
      message: `₹${transferAmount.toFixed(2)} transferred successfully to ${receiver.name}!`,
      newBalance: newSenderBalance
    });
  } catch (err) {
    console.error('Transfer error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// GET /api/users - get all users except current user (for recipient search)
export const getAllUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email')
      .neq('id', req.user.id)
      .order('name', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Error fetching users.' });
    }

    res.status(200).json({ users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
