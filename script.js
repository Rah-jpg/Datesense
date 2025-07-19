// DOM Elements
const itemForm = document.getElementById('itemForm');
const itemsContainer = document.getElementById('itemsContainer');
const filterButtons = document.querySelectorAll('#filterControls button');

// Sample Data (Will replace with localStorage later)
let items = [];

// Form Submission
itemForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const itemName = document.getElementById('itemName').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const itemCategory = document.getElementById('itemCategory').value;
    
    if (!itemName || !expiryDate) {
        alert('Please fill all fields');
        return;
    }
    
    const newItem = {
        id: Date.now(),
        name: itemName,
        expiry: expiryDate,
        category: itemCategory,
        added: new Date().toISOString()
    };
    
    items.push(newItem);
    saveItems();
    renderItems();
    itemForm.reset();
});

// Save to localStorage
function saveItems() {
    localStorage.setItem('dateSenseItems', JSON.stringify(items));
}

// Load from localStorage
function loadItems() {
    const storedItems = localStorage.getItem('dateSenseItems');
    if (storedItems) {
        items = JSON.parse(storedItems);
    }
}

// Render Items
function renderItems(filter = 'all') {
    itemsContainer.innerHTML = '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let filteredItems = items;
    
    if (filter === 'expiring') {
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        filteredItems = items.filter(item => {
            const expiry = new Date(item.expiry);
            return expiry >= today && expiry <= nextWeek;
        });
    } else if (filter === 'expired') {
        filteredItems = items.filter(item => {
            const expiry = new Date(item.expiry);
            return expiry < today;
        });
    }
    
    filteredItems.forEach(item => {
        const expiry = new Date(item.expiry);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        
        if (diffDays <= 0) {
            itemCard.classList.add('expired');
        } else if (diffDays <= 7) {
            itemCard.classList.add('expiring');
        }
        
        itemCard.innerHTML = `
            <h3>${item.name}</h3>
            <span class="category">${item.category}</span>
            <p class="expiry-date">Expires: ${expiry.toDateString()}</p>
            <span class="days-left">
                ${diffDays <= 0 ? 'Expired' : `${diffDays} days left`}
            </span>
            <button class="delete-btn" data-id="${item.id}">Delete</button>
        `;
        
        itemsContainer.appendChild(itemCard);
    });
    
    // Add delete event listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            items = items.filter(item => item.id !== id);
            saveItems();
            renderItems();
        });
    });
}

// Filter Buttons
filterButtons.forEach(button => {
    button.addEventListener('click', function() {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        renderItems(this.getAttribute('data-filter'));
    });
});

// Initialize
loadItems();
renderItems();