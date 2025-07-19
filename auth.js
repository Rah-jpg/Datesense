document.addEventListener('DOMContentLoaded', function() {
  // Initialize elements
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  
  // Registration handler
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const statusDiv = document.getElementById('registerStatus');
      statusDiv.innerHTML = '<p class="status-loading">Creating account...</p>';

      try {
        const userCred = await auth.createUserWithEmailAndPassword(
          registerForm['registerEmail'].value,
          registerForm['registerPassword'].value
        );
        
        await db.collection('users').doc(userCred.user.uid).set({
          name: registerForm['registerName'].value,
          email: registerForm['registerEmail'].value,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        statusDiv.innerHTML = '<p class="status-success">Registration successful! Redirecting...</p>';
        setTimeout(() => window.location.href = 'home.html', 1500);
      } catch (error) {
        let message = "Registration failed. Please try again.";
        if (error.code === 'auth/email-already-in-use') message = "Email already registered";
        if (error.code === 'auth/weak-password') message = "Password must be 6+ characters";
        statusDiv.innerHTML = `<p class="status-error">${message}</p>`;
      }
    });
  }

  // Login handler
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const statusDiv = document.getElementById('loginStatus');
      statusDiv.innerHTML = '<p class="status-loading">Logging in...</p>';

      try {
        await auth.signInWithEmailAndPassword(
          loginForm['loginEmail'].value,
          loginForm['loginPassword'].value
        );
        statusDiv.innerHTML = '<p class="status-success">Login successful! Redirecting...</p>';
        setTimeout(() => window.location.href = 'home.html', 1500);
      } catch (error) {
        let message = "Login failed. Please try again.";
        if (error.code === 'auth/wrong-password') message = "Incorrect password";
        if (error.code === 'auth/user-not-found') message = "Email not registered";
        statusDiv.innerHTML = `<p class="status-error">${message}</p>`;
      }
    });
  }
});
// Registration function mein loading state
registerForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  // Disable button during processing
  const submitBtn = registerForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Processing...';
  
  try {
    // ... existing registration code ...
  } catch (error) {
    // ... error handling ...
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Register';
  }
});

// Login function mein bhi same
loginForm.addEventListener('submit', async function(e) {
  // ... same pattern ...
});
// Successful registration/login par
statusDiv.innerHTML = '<p class="status-success">Success! Redirecting...</p>';

// 1.5 second ke baad redirect
setTimeout(() => {
  // Check if user needs to complete profile
  if (userCred.user.displayName) {
    window.location.href = 'dashboard.html';
  } else {
    window.location.href = 'complete-profile.html'; 
  }
}, 1500);
// Logout function with proper error handling
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function() {
      try {
        // Show loading state
        logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
        logoutBtn.disabled = true;
        
        // Perform logout
        await auth.signOut();
        
        // Redirect after successful logout
        window.location.href = 'login.html';
        
      } catch (error) {
        console.error("Logout failed:", error);
        alert("Logout failed. Please try again.");
        
        // Reset button state
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.disabled = false;
      }
    });
  }
}

// Auth state listener mein initialize karein
auth.onAuthStateChanged(user => {
  if (user) {
    setupLogout(); // Logout button initialize
    // ... existing user handling code ...
  } else {
    // ... existing redirect code ...
  }
});
