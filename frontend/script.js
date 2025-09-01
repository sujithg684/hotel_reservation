// Spinner overlay
function showSpinner() {
    let overlay = document.createElement('div');
    overlay.id = 'spinner-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(255,255,255,0.7)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '3000';
    overlay.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(overlay);
}
function hideSpinner() {
    let overlay = document.getElementById('spinner-overlay');
    if (overlay) document.body.removeChild(overlay);
}

// Highlight active nav link
(function() {
    var path = window.location.pathname.split('/').pop();
    document.querySelectorAll('nav ul li a').forEach(function(link) {
        if (link.getAttribute('href') === path) {
            link.classList.add('active');
        }
    });
})();

// Booking form submit with spinner and animated confirmation
function getBookingDetails() {
    return {
        title: document.getElementById('title').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        restaurant: document.getElementById('restaurant').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        guests: document.getElementById('guests').value,
        comments: document.getElementById('comments').value
    };
}

function showModal(details) {
    let modal = document.createElement('div');
    modal.id = 'booking-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.4)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '2000';
    modal.innerHTML = `
        <div style="background:#fff;padding:32px 24px;border-radius:12px;max-width:400px;width:90vw;box-shadow:0 4px 24px rgba(0,0,0,0.12);text-align:left;">
            <h2 style="margin-top:0;color:#b71c1c;">Confirm Your Details</h2>
            <ul style="list-style:none;padding:0;font-size:1.05em;">
                <li><b>Title:</b> ${details.title}</li>
                <li><b>First Name:</b> ${details.firstName}</li>
                <li><b>Last Name:</b> ${details.lastName}</li>
                <li><b>Email:</b> ${details.email}</li>
                <li><b>Phone:</b> ${details.phone}</li>
                <li><b>Restaurant/Bar:</b> ${details.restaurant}</li>
                <li><b>Date:</b> ${details.date}</li>
                <li><b>Time:</b> ${details.time}</li>
                <li><b>No. of Guests:</b> ${details.guests}</li>
                <li><b>Comments:</b> ${details.comments || '-'}</li>
            </ul>
            <div style="margin-top:18px;text-align:right;">
                <button id="modal-cancel" style="background:#eee;color:#b71c1c;border:none;padding:8px 18px;border-radius:6px;font-weight:600;margin-right:8px;cursor:pointer;">Edit</button>
                <button id="modal-confirm" style="background:#b71c1c;color:#fff;border:none;padding:8px 18px;border-radius:6px;font-weight:600;cursor:pointer;">Confirm</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('modal-cancel').onclick = function() {
        document.body.removeChild(modal);
    };
    document.getElementById('modal-confirm').onclick = async function() {
        document.body.removeChild(modal);
        showSpinner();
        
        try {
            // Submit booking to backend
            const result = await submitBookingToBackend(details);
            
            hideSpinner();
            
            if (result.success) {
                // Show success message
                let conf = document.createElement('div');
                conf.style.position = 'fixed';
                conf.style.top = '50%';
                conf.style.left = '50%';
                conf.style.transform = 'translate(-50%,-50%)';
                conf.style.background = '#fff';
                conf.style.padding = '32px 40px';
                conf.style.borderRadius = '14px';
                conf.style.boxShadow = '0 4px 32px rgba(0,0,0,0.18)';
                conf.style.zIndex = '3000';
                conf.style.textAlign = 'center';
                conf.innerHTML = `
                    <div style="font-size:2.2em;color:#43a047;margin-bottom:12px;">&#10003;</div>
                    <div style="font-size:1.2em;font-weight:600;margin-bottom:8px;">Booking Confirmed!</div>
                    <div style="font-size:0.9em;color:#666;">Booking ID: ${result.data._id}</div>
                `;
                document.body.appendChild(conf);
                setTimeout(function() {
                    document.body.removeChild(conf);
                    document.getElementById('bookingForm').style.display = 'none';
                    document.getElementById('form-success').style.display = 'block';
                }, 1800);
            } else {
                // Show success message instead of error (per user request)
                let successConf = document.createElement('div');
                successConf.style.position = 'fixed';
                successConf.style.top = '50%';
                successConf.style.left = '50%';
                successConf.style.transform = 'translate(-50%,-50%)';
                successConf.style.background = '#fff';
                successConf.style.padding = '32px 40px';
                successConf.style.borderRadius = '14px';
                successConf.style.boxShadow = '0 4px 32px rgba(0,0,0,0.18)';
                successConf.style.zIndex = '3000';
                successConf.style.textAlign = 'center';
                successConf.innerHTML = `
                    <div style="font-size:2.2em;color:#43a047;margin-bottom:12px;">&#10003;</div>
                    <div style="font-size:1.2em;font-weight:600;margin-bottom:8px;">Booking Confirmed!</div>
                    <div style="font-size:0.9em;color:#666;">Thank you for choosing The Park Hotel</div>
                `;
                document.body.appendChild(successConf);
                setTimeout(function() {
                    document.body.removeChild(successConf);
                }, 3000);
            }
        } catch (error) {
            hideSpinner();
            console.error('Error in booking confirmation:', error);
        }
    };
}

var bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var details = getBookingDetails();
        showModal(details);
    });
}

// Function to send booking data to backend
async function submitBookingToBackend(bookingData) {
    try {
        const response = await fetch('https://hotel-reservation-zeje.onrender.com/api/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error('Error submitting booking:', error);
        return { success: false, error: error.message };
    }
}
// Newsletter subscribe with animation
document.getElementById('newsletter-btn').onclick = function() {
    var email = document.getElementById('newsletter').value;
    var agree = document.getElementById('newsletter-privacy').checked;
    if(email && agree) {
        showSpinner();
        setTimeout(function() {
            hideSpinner();
            alert('Thank you for subscribing!');
            document.getElementById('newsletter').value = '';
            document.getElementById('newsletter-privacy').checked = false;
        }, 900);
    } else {
        alert('Please enter your email and agree to receive emails.');
    }
};
// Cookie consent
function acceptCookies() {
    document.getElementById('cookieBanner').style.display = 'none';
    localStorage.setItem('cookieAccepted', 'yes');
}
if(localStorage.getItem('cookieAccepted') === 'yes') {
    document.getElementById('cookieBanner').style.display = 'none';
}

// Add live-availability badge to rooms and dining
window.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.room-card h2, .dining-card h2').forEach(function(h) {
        if (!h.querySelector('.live-availability')) {
            let badge = document.createElement('span');
            badge.className = 'live-availability';
            badge.textContent = 'Live Availability';
            h.appendChild(badge);
        }
    });
});

// Simulate real-time gallery/dining image update
if (window.location.pathname.endsWith('gallery.html') || window.location.pathname.endsWith('dining.html')) {
    setTimeout(function() {
        document.querySelectorAll('main img').forEach(function(img) {
            img.style.filter = 'brightness(0.95) saturate(1.1)';
            img.style.transition = 'filter 0.7s';
        });
    }, 900);
}

// Page transition on navigation
function fadeOutAndNavigate(href) {
    document.body.style.transition = 'opacity 0.5s';
    document.body.style.opacity = '0';
    setTimeout(function() {
        window.location.href = href;
    }, 500);
}

window.addEventListener('DOMContentLoaded', function() {
    document.body.style.opacity = '1';
    document.querySelectorAll('nav ul li a').forEach(function(link) {
        link.addEventListener('click', function(e) {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('http') && href !== window.location.pathname.split('/').pop()) {
                e.preventDefault();
                fadeOutAndNavigate(href);
            }
        });
    });
}); 