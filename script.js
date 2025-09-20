// Mobile Navigation Toggle and Main JavaScript Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const modal = document.getElementById('applicationModal');
    const closeModal = document.querySelector('.close');
    const basvurBtn = document.getElementById('basvur-btn');
    const applicationForm = document.getElementById('applicationForm');
    const contactFormBtn = document.getElementById('contact-form-btn');

    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed header
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Application Modal functionality
    if (basvurBtn && modal) {
        basvurBtn.addEventListener('click', function() {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    }

    if (closeModal && modal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Close modal when clicking outside
    if (modal) {
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Form submission
    if (applicationForm) {
        applicationForm.addEventListener('submit', function(e) {
            e.preventDefault();
           
            const formData = new FormData(applicationForm);
            const data = {};
           
            // Process regular form fields
            for (let [key, value] of formData.entries()) {
                if (key !== 'passport' && key !== 'cv' && key !== 'certificates' && key !== 'otherDocuments') {
                    data[key] = value;
                }
            }
           
            // Process files
            processFileUploads(formData).then(files => {
                // Add metadata
                data.timestamp = new Date().toISOString();
                data.id = generateId();
                data.status = 'pending';
                data.files = files;
               
                // Validate files
                const validationErrors = validateFiles(files);
                if (validationErrors.length > 0) {
                    alert('Dosya hatası:\n' + validationErrors.join('\n'));
                    return;
                }
               
                // Store in localStorage for now (will be replaced with backend)
                storeApplication(data);
               
                // Show success message
                showSuccessMessage();
               
                // Close modal and reset form
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                applicationForm.reset();
                clearFilePreview();
            }).catch(error => {
                console.error('File processing error:', error);
                alert('Dosya yüklenirken hata oluştu. Lütfen tekrar deneyin.');
            });
        });
    }

    // Contact form button (opens the same modal as "HEMEN BAŞVUR")
    if (contactFormBtn && modal) {
        contactFormBtn.addEventListener('click', function() {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    // FAQ Accordion functionality
    setupFAQAccordion();

    // File upload handling
    setupFileUploadHandlers();
   
    // Social media click tracking
    document.querySelectorAll('.social-link').forEach(link => {
        link.addEventListener('click', function() {
            const platform = this.classList.contains('instagram') ? 'instagram' :
                           this.classList.contains('tiktok') ? 'tiktok' :
                           this.classList.contains('facebook') ? 'facebook' : 'other';
            trackSocialClick(platform);
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .process-step, .opportunity-card, .guide-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Header scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        const header = document.querySelector('.header');
       
        if (header) {
            if (currentScroll > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.background = '#fff';
                header.style.backdropFilter = 'none';
            }
        }
       
        lastScroll = currentScroll;
    });

    // Track page view when page loads
    trackPageView();
    
    // Initialize job search and filtering
    initializeJobSearch();
});

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function storeApplication(data) {
    let applications = JSON.parse(localStorage.getItem('applications') || '[]');
    applications.push(data);
    localStorage.setItem('applications', JSON.stringify(applications));
   
    // Also store analytics data
    updateAnalytics();
}

function updateAnalytics() {
    let analytics = JSON.parse(localStorage.getItem('analytics') || '{}');
    const today = new Date().toDateString();
   
    if (!analytics.dailyApplications) {
        analytics.dailyApplications = {};
    }
   
    if (!analytics.dailyApplications[today]) {
        analytics.dailyApplications[today] = 0;
    }
   
    analytics.dailyApplications[today]++;
    analytics.totalApplications = (analytics.totalApplications || 0) + 1;
    analytics.lastUpdated = new Date().toISOString();
   
    localStorage.setItem('analytics', JSON.stringify(analytics));
}

// Enhanced message display functions
function showSuccessMessage() {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <h3>Başvurunuz Alındı!</h3>
            <p>En kısa sürede size dönüş yapacağız.</p>
        </div>
    `;
   
    // Add styles
    successDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 3000;
    `;
   
    const content = successDiv.querySelector('.success-content');
    content.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 15px;
        text-align: center;
        max-width: 400px;
        margin: 0 1rem;
    `;
   
    const icon = content.querySelector('i');
    icon.style.cssText = `
        font-size: 4rem;
        color: #4caf50;
        margin-bottom: 1rem;
    `;
   
    const title = content.querySelector('h3');
    title.style.cssText = `
        color: #2c3e50;
        margin-bottom: 0.5rem;
        font-size: 1.5rem;
    `;
   
    const text = content.querySelector('p');
    text.style.cssText = `
        color: #666;
        margin-bottom: 1rem;
    `;
   
    document.body.appendChild(successDiv);
   
    // Remove after 3 seconds
    setTimeout(() => {
        if (document.body.contains(successDiv)) {
            document.body.removeChild(successDiv);
        }
    }, 3000);
}

// Social Media Analytics (basic tracking)
function trackSocialClick(platform) {
    let socialAnalytics = JSON.parse(localStorage.getItem('socialAnalytics') || '{}');
    const today = new Date().toDateString();
   
    if (!socialAnalytics[today]) {
        socialAnalytics[today] = {};
    }
   
    if (!socialAnalytics[today][platform]) {
        socialAnalytics[today][platform] = 0;
    }
   
    socialAnalytics[today][platform]++;
    localStorage.setItem('socialAnalytics', JSON.stringify(socialAnalytics));
}

// Page view tracking
function trackPageView() {
    let pageViews = JSON.parse(localStorage.getItem('pageViews') || '{}');
    const today = new Date().toDateString();
   
    if (!pageViews[today]) {
        pageViews[today] = 0;
    }
   
    pageViews[today]++;
    localStorage.setItem('pageViews', JSON.stringify(pageViews));
}

// Contact form validation
function validateForm(formData) {
    const errors = [];
   
    if (!formData.name || formData.name.length < 2) {
        errors.push('Ad soyad en az 2 karakter olmalıdır.');
    }
   
    if (!formData.email || !isValidEmail(formData.email)) {
        errors.push('Geçerli bir e-posta adresi giriniz.');
    }
   
    if (!formData.phone || formData.phone.length < 10) {
        errors.push('Geçerli bir telefon numarası giriniz.');
    }
   
    return errors;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Export functions for admin panel (if accessed directly)
window.getApplications = function() {
    return JSON.parse(localStorage.getItem('applications') || '[]');
};

window.getAnalytics = function() {
    return JSON.parse(localStorage.getItem('analytics') || '{}');
};

window.getSocialAnalytics = function() {
    return JSON.parse(localStorage.getItem('socialAnalytics') || '{}');
};

window.getPageViews = function() {
    return JSON.parse(localStorage.getItem('pageViews') || '{}');
};

// File Upload Functions
function setupFileUploadHandlers() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
   
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            handleFileSelection(this);
        });
    });
}

function handleFileSelection(input) {
    const files = Array.from(input.files);
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    const validFiles = [];
    const errors = [];
   
    files.forEach((file, index) => {
        if (file.size > maxSize) {
            errors.push(`${file.name} çok büyük (Max: 5MB)`);
        } else {
            validFiles.push(file);
        }
    });
   
    if (errors.length > 0) {
        alert('Dosya hatası:\n' + errors.join('\n'));
        input.value = ''; // Clear the input
        return;
    }
   
    // Show file preview
    showFilePreview(input, validFiles);
}

function showFilePreview(input, files) {
    // Remove existing preview
    const existingPreview = input.parentNode.querySelector('.file-list');
    if (existingPreview) {
        existingPreview.remove();
    }
   
    if (files.length === 0) return;
   
    const preview = document.createElement('div');
    preview.className = 'file-list show';
   
    files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
       
        const fileInfo = document.createElement('div');
        fileInfo.innerHTML = `
            <span class="file-name">${file.name}</span>
            <span class="file-size">(${formatFileSize(file.size)})</span>
        `;
       
        const removeBtn = document.createElement('button');
        removeBtn.className = 'file-remove';
        removeBtn.textContent = 'Kaldır';
        removeBtn.type = 'button';
        removeBtn.addEventListener('click', function() {
            removeFileFromInput(input, index);
        });
       
        fileItem.appendChild(fileInfo);
        fileItem.appendChild(removeBtn);
        preview.appendChild(fileItem);
    });
   
    input.parentNode.appendChild(preview);
   
    // Add upload info
    const info = document.createElement('div');
    info.className = 'file-upload-info';
    info.innerHTML = `<i class="fas fa-check-circle"></i> ${files.length} dosya seçildi`;
    input.parentNode.appendChild(info);
}

function removeFileFromInput(input, indexToRemove) {
    const dt = new DataTransfer();
    const files = Array.from(input.files);
   
    files.forEach((file, index) => {
        if (index !== indexToRemove) {
            dt.items.add(file);
        }
    });
   
    input.files = dt.files;
    handleFileSelection(input);
}

function clearFilePreview() {
    const previews = document.querySelectorAll('.file-list');
    const infos = document.querySelectorAll('.file-upload-info');
   
    previews.forEach(preview => preview.remove());
    infos.forEach(info => info.remove());
}

function processFileUploads(formData) {
    return new Promise((resolve, reject) => {
        const files = {
            passport: [],
            cv: [],
            certificates: [],
            otherDocuments: []
        };
       
        const fileFields = ['passport', 'cv', 'certificates', 'otherDocuments'];
        let processedCount = 0;
       
        fileFields.forEach(fieldName => {
            const fileList = formData.getAll(fieldName);
           
            if (fileList.length === 0) {
                processedCount++;
                if (processedCount === fileFields.length) {
                    resolve(files);
                }
                return;
            }
           
            fileList.forEach((file, index) => {
                if (file.size > 0) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        files[fieldName].push({
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            data: e.target.result,
                            uploadDate: new Date().toISOString()
                        });
                       
                        processedCount++;
                        if (processedCount === getTotalFileCount(formData)) {
                            resolve(files);
                        }
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                } else {
                    processedCount++;
                    if (processedCount === getTotalFileCount(formData)) {
                        resolve(files);
                    }
                }
            });
        });
       
        // If no files to process
        if (getTotalFileCount(formData) === 0) {
            resolve(files);
        }
    });
}

function getTotalFileCount(formData) {
    const fileFields = ['passport', 'cv', 'certificates', 'otherDocuments'];
    let count = 0;
   
    fileFields.forEach(fieldName => {
        const fileList = formData.getAll(fieldName);
        fileList.forEach(file => {
            if (file.size > 0) count++;
        });
    });
   
    return count;
}

function validateFiles(files) {
    const errors = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
   
    // Check if required passport file is uploaded
    if (!files.passport || files.passport.length === 0) {
        errors.push('Pasaport/Kimlik fotoğrafı zorunludur.');
    }
   
    // Validate all files
    Object.keys(files).forEach(category => {
        files[category].forEach(file => {
            if (file.size > maxSize) {
                errors.push(`${file.name} çok büyük (Max: 5MB)`);
            }
        });
    });
   
    return errors;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
   
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
   
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// FAQ Accordion functionality
function setupFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
   
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', function() {
                // Close all other FAQ items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
               
                // Toggle current item
                item.classList.toggle('active');
            });
        }
    });
}

// Job Search and Filtering Functions
function initializeJobSearch() {
    const searchInput = document.getElementById('jobSearch');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterJobs();
        });
    }
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            filterJobs();
        });
    });
}

function filterJobs() {
    const searchTerm = document.getElementById('jobSearch')?.value.toLowerCase() || '';
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const jobCards = document.querySelectorAll('.opportunity-card');
    
    let visibleCount = 0;
    
    jobCards.forEach(card => {
        const category = card.dataset.category || '';
        const country = card.dataset.country || '';
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const description = card.querySelector('.job-description')?.textContent.toLowerCase() || '';
        const location = card.querySelector('.job-location')?.textContent.toLowerCase() || '';
        
        // Check if card matches search term
        const matchesSearch = searchTerm === '' || 
            title.includes(searchTerm) || 
            description.includes(searchTerm) || 
            location.includes(searchTerm) ||
            country.includes(searchTerm);
        
        // Check if card matches filter
        const matchesFilter = activeFilter === 'all' || category === activeFilter;
        
        // Show or hide card
        if (matchesSearch && matchesFilter) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.5s ease forwards';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show "no results" message if needed
    showNoResultsMessage(visibleCount === 0);
}

function showNoResultsMessage(show) {
    let noResultsDiv = document.querySelector('.no-results-message');
    
    if (show && !noResultsDiv) {
        noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'no-results-message';
        noResultsDiv.innerHTML = `
            <div class="no-results-content">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--neutral-gray-400); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--neutral-gray-600); margin-bottom: 0.5rem;">Aradığınız kriterlere uygun iş bulunamadı</h3>
                <p style="color: var(--neutral-gray-500);">Farklı anahtar kelimeler deneyin veya filtreleri değiştirin</p>
                <button class="btn-secondary" onclick="clearSearch()" style="margin-top: 1rem;">
                    <i class="fas fa-refresh"></i>
                    Aramayı Temizle
                </button>
            </div>
        `;
        noResultsDiv.style.cssText = `
            grid-column: 1 / -1;
            text-align: center;
            padding: 3rem;
            background: var(--neutral-white);
            border-radius: 16px;
            border: 2px dashed var(--neutral-gray-200);
        `;
        
        const grid = document.querySelector('.opportunities-grid');
        if (grid) {
            grid.appendChild(noResultsDiv);
        }
    } else if (!show && noResultsDiv) {
        noResultsDiv.remove();
    }
}

function clearSearch() {
    const searchInput = document.getElementById('jobSearch');
    const allFilter = document.querySelector('.filter-btn[data-filter="all"]');
    
    if (searchInput) {
        searchInput.value = '';
    }
    
    if (allFilter) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        allFilter.classList.add('active');
    }
    
    filterJobs();
}

// Enhanced application modal function
function openApplicationModal(jobCategory = '') {
    const modal = document.getElementById('applicationModal');
    const experienceSelect = document.getElementById('experience');
    
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Pre-select experience field if category is provided
        if (jobCategory && experienceSelect) {
            experienceSelect.value = jobCategory;
        }
        
        // Add some animation
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.transform = 'scale(0.7)';
            modalContent.style.opacity = '0';
            
            setTimeout(() => {
                modalContent.style.transition = 'all 0.3s ease';
                modalContent.style.transform = 'scale(1)';
                modalContent.style.opacity = '1';
            }, 10);
        }
    }
}

// Add this to global scope for HTML onclick handlers
window.openApplicationModal = openApplicationModal;