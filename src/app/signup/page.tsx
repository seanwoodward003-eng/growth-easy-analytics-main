const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccess(false);

  const email = e.currentTarget.email.value.trim().toLowerCase();

  if (!email || !email.includes('@')) {
    setError('Please enter a valid email address');
    setLoading(false);
    return;
  }

  try {
    const res = await fetch('https://growth-easy-analytics-2.onrender.com/api/signup', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        consent: true,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Signup failed — please try again');
    }

    setSuccess(true);

    if (data.redirect) {
      window.location.href = data.redirect;
    } else {
      window.location.href = '/dashboard';
    }

  } catch (err: any) {
    setError(err.message || 'Network error');
    console.error('Signup error:', err);
  } finally {
    setLoading(false);
  }
};