// DOM Elements
const itemForm = document.getElementById('itemForm');
const itemsContainer = document.getElementById('itemsContainer');
const filterButtons = document.querySelectorAll('.filter-btn');

let currentFilter = 'all';

// Form Submission
if (itemForm) {
  itemForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = itemForm['itemName'].value;
    const expiry = itemForm['expiryDate'].value;
    const category = itemForm['itemCategory'].value;
    
    if (!name || !expiry) {
      alert('Please fill all fields');
      return;
    }
    
    // Get current user
    const user = auth.currentUser;
    if (!user) return;
    
    // Add to Firestore
    db.collection('items').add({
      name: name,
      expiry: expiry,
      category: category,
      userId: user.uid,
      added: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      itemForm.reset();
    })
    .catch(err => {
      console.error("Error adding item: ", err);
    });
  });
}

// Filter Buttons
filterButtons.forEach(btn => {
  btn.addEventListener('click', function() {
    filterButtons.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentFilter = this.dataset.filter;
    renderItems();
  });
});

// Render Items
function renderItems() {
  const user = auth.currentUser;
  if (!user) return;
  
  let query = db.collection('items')
    .where('userId', '==', user.uid)
    .orderBy('expiry');
  
  if (currentFilter === 'expiring') {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    query = query.where('expiry', '>=', today.toISOString().split('T')[0])
                .where('expiry', '<=', nextWeek.toISOString().split('T')[0]);
  } else if (currentFilter === 'expired') {
    const today = new Date();
    query = query.where('expiry', '<', today.toISOString().split('T')[0]);
  }
  
  query.onSnapshot(snapshot => {
    itemsContainer.innerHTML = '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    snapshot.forEach(doc => {
      const item = doc.data();
      const expiryDate = new Date(item.expiry);
      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const itemCard = document.createElement('div');
      itemCard.className = 'item-card';
      itemCard.dataset.category = item.category;
      
      if (diffDays <= 0) {
        itemCard.classList.add('expired');
      } else if (diffDays <= 7) {
        itemCard.classList.add('expiring');
      }
      
      let daysLeftClass = 'safe';
      let statusText = `${diffDays} days left`;
      
      if (diffDays <= 0) {
        daysLeftClass = 'danger';
        statusText = 'Expired!';
      } else if (diffDays <= 3) {
        daysLeftClass = 'warning';
      }
      
      itemCard.innerHTML = `
        <h3>${item.name}</h3>
        <span class="category-badge ${item.category}">${item.category}</span>
        <p class="expiry-date">Expires: ${expiryDate.toDateString()}</p>
        <span class="days-left ${daysLeftClass}">${statusText}</span>
        <div class="item-actions">
          <button class="btn btn-danger" onclick="deleteItem('${doc.id}')">Delete</button>
        </div>
      `;
      
      itemsContainer.appendChild(itemCard);
    });
  });
}

// Delete Item
function deleteItem(itemId) {
  if (confirm('Are you sure you want to delete this item?')) {
    db.collection('items').doc(itemId).delete()
      .catch(err => {
        console.error("Error deleting item: ", err);
      });
  }
}

// Initialize
auth.onAuthStateChanged(user => {
  if (user) {
    renderItems();
  }
});